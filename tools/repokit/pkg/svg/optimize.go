package svg

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	commands_pkg "repokit/pkg/commands" // Aliased for clarity
	"repokit/pkg/core"
	"os/signal"
	"reflect" // Added for robust type name extraction
	"strconv" // Added for parsing numbers from SVG attributes
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"github.com/charmbracelet/lipgloss"
	svg_parser "github.com/rustyoz/svg" // Alias to avoid conflict with package name "svg"
	"github.com/tdewolff/minify/v2"
	svg_minifier "github.com/tdewolff/minify/v2/svg" // Alias to avoid conflict
)

// Declare package-level LLMConfig for optimizer commands
var svgLLMConfig *commands_pkg.LLMConfig

// SetLLMConfig sets the package-level LLM configuration.
func SetLLMConfig(cfg *commands_pkg.LLMConfig) {
	svgLLMConfig = cfg
}

// ─── Constants & Styling ────────────────────────────────────────────────────

const (
	maxWorkers = 8
	uiTickRate = 80 * time.Millisecond
	pathMaxLen = 60
	epsilon    = 0.025 // RDP tolerance (tighter for production)
	snapAngle  = 0.012 // Radians (~0.7 degrees)
	precision  = 2     // Decimal places for quantization
)

var (
	tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	blueStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("4")) // Corrected
	goldStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("3"))

	pathTagRegex     = regexp.MustCompile(`(?i)d="([^"]+)"`)
	polygonTagRegex  = regexp.MustCompile(`(?i)points="([^"]+)"`)
	polylineTagRegex = regexp.MustCompile(`(?i)points="([^"]+)"`)
)

// ─── Types & Logic ──────────────────────────────────────────────────────────

type Result struct {
	File        string
	Path        string
	Success     bool
	Error       string
	NodesBefore int
	NodesAfter  int
	SizeBefore  int64
	SizeAfter   int64
	LLMAnalysis string // New field for LLM analysis
}

type fileStatus struct {
	path      string
	startTime time.Time
	active    bool
}

type optimizer struct {
	files        []string
	results      []Result
	workerStates []*fileStatus
	minifier     *minify.M

	processed    int32
	successCount int32
	failedCount  int32

	mu sync.Mutex
	wg sync.WaitGroup
}

// ─── Pipeline: The "Mind-Blowing" Implementation ────────────────────────────

// processPathData applies geometric optimizations to an SVG path 'd' attribute.
func processPathData(d string) (optimizedDS string, nodesBefore int, nodesAfter int) {
	// 1. Lexing: Tokenize the 'd' attribute into high-level commands
	commands := ParsePath(d)
	nodesBefore = len(commands)

	// 2. Geometric Extraction: Convert to world-space vectors
	// We handle curves by sampling points along the spline
	points := ToAbsolutePoints(commands)

	// 3. Mathematical Decimation (RDP Pass)
	// Removes redundant data points while preserving geometric intent
	beautified := SimplifyPath(points, epsilon)

	// 4. Primitive Analysis & Recovery
	// If the points describe a circular arc, we could replace with an arc command
	// For now, we perform regularization on the decimated set
	beautified = SnapPointsToAxes(beautified, snapAngle)

	// 5. Intelligent Serialization
	// The Geometer now calculates the entropy of Absolute vs Relative pathing
	// and picks the byte-optimal representation for every segment.
	newD := FormatPathData(beautified, precision)

	return newD, nodesBefore, len(beautified)
}

// buildSVGDescriptionPrompt creates a prompt for the LLM based on SVG elements.
func buildSVGDescriptionPrompt(svgAST *svg_parser.Svg) string {
	var sb strings.Builder
	sb.WriteString("Describe the visual content and purpose of this SVG:\n")
	sb.WriteString(fmt.Sprintf("SVG Name: %s, Width: %s, Height: %s, ViewBox: %s\n",
		svgAST.Name, svgAST.Width, svgAST.Height, svgAST.ViewBox))

	if len(svgAST.Groups) > 0 {
		sb.WriteString("Groups:\n")
		for _, g := range svgAST.Groups {
			sb.WriteString(fmt.Sprintf("  - Group ID: %s, Elements: %d\n", g.ID, len(g.Elements)))
		}
	}

	elementCounts := make(map[string]int)
	for _, el := range svgAST.Elements {
		// Use reflect to get the actual type name of the element
		t := reflect.TypeOf(el)
		if t.Kind() == reflect.Ptr {
			t = t.Elem()
		}
		elementCounts[t.Name()]++
	}
	if len(elementCounts) > 0 {
		sb.WriteString("Main Elements:\n")
		for elType, count := range elementCounts {
			sb.WriteString(fmt.Sprintf("  - %s: %d\n", elType, count))
		}
	}

	// Add more details if needed, e.g., for specific paths or shapes.
	// For example, finding the longest path or a complex shape could be interesting.
	// For now, keep it high-level to avoid exceeding context window.

	sb.WriteString("\nWhat does this SVG likely represent or illustrate? Be concise.\n")
	return sb.String()
}

// generateSVGDescription uses an LLM to describe the SVG.
func generateSVGDescription(ctx context.Context, svgAST *svg_parser.Svg) (string, error) {
	if svgLLMConfig == nil || svgLLMConfig.Provider == "" {
		return "", fmt.Errorf("LLM configuration not set for SVG analysis")
	}

	p, err := commands_pkg.NewProvider(svgLLMConfig)
	if err != nil {
		return "", fmt.Errorf("failed to initialize LLM provider: %w", err)
	}

	prompt := buildSVGDescriptionPrompt(svgAST)

	description, err := p.Generate(ctx, prompt) // Pass the context here
	if err != nil {
		return "", fmt.Errorf("LLM generation failed: %w", err)
	}

	return strings.TrimSpace(description), nil
}

// ─── Parallel Pipeline Execution ────────────────────────────────────────────

// Optimize processes SVG files in parallel using rustyoz/svg for parsing
// and tdewolff/minify for minification.
func Optimize(pattern string) error {
	files, err := core.ResolveFiles(pattern)
	if err != nil {
		return err
	}
	if len(files) == 0 {
		return nil
	}

	opt := newOptimizer(files)
	return opt.run()
}

func newOptimizer(files []string) *optimizer {
	m := minify.New()
	m.AddFunc("image/svg+xml", svg_minifier.Minify)

	workerCount := maxWorkers
	if len(files) < workerCount {
		workerCount = len(files)
	}

	states := make([]*fileStatus, workerCount)
	for i := range states {
		states[i] = &fileStatus{}
	}

	return &optimizer{
		files:        files,
		results:      make([]Result, len(files)),
		workerStates: states,
		minifier:     m,
	}
}

func (o *optimizer) run() error {
	tasks := make(chan int, len(o.files))
	for i := range o.files {
		tasks <- i
	}
	close(tasks)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	done := make(chan struct{})
	startTime := time.Now()

	go o.renderUI(startTime, done)

	for i := 0; i < len(o.workerStates); i++ {
		o.wg.Add(1)
		go o.worker(i, ctx, tasks)
	}

	o.wg.Wait()
	close(done)

	if ctx.Err() != nil {
		core.Info(`%s`, goldStyle.Render("Interrupted by user."))
		return ctx.Err()
	}

	return o.report()
}

func (o *optimizer) worker(id int, ctx context.Context, tasks <-chan int) {
	defer o.wg.Done()
	for idx := range tasks {
		select {
		case <-ctx.Done():
			return
		default:
			path := o.files[idx]
			o.updateWorkerState(id, path, true)
			sBefore, sAfter, nb, na, llmAnalysis, err := o.processFile(path)
			o.updateWorkerState(id, "", false)

			o.results[idx] = Result{
				File:        filepath.Base(path),
				Path:        path,
				Success:     err == nil,
				NodesBefore: nb,
				NodesAfter:  na,
				SizeBefore:  sBefore,
				SizeAfter:   sAfter,
				LLMAnalysis: llmAnalysis,
				Error: func() string {
					if err != nil {
						return err.Error()
					}
					return ""
				}(),
			}

			atomic.AddInt32(&o.processed, 1)
			if err != nil {
				atomic.AddInt32(&o.failedCount, 1)
			} else {
				atomic.AddInt32(&o.successCount, 1)
			}
		}
	}
}

func (o *optimizer) processFile(path string) (sizeBefore int64, sizeAfter int64, nodesBefore int, nodesAfter int, llmAnalysis string, err error) {
	input, err := os.ReadFile(path)
	if err != nil {
		return 0, 0, 0, 0, "", err
	}

	sizeBefore = int64(len(input))
	content := string(input)
	nb := 0 // total nodes before geometric optimization
	na := 0 // total nodes after geometric optimization

	// --- LLM Analysis (using rustyoz/svg AST) ---
	parsedSVG, err := svg_parser.ParseSvg(content, filepath.Base(path), 1.0)
	if err != nil {
		// Log error but don't fail entire process, proceed with minification
		core.Error("Failed to parse SVG with rustyoz/svg for LLM analysis: %v", err)
		llmAnalysis = "Failed to generate LLM analysis."
	} else if svgLLMConfig != nil && svgLLMConfig.Provider != "" {
		llmAnalysis, err = generateSVGDescription(context.Background(), parsedSVG)
		if err != nil {
			core.Error("Failed to get LLM analysis for %s: %v", filepath.Base(path), err)
			llmAnalysis = "Failed to generate LLM analysis."
		}
	}

	// --- Geometric Optimization (using our old logic) ---
	// Create a modifiable representation of the SVG content
	var modifiedSVGContent = content

	// 1. Optimize Paths
	modifiedSVGContent = pathTagRegex.ReplaceAllStringFunc(modifiedSVGContent, func(m string) string {
		match := pathTagRegex.FindStringSubmatch(m)
		if len(match) < 2 {
			return m
		}
		d, nodesB, nodesA := processPathData(match[1])
		nb += nodesB
		na += nodesA
		return fmt.Sprintf("d=%q", d)
	})

	// 2. Optimize Polygons/Polylines (they use 'points' attribute)
	modifiedSVGContent = polygonTagRegex.ReplaceAllStringFunc(modifiedSVGContent, func(m string) string {
		match := polygonTagRegex.FindStringSubmatch(m)
		if len(match) < 2 {
			return m
		}
		pointsStr := match[1]
		// Convert points string to []Point
		var points []Point
		coords := regexp.MustCompile(`\s*,\s*|\s+`).Split(strings.TrimSpace(pointsStr), -1)
		for i := 0; i < len(coords); i += 2 {
			if i+1 < len(coords) {
				x, _ := strconv.ParseFloat(coords[i], 64)
				y, _ := strconv.ParseFloat(coords[i+1], 64)
				points = append(points, Point{X: x, Y: y})
			}
		}

		nodesB := len(points)
		// Apply same simplification as paths
		points = SimplifyPath(points, epsilon)
		points = SnapPointsToAxes(points, snapAngle)
		nodesA := len(points)

		nb += nodesB
		na += nodesA

		processedPoints := FormatPointsData(points, precision)
		return fmt.Sprintf("points=%q", processedPoints)
	})

	modifiedSVGContent = polylineTagRegex.ReplaceAllStringFunc(modifiedSVGContent, func(m string) string {
		match := polylineTagRegex.FindStringSubmatch(m)
		if len(match) < 2 {
			return m
		}
		pointsStr := match[1]
		// Convert points string to []Point
		var points []Point
		coords := regexp.MustCompile(`\s*,\s*|\s+`).Split(strings.TrimSpace(pointsStr), -1)
		for i := 0; i < len(coords); i += 2 {
			if i+1 < len(coords) {
				x, _ := strconv.ParseFloat(coords[i], 64)
				y, _ := strconv.ParseFloat(coords[i+1], 64)
				points = append(points, Point{X: x, Y: y})
			}
		}

		nodesB := len(points)
		// Apply same simplification as paths
		points = SimplifyPath(points, epsilon)
		points = SnapPointsToAxes(points, snapAngle)
		nodesA := len(points)

		nb += nodesB
		na += nodesA

		processedPoints := FormatPointsData(points, precision)
		return fmt.Sprintf("points=%q", processedPoints)
	})

	// --- Minify the geometrically optimized content ---
	minified, err := o.minifier.Bytes("image/svg+xml", []byte(modifiedSVGContent))
	if err != nil {
		return sizeBefore, 0, 0, 0, llmAnalysis, fmt.Errorf("failed to minify SVG: %w", err)
	}
	sizeAfter = int64(len(minified))
	info, _ := os.Stat(path)
	mode := os.FileMode(0644)
	if info != nil {
		mode = info.Mode()
	}

	err = os.WriteFile(path, minified, mode)
	return sizeBefore, sizeAfter, nb, na, llmAnalysis, err
}

func (o *optimizer) updateWorkerState(id int, path string, active bool) {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.workerStates[id].path, o.workerStates[id].active, o.workerStates[id].startTime = path, active, time.Now()
}

// UI Rendering for the optimizer
// This was moved from the original svg/ui.go
func (o *optimizer) renderUI(start time.Time, done <-chan struct{}) {
	if os.Getenv("REPOKIT_NESTED") == "1" {
		return
	}
	ticker := time.NewTicker(uiTickRate)
	defer ticker.Stop()
	lines, first, tick := 0, true, 0
	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			if !first {
				fmt.Print(strings.Repeat("\033[A\033[2K", lines))
			}
			first, lines = false, o.drawFrame(start, tick)
			tick++
		}
	}
}

func (o *optimizer) drawFrame(start time.Time, tick int) int {
	o.mu.Lock()
	defer o.mu.Unlock()
	p := atomic.LoadInt32(&o.processed)
	spinner := core.Spinners[tick%len(core.Spinners)]
	fmt.Printf("  %s SVG Optimizer %s [%d/%d] (%.1fs)\n", blueStyle.Render(spinner), goldStyle.Render("MINIFY"), p, len(o.files), time.Since(start).Seconds())
	for _, s := range o.workerStates {
		if !s.active {
			fmt.Println(formatProgressLine(tailStyle.Render("•"), "idle", ""))
		} else {
			icon := blueStyle.Render(spinner)
			fmt.Println(formatProgressLine(icon, s.path, fmt.Sprintf("%.1fs", time.Since(s.startTime).Seconds())))
		}
	}
	return len(o.workerStates) + 1
}

func (o *optimizer) report() error {
	failed := atomic.LoadInt32(&o.failedCount)
	var totalSizeBefore, totalSizeAfter int64
	var totalNodesBefore, totalNodesAfter int

	for _, r := range o.results {
		totalSizeBefore += r.SizeBefore
		totalSizeAfter += r.SizeAfter
		totalNodesBefore += r.NodesBefore
		totalNodesAfter += r.NodesAfter

		if r.LLMAnalysis != "" {
			core.Info("  ┃ " + core.Blue.Render("LLM Analysis for %s:"), r.File)
			core.CustomBox("LLM", r.LLMAnalysis, core.BlueColor)
		}
	}

	if failed == 0 {
		reduction := 0.0
		if totalNodesBefore > 0 {
			reduction = 100 * (1 - float64(totalNodesAfter)/float64(totalNodesBefore))
		}

		sizeReduction := 0.0
		if totalSizeBefore > 0 {
			sizeReduction = 100 * (1 - float64(totalSizeAfter)/float64(totalSizeBefore))
		}

		core.Success("Optimized %d SVG files", len(o.files))
		if totalNodesBefore > 0 {
			core.Info("  ┃ " + blueStyle.Render("Geometric Pass:") + " %d -> %d nodes (%.1f%% density reduction)", totalNodesBefore, totalNodesAfter, reduction)
		}
		core.Info("  ┃ " + goldStyle.Render("Byte Pass:") + "      %s -> %s (%.1f%% reduction)", formatBytes(totalSizeBefore), formatBytes(totalSizeAfter), sizeReduction)
		return nil
	}
	return fmt.Errorf("failed to process %d files", failed)
}

func formatBytes(b int64) string {
	const unit = 1024
	if b < unit {
		return fmt.Sprintf("%d B", b)
	}
	div, exp := int64(unit), 0
	for n := b / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(b)/float64(div), "KMGTPE"[exp])
}

func formatProgressLine(icon, path, suffix string) string {
	clean := core.CleanANSI(path)
	// Use regex for simpler stripping than rune counting
	clean = regexp.MustCompile(`\s+`).ReplaceAllString(clean, " ") // Normalize spaces
	clean = strings.TrimSpace(clean)

	if len(clean) > pathMaxLen {
		clean = "..." + clean[len(clean)-(pathMaxLen-3):]
	}
	return fmt.Sprintf("  %s %-60s %s", icon, clean, tailStyle.Render(suffix))
}