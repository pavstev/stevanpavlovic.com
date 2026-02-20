package svg

import (
	"context"
	"fmt"
	"golib/pkg/cliutils"
	"os"
	"os/signal"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"sync/atomic"
	"syscall"
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
	dimStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("242"))
)

type Result struct {
	File         string
	Path         string
	Success      bool
	Error        string
	OriginalSize int64
	NewSize      int64
	Duration     time.Duration
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

	// Create interrupt context
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	done := make(chan struct{})
	startTime := time.Now()

	// Start UI and Workers
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

			start := time.Now()
			origSize, newSize, err := o.processFile(path)
			dur := time.Since(start)

			o.updateWorkerState(id, "", false)

			o.results[idx] = Result{
				File:         filepath.Base(path),
				Path:         path,
				Success:      err == nil,
				Error:        func() string { if err != nil { return err.Error() }; return "" }(),
				OriginalSize: origSize,
				NewSize:      newSize,
				Duration:     dur,
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

func (o *optimizer) processFile(path string) (int64, int64, error) {
	input, err := os.ReadFile(path)
	if err != nil {
		return 0, 0, fmt.Errorf("read: %w", err)
	}
	origSize := int64(len(input))

	output, err := o.minifier.Bytes("image/svg+xml", input)
	if err != nil {
		return origSize, 0, fmt.Errorf("minify: %w", err)
	}
	newSize := int64(len(output))

	info, err := os.Stat(path)
	mode := os.FileMode(0644)
	if err == nil {
		mode = info.Mode()
	}

	if err := os.WriteFile(path, output, mode); err != nil {
		return origSize, newSize, fmt.Errorf("write: %w", err)
	}
	return origSize, newSize, nil
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
	var totalOrig, totalNew int64
	groups := make(map[string][]Result)

	for _, r := range o.results {
		dir := filepath.Dir(r.Path)
		groups[dir] = append(groups[dir], r)
		if r.Success {
			totalOrig += r.OriginalSize
			totalNew += r.NewSize
		}
	}

	// Sort directories for consistent output
	dirs := make([]string, 0, len(groups))
	for k := range groups {
		dirs = append(dirs, k)
	}
	sort.Strings(dirs)

	var sb strings.Builder
	for _, dir := range dirs {
		sb.WriteString(fmt.Sprintf("\n%s\n", lipgloss.NewStyle().Bold(true).Underline(true).Render(dir)))

		resList := groups[dir]
		sort.Slice(resList, func(i, j int) bool { return resList[i].File < resList[j].File })

		for _, r := range resList {
			if !r.Success {
				sb.WriteString(fmt.Sprintf("  %-30s %s\n", r.File, lipgloss.NewStyle().Foreground(lipgloss.Color("1")).Render("✖ "+r.Error)))
				continue
			}

			diff := r.OriginalSize - r.NewSize
			percent := 0.0
			if r.OriginalSize > 0 {
				percent = (float64(diff) / float64(r.OriginalSize)) * 100
			}

			sizeStr := fmt.Sprintf("%.2f KB → %.2f KB", float64(r.OriginalSize)/1024, float64(r.NewSize)/1024)
			savingStr := fmt.Sprintf("(-%.1f%%)", percent)
			durStr := fmt.Sprintf("%v", r.Duration.Round(time.Millisecond))

			sb.WriteString(fmt.Sprintf("  %-30s %-25s %-10s %s\n",
				r.File,
				dimStyle.Render(sizeStr),
				lipgloss.NewStyle().Foreground(lipgloss.Color("2")).Render(savingStr),
				dimStyle.Render(durStr),
			))
		}
	}

	cliutils.BoxOutput("SVG Optimization Report", strings.TrimSpace(sb.String()), lipgloss.Color("6"))

	savingsKB := float64(totalOrig-totalNew) / 1024
	cliutils.Success(fmt.Sprintf("Optimized %d files. Total savings: %.2f KB", atomic.LoadInt32(&o.successCount), savingsKB))

	if atomic.LoadInt32(&o.failedCount) > 0 {
		return fmt.Errorf("failed to optimize %d files", o.failedCount)
	}
	return nil
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
