package svg

import (
	"fmt"
	"golib/pkg/cliutils"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/charmbracelet/lipgloss"
	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/svg"
)

const (
	maxWorkers  = 8
	uiTickRate  = 80 * time.Millisecond
	pathMaxLen  = 60
)

var (
	ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)
	tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	blueStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("4"))
	goldStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("3"))
)

type Result struct {
	File    string
	Path    string
	Success bool
	Error   string
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

// Optimize is the entry point for the SVG optimization process.
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

	done := make(chan struct{})
	startTime := time.Now()

	// Start UI and Workers
	go o.renderUI(startTime, done)

	workerCount := len(o.workerStates)
	for i := 0; i < workerCount; i++ {
		o.wg.Add(1)
		go o.worker(i, tasks)
	}

	o.wg.Wait()
	close(done)

	// Brief pause to allow terminal to settle after UI goroutine closes
	time.Sleep(100 * time.Millisecond)

	return o.report()
}

func (o *optimizer) worker(id int, tasks <-chan int) {
	defer o.wg.Done()
	for idx := range tasks {
		path := o.files[idx]

		o.updateWorkerState(id, path, true)
		err := o.processFile(path)
		o.updateWorkerState(id, "", false)

		o.results[idx] = Result{
			File:    filepath.Base(path),
			Path:    path,
			Success: err == nil,
			Error:   func() string { if err != nil { return err.Error() }; return "" }(),
		}

		atomic.AddInt32(&o.processed, 1)
		if err != nil {
			atomic.AddInt32(&o.failedCount, 1)
			continue
		}
		atomic.AddInt32(&o.successCount, 1)
	}
}

func (o *optimizer) processFile(path string) error {
	input, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("read: %w", err)
	}

	output, err := o.minifier.Bytes("image/svg+xml", input)
	if err != nil {
		return fmt.Errorf("minify: %w", err)
	}

	info, err := os.Stat(path)
	mode := os.FileMode(0644)
	if err == nil {
		mode = info.Mode()
	}

	if err := os.WriteFile(path, output, mode); err != nil {
		return fmt.Errorf("write: %w", err)
	}
	return nil
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

	lineCount := 0
	firstRender := true

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
	fmt.Printf("  SVG Optimization %s [%d/%d] (%.1fs)\n",
		goldStyle.Render("🚀 OPTIMIZING"), p, len(o.files), time.Since(start).Seconds())

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
	if failed == 0 {
		cliutils.Success(fmt.Sprintf("Successfully optimized %d SVG files natively.", len(o.files)))
		return nil
	}

	var errorLog strings.Builder
	for _, r := range o.results {
		if !r.Success {
			errorLog.WriteString(fmt.Sprintf("✖ %s: %s\n", r.File, r.Error))
		}
	}

	cliutils.BoxOutput("Optimization Errors", strings.TrimSpace(errorLog.String()), lipgloss.Color("1"))
	cliutils.Error(fmt.Sprintf("Optimization finished with %d errors.", failed))
	return fmt.Errorf("failed to optimize %d files", failed)
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