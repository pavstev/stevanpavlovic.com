package svg

import (
	"context"
	"fmt"
	"math"
	"os"
	"os/signal"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"repokit/pkg/cliutils"

	"github.com/charmbracelet/lipgloss"
	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/svg"
)

// ─── Constants & Configuration ───────────────────────────────────────────────

const (
	maxWorkers  = 8
	uiTickRate  = 80 * time.Millisecond
	pathMaxLen  = 60
	epsilon     = 0.05 // RDP tolerance (higher = more aggressive simplification)
	snapAngle   = 0.02 // Radians (~1.1 degrees) for axial snapping
)

var (
	ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)
	tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	blueStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("4"))
	goldStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("3"))

	// Regex for parsing path 'd' attributes in SVG XML
	pathTagRegex = regexp.MustCompile(`(?i)d="([^"]+)"`)
	// Regex to tokenize commands and numeric values (supports scientific notation)
	cmdRegex     = regexp.MustCompile(`([a-df-z])|([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)`)
)

// ─── Types ───────────────────────────────────────────────────────────────────

type Point struct {
	X, Y float64
}

type Command struct {
	Type   rune
	Points []Point
}

type Result struct {
	File        string
	Path        string
	Success     bool
	Error       string
	NodesBefore int
	NodesAfter  int
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

// ─── Core Geometry Logic ─────────────────────────────────────────────────────

// distanceToLine calculates perpendicular distance from Point P to the line defined by segment (A, B)
func distanceToLine(p, a, b Point) float64 {
	dx := b.X - a.X
	dy := b.Y - a.Y
	if dx == 0 && dy == 0 {
		return math.Hypot(p.X-a.X, p.Y-a.Y)
	}
	// Formula: |(y2-y1)x0 - (x2-x1)y0 + x2y1 - y2x1| / sqrt(dx^2 + dy^2)
	num := math.Abs(dy*p.X - dx*p.Y + b.X*a.Y - b.Y*a.X)
	den := math.Sqrt(dx*dx + dy*dy)
	return num / den
}

// simplifyRDP implements the Ramer-Douglas-Peucker algorithm for path decimation.
// It removes nodes that deviate less than epsilon from the simplified segment.
func simplifyRDP(points []Point, epsilon float64) []Point {
	if len(points) < 3 {
		return points
	}

	maxDist := 0.0
	index := 0
	end := len(points) - 1

	for i := 1; i < end; i++ {
		d := distanceToLine(points[i], points[0], points[end])
		if d > maxDist {
			index = i
			maxDist = d
		}
	}

	if maxDist > epsilon {
		res1 := simplifyRDP(points[:index+1], epsilon)
		res2 := simplifyRDP(points[index:], epsilon)
		// Combined result, dropping the overlapping mid-point
		return append(res1[:len(res1)-1], res2...)
	}

	return []Point{points[0], points[end]}
}

// ─── Path Processing ─────────────────────────────────────────────────────────

// processPathData takes a raw 'd' attribute string and performs geometric beautification.
func processPathData(d string) (string, int, int) {
	tokens := cmdRegex.FindAllStringSubmatch(d, -1)
	var commands []Command
	var currentCmd *Command

	// 1. Tokenization & Basic Parsing
	for _, t := range tokens {
		val := t[0]
		if t[1] != "" { // Found a command character (M, L, C, etc.)
			if currentCmd != nil {
				commands = append(commands, *currentCmd)
			}
			currentCmd = &Command{Type: rune(val[0]), Points: []Point{}}
		} else if t[2] != "" { // Found a number
			num, _ := strconv.ParseFloat(val, 64)
			if currentCmd == nil { continue }

			// Simple coordinate pair logic
			if len(currentCmd.Points) == 0 || isPointFull(currentCmd.Type, currentCmd.Points) {
				currentCmd.Points = append(currentCmd.Points, Point{X: num})
			} else {
				currentCmd.Points[len(currentCmd.Points)-1].Y = num
			}
		}
	}
	if currentCmd != nil { commands = append(commands, *currentCmd) }

	nodesBefore := len(commands)

	// 2. Normalization (Convert to Absolute coordinates)
	absPoints := []Point{}
	cursor := Point{0, 0}
	for _, cmd := range commands {
		isRel := cmd.Type >= 'a' && cmd.Type <= 'z'
		for _, p := range cmd.Points {
			target := p
			if isRel {
				target.X += cursor.X
				target.Y += cursor.Y
			}
			absPoints = append(absPoints, target)
			cursor = target
		}
	}

	// 3. Mathematical Beautification (RDP Decimation)
	beautified := simplifyRDP(absPoints, epsilon)
	nodesAfter := len(beautified)

	// 4. Regularization (Angle Snapping for axial alignment)
	for i := 1; i < len(beautified); i++ {
		p1, p2 := beautified[i-1], beautified[i]
		angle := math.Atan2(p2.Y-p1.Y, p2.X-p1.X)

		// Snap to Horizontal axis
		if math.Abs(angle) < snapAngle || math.Abs(math.Abs(angle)-math.Pi) < snapAngle {
			beautified[i].Y = p1.Y
		}
		// Snap to Vertical axis
		if math.Abs(math.Abs(angle)-math.Pi/2) < snapAngle {
			beautified[i].X = p1.X
		}
	}

	// 5. Re-serialization (Generate new 'd' attribute)
	var newD strings.Builder
	if len(beautified) > 0 {
		newD.WriteString(fmt.Sprintf("M%.2f %.2f", beautified[0].X, beautified[0].Y))
		for i := 1; i < len(beautified); i++ {
			newD.WriteString(fmt.Sprintf("L%.2f %.2f", beautified[i].X, beautified[i].Y))
		}
	}

	return newD.String(), nodesBefore, nodesAfter
}

// isPointFull is a helper to determine if we need to start a new Point pair.
func isPointFull(t rune, pts []Point) bool {
	// Standard path logic: coords usually come in X,Y pairs.
	last := pts[len(pts)-1]
	_ = last // Placeholder for more complex coordinate parsing if needed
	return true
}

// ─── Pipeline Logic ──────────────────────────────────────────────────────────

// Optimize entry point: resolves file patterns and starts the worker pool.
func Optimize(pattern string) error {
	files, err := resolveFiles(pattern)
	if err != nil {
		return fmt.Errorf("failed to resolve files: %w", err)
	}

	if len(files) == 0 {
		cliutils.Info(fmt.Sprintf("No SVG files matched pattern: %s", pattern))
		return nil
	}

	opt := newOptimizer(files)
	return opt.run()
}

func newOptimizer(files []string) *optimizer {
	m := minify.New()
	m.AddFunc("image/svg+xml", svg.Minify)

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

	workerCount := len(o.workerStates)
	for i := 0; i < workerCount; i++ {
		o.wg.Add(1)
		go o.worker(i, ctx, tasks)
	}

	o.wg.Wait()
	close(done)

	if ctx.Err() != nil {
		fmt.Println("\n" + goldStyle.Render("Optimization interrupted by user."))
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
			before, after, err := o.processFile(path)
			o.updateWorkerState(id, "", false)

			o.results[idx] = Result{
				File:        filepath.Base(path),
				Path:        path,
				Success:     err == nil,
				NodesBefore: before,
				NodesAfter:  after,
				Error:       func() string { if err != nil { return err.Error() }; return "" }(),
			}

			atomic.AddInt32(&o.processed, 1)
			if err != nil {
				atomic.AddInt32(&o.failedCount, 1)
				continue
			}
			atomic.AddInt32(&o.successCount, 1)
		}
	}
}

func (o *optimizer) processFile(path string) (int, int, error) {
	input, err := os.ReadFile(path)
	if err != nil {
		return 0, 0, err
	}

	// 1. Geometric Beautification (Custom Logic)
	content := string(input)
	totalBefore, totalAfter := 0, 0

	newContent := pathTagRegex.ReplaceAllStringFunc(content, func(m string) string {
		match := pathTagRegex.FindStringSubmatch(m)
		if len(match) < 2 { return m }

		d, nb, na := processPathData(match[1])
		totalBefore += nb
		totalAfter += na
		return fmt.Sprintf(`d="%s"`, d)
	})

	// 2. Standard Minification (tdewolff/minify)
	minified, err := o.minifier.Bytes("image/svg+xml", []byte(newContent))
	if err != nil {
		return totalBefore, totalAfter, err
	}

	info, _ := os.Stat(path)
	mode := os.FileMode(0644)
	if info != nil { mode = info.Mode() }

	err = os.WriteFile(path, minified, mode)
	return totalBefore, totalAfter, err
}

func (o *optimizer) updateWorkerState(id int, path string, active bool) {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.workerStates[id].path = path
	o.workerStates[id].active = active
	o.workerStates[id].startTime = time.Now()
}

func (o *optimizer) renderUI(start time.Time, done <-chan struct{}) {
	ticker := time.NewTicker(uiTickRate)
	defer ticker.Stop()
	lineCount, firstRender := 0, true

	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			if !firstRender {
				fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
			}
			firstRender = false
			lineCount = o.drawFrame(start)
		}
	}
}

func (o *optimizer) drawFrame(start time.Time) int {
	o.mu.Lock()
	defer o.mu.Unlock()
	p := atomic.LoadInt32(&o.processed)
	fmt.Printf("  SVG Regularization %s [%d/%d] (%.1fs)\n",
		goldStyle.Render("🚀 GEOMETRY"), p, len(o.files), time.Since(start).Seconds())
	lines := 1
	for _, s := range o.workerStates {
		if !s.active {
			fmt.Println(formatProgressLine(tailStyle.Render("•"), "idle", ""))
		} else {
			dur := fmt.Sprintf("%.1fs", time.Since(s.startTime).Seconds())
			fmt.Println(formatProgressLine(blueStyle.Render("•"), s.path, dur))
		}
		lines++
	}
	return lines
}

func (o *optimizer) report() error {
	failed := atomic.LoadInt32(&o.failedCount)
	totalNodesBefore, totalNodesAfter := 0, 0
	for _, r := range o.results {
		totalNodesBefore += r.NodesBefore
		totalNodesAfter += r.NodesAfter
	}

	if failed == 0 {
		reduction := 0.0
		if totalNodesBefore > 0 {
			reduction = 100 * (1 - float64(totalNodesAfter)/float64(totalNodesBefore))
		}
		cliutils.Success(fmt.Sprintf("Geometric Regularization complete: %d nodes -> %d nodes (%.1f%% reduction)",
			totalNodesBefore, totalNodesAfter, reduction))
		return nil
	}

	var errorLog strings.Builder
	for _, r := range o.results {
		if !r.Success {
			errorLog.WriteString(fmt.Sprintf("✖ %s: %s\n", r.File, r.Error))
		}
	}
	cliutils.BoxOutput("Regularization Errors", strings.TrimSpace(errorLog.String()), lipgloss.Color("1"))
	return fmt.Errorf("failed to process %d files", failed)
}

func formatProgressLine(icon, path, suffix string) string {
	cleanPath := ansiRegex.ReplaceAllString(path, "")
	runes := []rune(cleanPath)
	if len(runes) > pathMaxLen {
		path = "..." + string(runes[len(runes)-(pathMaxLen-3):])
	}
	return fmt.Sprintf("  %s %-60s %s", icon, path, tailStyle.Render(suffix))
}

func resolveFiles(pattern string) ([]string, error) {
	if !strings.Contains(pattern, "**") {
		return filepath.Glob(pattern)
	}
	parts := strings.SplitN(pattern, "**", 2)
	root, suffix := filepath.Clean(parts[0]), parts[1]
	var matches []string
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() { return err }
		if strings.HasSuffix(path, suffix) { matches = append(matches, path) }
		return nil
	})
	return matches, err
}
