package svg

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"regexp"
	"repokit/pkg/core"
	"sync"
	"sync/atomic"
	"syscall"
	"time"

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
	tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	blueStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("4"))
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

// ─── Parallel Pipeline Execution ────────────────────────────────────────────

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
		core.Info("\n%s", goldStyle.Render("Interrupted by user."))
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
			before, after, sBefore, sAfter, err := o.processFile(path)
			o.updateWorkerState(id, "", false)

			o.results[idx] = Result{
				File: filepath.Base(path), Path: path,
				Success: err == nil, NodesBefore: before, NodesAfter: after,
				SizeBefore: sBefore, SizeAfter: sAfter,
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

func (o *optimizer) processFile(path string) (nodesBefore int, nodesAfter int, sizeBefore int64, sizeAfter int64, err error) {
	input, err := os.ReadFile(path)
	if err != nil {
		return 0, 0, 0, 0, err
	}

	sizeBefore = int64(len(input))
	content := string(input)
	tBefore, tAfter := 0, 0

	// 1. Optimize Paths
	processed := pathTagRegex.ReplaceAllStringFunc(content, func(m string) string {
		match := pathTagRegex.FindStringSubmatch(m)
		if len(match) < 2 {
			return m
		}
		d, nb, na := processPathData(match[1])
		tBefore += nb
		tAfter += na
		return fmt.Sprintf("d=%q", d)
	})

	// 2. Optimize Polygons/Polylines (they use 'points' attribute)
	processed = polygonTagRegex.ReplaceAllStringFunc(processed, func(m string) string {
		match := polygonTagRegex.FindStringSubmatch(m)
		if len(match) < 2 {
			return m
		}
		// We can reuse ParsePath logic by prefixing with M to treat it as a path
		commands := ParsePath("M" + match[1])
		points := ToAbsolutePoints(commands)

		// Apply same simplification as paths
		points = SimplifyPath(points, epsilon)
		points = SnapPointsToAxes(points, snapAngle)

		na := len(points)
		// We calculate nb differently for points (it's just a list of coords)
		// but for simplicity we keep na accurate
		tAfter += na

		processedPoints := FormatPointsData(points, precision)
		return fmt.Sprintf("points=%q", processedPoints)
	})

	minified, err := o.minifier.Bytes("image/svg+xml", []byte(processed))
	if err != nil {
		return tBefore, tAfter, sizeBefore, int64(len(processed)), err
	}

	sizeAfter = int64(len(minified))
	info, _ := os.Stat(path)
	mode := os.FileMode(0644)
	if info != nil {
		mode = info.Mode()
	}

	err = os.WriteFile(path, minified, mode)
	return tBefore, tAfter, sizeBefore, sizeAfter, err
}

func (o *optimizer) updateWorkerState(id int, path string, active bool) {
	o.mu.Lock()
	defer o.mu.Unlock()
	o.workerStates[id].path, o.workerStates[id].active, o.workerStates[id].startTime = path, active, time.Now()
}



