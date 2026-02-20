package svg

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

	"repokit/pkg/cli"

	"github.com/charmbracelet/lipgloss"
	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/svg"
)

// ─── Constants & Intelligence ───────────────────────────────────────────────

const (
	maxWorkers = 8
	uiTickRate = 80 * time.Millisecond
	pathMaxLen = 60
	epsilon    = 0.025 // RDP tolerance (tighter for production)
	snapAngle  = 0.012 // Radians (~0.7 degrees)
	precision  = 2     // Decimal places for quantization
)

var (
	ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)
	tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	blueStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("4"))
	goldStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("3"))

	pathTagRegex = regexp.MustCompile(`(?i)d="([^"]+)"`)
)

// ─── Types & Logic ──────────────────────────────────────────────────────────

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

// ─── Pipeline: The "Mind-Blowing" Implementation ────────────────────────────

func processPathData(d string) (string, int, int) {
	// 1. Lexing: Tokenize the 'd' attribute into high-level commands
	commands := ParsePath(d)
	nodesBefore := len(commands)

	// 2. Geometric Extraction: Convert to world-space vectors
	// We handle curves by sampling points along the spline
	points := ToAbsolutePoints(commands)

	// 3. Mathematical Decimation (RDP Pass)
	// Removes redundant data points while preserving geometric intent
	beautified := SimplifyPoints(points, epsilon)

	// 4. Primitive Analysis & Recovery
	// If the points describe a circular arc, we could replace with an arc command
	// For now, we perform regularization on the decimated set
	beautified = RegularizePoints(beautified, snapAngle)

	// 5. Intelligent Serialization
	// The Geometer now calculates the entropy of Absolute vs Relative pathing
	// and picks the byte-optimal representation for every segment.
	newD := SerializePoints(beautified, precision)

	return newD, nodesBefore, len(beautified)
}

// ─── Parallel Pipeline Execution ────────────────────────────────────────────

func Optimize(pattern string) error {
	files, err := resolveFiles(pattern)
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
		case <-ctx.Done():
			return
		default:
			path := o.files[idx]
			o.updateWorkerState(id, path, true)
			before, after, err := o.processFile(path)
			o.updateWorkerState(id, "", false)

			o.results[idx] = Result{
				File: filepath.Base(path), Path: path,
				Success: err == nil, NodesBefore: before, NodesAfter: after,
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

func (o *optimizer) processFile(path string) (int, int, error) {
	input, err := os.ReadFile(path)
	if err != nil {
		return 0, 0, err
	}

	content := string(input)
	tBefore, tAfter := 0, 0

	processed := pathTagRegex.ReplaceAllStringFunc(content, func(m string) string {
		match := pathTagRegex.FindStringSubmatch(m)
		if len(match) < 2 {
			return m
		}
		d, nb, na := processPathData(match[1])
		tBefore += nb
		tAfter += na
		return fmt.Sprintf(`d="%s"`, d)
	})

	minified, err := o.minifier.Bytes("image/svg+xml", []byte(processed))
	if err != nil {
		return tBefore, tAfter, err
	}

	info, _ := os.Stat(path)
	mode := os.FileMode(0644)
	if info != nil {
		mode = info.Mode()
	}

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
		case <-done:
			return
		case <-ticker.C:
			if !first {
				fmt.Print(strings.Repeat("\033[A\033[2K", lines))
			}
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
		if !s.active {
			fmt.Println(formatProgressLine(tailStyle.Render("•"), "idle", ""))
		} else {
			fmt.Println(formatProgressLine(blueStyle.Render("•"), s.path, fmt.Sprintf("%.1fs", time.Since(s.startTime).Seconds())))
		}
	}
	return len(o.workerStates) + 1
}

func (o *optimizer) report() error {
	failed, tBefore, tAfter := atomic.LoadInt32(&o.failedCount), 0, 0
	for _, r := range o.results {
		tBefore += r.NodesBefore
		tAfter += r.NodesAfter
	}

	if failed == 0 {
		reduction := 0.0
		if tBefore > 0 {
			reduction = 100 * (1 - float64(tAfter)/float64(tBefore))
		}
		cli.Success(fmt.Sprintf("Intelligence Pass: %d -> %d nodes (%.1f%% geometric density reduction)", tBefore, tAfter, reduction))
		return nil
	}
	return fmt.Errorf("failed to process %d files", failed)
}

func formatProgressLine(icon, path, suffix string) string {
	clean := ansiRegex.ReplaceAllString(path, "")
	if len([]rune(clean)) > pathMaxLen {
		path = "..." + string([]rune(clean)[len([]rune(clean))-(pathMaxLen-3):])
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
		if err != nil || info.IsDir() {
			return err
		}
		if strings.HasSuffix(path, suffix) {
			matches = append(matches, path)
		}
		return nil
	})
	return matches, err
}
