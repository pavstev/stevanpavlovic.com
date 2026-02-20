package svg

import (
	"encoding/json"
	"fmt"
	"golib/pkg/cliutils"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"github.com/charmbracelet/lipgloss"
)

// Result represents the outcome of a single file optimization.
type Result struct {
	File    string `json:"file"`
	Path    string `json:"path"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

// Summary provides an overview of the optimization run.
type Summary struct {
	Total   int `json:"total"`
	Success int `json:"success"`
	Failed  int `json:"failed"`
}

// Output is the structured JSON representation of the entire run.
type Output struct {
	Summary Summary  `json:"summary"`
	Results []Result `json:"results"`
}

type fileStatus struct {
	path      string
	startTime time.Time
	active    bool
}

// Optimize finds and processes SVG files matching the provided glob pattern.
func Optimize(pattern string) error {
	// Resolve files first
	files, err := resolveFiles(pattern)
	if err != nil {
		return fmt.Errorf("failed to resolve files: %w", err)
	}

	if len(files) == 0 {
		cliutils.Info(fmt.Sprintf("No SVG files matched pattern: %s", pattern))
		return nil
	}

	// ─── Setup Concurrency & State ───────────────────────────────────────────

	workerCount := 8
	if len(files) < workerCount {
		workerCount = len(files)
	}

	results := make([]Result, len(files))
	workerStates := make([]*fileStatus, workerCount)
	for i := range workerStates {
		workerStates[i] = &fileStatus{}
	}

	var (
		wg           sync.WaitGroup
		mu           sync.Mutex
		successCount int32
		failedCount  int32
		processed    int32
		tasks        = make(chan int, len(files))
	)

	// Fill task queue
	for i := range files {
		tasks <- i
	}
	close(tasks)

	startTime := time.Now()
	doneChan := make(chan struct{})

	// ─── Worker Loop ─────────────────────────────────────────────────────────

	for i := 0; i < workerCount; i++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			for idx := range tasks {
				path := files[idx]

				mu.Lock()
				workerStates[workerID].path = path
				workerStates[workerID].startTime = time.Now()
				workerStates[workerID].active = true
				mu.Unlock()

				// Run SVGO
				cmd := exec.Command("pnpm", "exec", "svgo", path)
				out, execErr := cmd.CombinedOutput()

				res := Result{
					File:    filepath.Base(path),
					Path:    path,
					Success: execErr == nil,
				}
				if execErr != nil {
					res.Error = strings.TrimSpace(string(out))
					atomic.AddInt32(&failedCount, 1)
				} else {
					atomic.AddInt32(&successCount, 1)
				}

				results[idx] = res
				atomic.AddInt32(&processed, 1)

				mu.Lock()
				workerStates[workerID].active = false
				mu.Unlock()
			}
		}(i)
	}

	// ─── UI Rendering ────────────────────────────────────────────────────────

	ticker := time.NewTicker(100 * time.Millisecond)
	go func() {
		lineCount := 0
		firstRender := true
		blueStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("4"))
		grayStyle := lipgloss.NewStyle().Foreground(lipgloss.Color("8"))

		for {
			select {
			case <-doneChan:
				ticker.Stop()
				return
			case <-ticker.C:
				mu.Lock()
				states := make([]fileStatus, workerCount)
				for i, s := range workerStates {
					states[i] = *s
				}
				mu.Unlock()

				// Erase previous frame
				if !firstRender {
					fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
				}
				firstRender, lineCount = false, 0

				// Progress Header
				p := atomic.LoadInt32(&processed)
				activeText := lipgloss.NewStyle().Foreground(lipgloss.Color("3")).Render("🚀 OPTIMIZING")
				fmt.Printf("  SVG Optimization %s [%d/%d] (%.1fs)\n",
					activeText, p, len(files), time.Since(startTime).Seconds())
				lineCount++

				// Worker Slots
				for i := 0; i < workerCount; i++ {
					if states[i].active {
						path := states[i].path
						if len(path) > 50 {
							path = "..." + path[len(path)-47:]
						}
						dur := time.Since(states[i].startTime).Seconds()
						fmt.Printf("  %s %-50s %s\n",
							blueStyle.Render("•"),
							path,
							grayStyle.Render(fmt.Sprintf("%.1fs", dur)))
					} else {
						fmt.Printf("  %s %s\n", grayStyle.Render("•"), grayStyle.Render("idle"))
					}
					lineCount++
				}
			}
		}
	}()

	wg.Wait()
	close(doneChan)
	time.Sleep(150 * time.Millisecond) // Let final render finish

	// ─── Final Summary ───────────────────────────────────────────────────────

	output := Output{
		Summary: Summary{
			Total:   len(files),
			Success: int(atomic.LoadInt32(&successCount)),
			Failed:  int(atomic.LoadInt32(&failedCount)),
		},
		Results: results,
	}

	// Output structured JSON for logs
	jsonOut, _ := json.MarshalIndent(output, "", "  ")
	fmt.Println(string(jsonOut))

	if output.Summary.Failed > 0 {
		cliutils.Error(fmt.Sprintf("SVG Optimization finished with %d errors.", output.Summary.Failed))
		return fmt.Errorf("failed to optimize %d files", output.Summary.Failed)
	}

	cliutils.Success(fmt.Sprintf("Successfully optimized %d SVG files.", output.Summary.Success))
	return nil
}

// resolveFiles handles patterns including ** for recursive matching.
func resolveFiles(pattern string) ([]string, error) {
	if !strings.Contains(pattern, "**") {
		return filepath.Glob(pattern)
	}

	parts := strings.SplitN(pattern, "**", 2)
	root := filepath.Clean(parts[0])
	suffix := parts[1]

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
