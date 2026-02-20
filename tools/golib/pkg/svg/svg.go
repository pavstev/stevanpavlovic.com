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

	"golib/pkg/cliutils"

	"github.com/charmbracelet/lipgloss"
	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/svg"
)

// ─── Constants & Intelligence ───────────────────────────────────────────────

const (
	maxWorkers  = 8
	uiTickRate  = 80 * time.Millisecond
	pathMaxLen  = 60
	epsilon     = 0.035 // RDP tolerance (fine-tuned for high-fidelity)
	snapAngle   = 0.015 // Radians (~0.8 degrees)
	precision   = 2     // Decimal places for quantization
)

var (
	ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)
	tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	blueStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("4"))
	goldStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("3"))

	pathTagRegex = regexp.MustCompile(`(?i)d="([^"]+)"`)
	cmdRegex     = regexp.MustCompile(`([a-df-z])|([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)`)
)

// ─── Types & Geometry ───────────────────────────────────────────────────────

// CommandType defines the SVG path instruction
type CommandType rune

// Point represents a 2D coordinate vector [x, y]
type Point struct {
	X, Y float64
}

// Command represents a single path instruction and its points
type Command struct {
	Type   CommandType
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

// ─── Advanced Mathematics ───────────────────────────────────────────────────

func distanceToLine(p, a, b Point) float64 {
	dx, dy := b.X-a.X, b.Y-a.Y
	if dx == 0 && dy == 0 {
		return math.Hypot(p.X-a.X, p.Y-a.Y)
	}
	num := math.Abs(dy*p.X - dx*p.Y + b.X*a.Y - b.Y*a.X)
	den := math.Sqrt(dx*dx + dy*dy)
	return num / den
}

// simplifyRDP decimated points using Ramer-Douglas-Peucker
func simplifyRDP(points []Point, eps float64) []Point {
	if len(points) < 3 {
		return points
	}

	maxDist, index := 0.0, 0
	end := len(points) - 1

	for i := 1; i < end; i++ {
		d := distanceToLine(points[i], points[0], points[end])
		if d > maxDist {
			index, maxDist = i, d
		}
	}

	if maxDist > eps {
		res1 := simplifyRDP(points[:index+1], eps)
		res2 := simplifyRDP(points[index:], eps)
		return append(res1[:len(res1)-1], res2...)
	}

	return []Point{points[0], points[end]}
}

// smartRound truncates floats to avoid coordinate drift
func smartRound(val float64) float64 {
	p := math.Pow(10, float64(precision))
	return math.Round(val*p) / p
}

// ─── Path Intelligence ───────────────────────────────────────────────────────

func processPathData(d string) (string, int, int) {
	tokens := cmdRegex.FindAllStringSubmatch(d, -1)
	var commands []Command
	var currentCmd *Command

	for _, t := range tokens {
		if t[1] != "" {
			if currentCmd != nil { commands = append(commands, *currentCmd) }
			currentCmd = &Command{Type: CommandType(t[1][0]), Points: []Point{}}
		} else if t[2] != "" {
			num, _ := strconv.ParseFloat(t[2], 64)
			if currentCmd == nil { continue }

			rType := rune(currentCmd.Type)
			if len(currentCmd.Points) == 0 || (rType != 'H' && rType != 'V' && rType != 'h' && rType != 'v' && math.Mod(float64(len(currentCmd.Points)), 1) == 0) {
				currentCmd.Points = append(currentCmd.Points, Point{X: num})
			} else {
				currentCmd.Points[len(currentCmd.Points)-1].Y = num
			}
		}
	}
	if currentCmd != nil { commands = append(commands, *currentCmd) }

	nodesBefore := len(commands)

	// Convert to Absolute World Space
	absPoints := []Point{}
	cursor := Point{0, 0}
	for _, cmd := range commands {
		rType := rune(cmd.Type)
		isRel := rType >= 'a' && rType <= 'z'
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

	// Geometric Smoothing
	beautified := simplifyRDP(absPoints, epsilon)

	// Regularization & Snapping
	for i := 1; i < len(beautified); i++ {
		p1, p2 := beautified[i-1], beautified[i]
		angle := math.Atan2(p2.Y-p1.Y, p2.X-p1.X)

		if math.Abs(angle) < snapAngle || math.Abs(math.Abs(angle)-math.Pi) < snapAngle {
			beautified[i].Y = p1.Y
		} else if math.Abs(math.Abs(angle)-math.Pi/2) < snapAngle {
			beautified[i].X = p1.X
		}
	}

	// Intelligent Serialization
	var newD strings.Builder
	if len(beautified) > 0 {
		cursor = Point{smartRound(beautified[0].X), smartRound(beautified[0].Y)}
		newD.WriteString(fmt.Sprintf("M%g %g", cursor.X, cursor.Y))

		for i := 1; i < len(beautified); i++ {
			target := Point{smartRound(beautified[i].X), smartRound(beautified[i].Y)}
			dx, dy := target.X-cursor.X, target.Y-cursor.Y

			if dy == 0 {
				newD.WriteString(fmt.Sprintf("H%g", target.X))
			} else if dx == 0 {
				newD.WriteString(fmt.Sprintf("V%g", target.Y))
			} else {
				absStr := fmt.Sprintf("L%g %g", target.X, target.Y)
				relStr := fmt.Sprintf("l%g %g", dx, dy)
				if len(relStr) < len(absStr) {
					newD.WriteString(relStr)
				} else {
					newD.WriteString(absStr)
				}
			}
			cursor = target
		}
	}

	return newD.String(), nodesBefore, len(beautified)
}

// ─── Parallel Pipeline ───────────────────────────────────────────────────────

func Optimize(pattern string) error {
	files, err := resolveFiles(pattern)
	if err != nil { return err }
	if len(files) == 0 { return nil }

	opt := newOptimizer(files)
	return opt.run()
}

func newOptimizer(files []string) *optimizer {
	m := minify.New()
	m.AddFunc("image/svg+xml", svg.Minify)

	workerCount := maxWorkers
	if len(files) < workerCount { workerCount = len(files) }

	states := make([]*fileStatus, workerCount)
	for i := range states { states[i] = &fileStatus{} }

	return &optimizer{
		files:        files,
		results:      make([]Result, len(files)),
		workerStates: states,
		minifier:     m,
	}
}

func (o *optimizer) run() error {
	tasks := make(chan int, len(o.files))
	for i := range o.files { tasks <- i }
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
		fmt.Println("\n" + goldStyle.Render("Interrupted by user."))
		return ctx.Err()
	}

	return o.report()
}

func (o *optimizer) worker(id int, ctx context.Context, tasks <-chan int) {
	defer o.wg.Done()
	for idx := range tasks {
		select {
		case <-ctx.Done(): return
		default:
			path := o.files[idx]
			o.updateWorkerState(id, path, true)
			before, after, err := o.processFile(path)
			o.updateWorkerState(id, "", false)

			o.results[idx] = Result{
				File: filepath.Base(path), Path: path,
				Success: err == nil, NodesBefore: before, NodesAfter: after,
				Error: func() string { if err != nil { return err.Error() }; return "" }(),
			}

			atomic.AddInt32(&o.processed, 1)
			if err != nil { atomic.AddInt32(&o.failedCount, 1) } else { atomic.AddInt32(&o.successCount, 1) }
		}
	}
}

func (o *optimizer) processFile(path string) (int, int, error) {
	input, err := os.ReadFile(path)
	if err != nil { return 0, 0, err }

	content := string(input)
	tBefore, tAfter := 0, 0

	processed := pathTagRegex.ReplaceAllStringFunc(content, func(m string) string {
		match := pathTagRegex.FindStringSubmatch(m)
		if len(match) < 2 { return m }
		d, nb, na := processPathData(match[1])
		tBefore += nb; tAfter += na
		return fmt.Sprintf(`d="%s"`, d)
	})

	minified, err := o.minifier.Bytes("image/svg+xml", []byte(processed))
	if err != nil { return tBefore, tAfter, err }

	info, _ := os.Stat(path)
	mode := os.FileMode(0644)
	if info != nil { mode = info.Mode() }

	err = os.WriteFile(path, minified, mode)
	return tBefore, tAfter, err
}

func (o *optimizer) updateWorkerState(id int, path string, active bool) {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.workerStates[id].path, o.workerStates[id].active, o.workerStates[id].startTime = path, active, time.Now()
}

func (o *optimizer) renderUI(start time.Time, done <-chan struct{}) {
	ticker := time.NewTicker(uiTickRate)
	defer ticker.Stop()
	lines, first := 0, true
	for {
		select {
		case <-done: return
		case <-ticker.C:
			if !first { fmt.Print(strings.Repeat("\033[A\033[2K", lines)) }
			first, lines = false, o.drawFrame(start)
		}
	}
}

func (o *optimizer) drawFrame(start time.Time) int {
	o.mu.Lock()
	defer o.mu.Unlock()
	p := atomic.LoadInt32(&o.processed)
	fmt.Printf("  SVG Intelligence %s [%d/%d] (%.1fs)\n", goldStyle.Render("🧠 GEOMETER"), p, len(o.files), time.Since(start).Seconds())
	for _, s := range o.workerStates {
		if !s.active { fmt.Println(formatProgressLine(tailStyle.Render("•"), "idle", ""))
		} else { fmt.Println(formatProgressLine(blueStyle.Render("•"), s.path, fmt.Sprintf("%.1fs", time.Since(s.startTime).Seconds()))) }
	}
	return len(o.workerStates) + 1
}

func (o *optimizer) report() error {
	failed, tBefore, tAfter := atomic.LoadInt32(&o.failedCount), 0, 0
	for _, r := range o.results { tBefore += r.NodesBefore; tAfter += r.NodesAfter }

	if failed == 0 {
		reduction := 0.0
		if tBefore > 0 { reduction = 100 * (1 - float64(tAfter)/float64(tBefore)) }
		cliutils.Success(fmt.Sprintf("Intelligence Pass: %d -> %d nodes (%.1f%% geometric density reduction)", tBefore, tAfter, reduction))
		return nil
	}
	return fmt.Errorf("failed to process %d files", failed)
}

func formatProgressLine(icon, path, suffix string) string {
	clean := ansiRegex.ReplaceAllString(path, "")
	if len([]rune(clean)) > pathMaxLen { path = "..." + string([]rune(clean)[len([]rune(clean))-(pathMaxLen-3):]) }
	return fmt.Sprintf("  %s %-60s %s", icon, path, tailStyle.Render(suffix))
}

func resolveFiles(pattern string) ([]string, error) {
	if !strings.Contains(pattern, "**") { return filepath.Glob(pattern) }
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
