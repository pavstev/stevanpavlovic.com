package cli

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/charmbracelet/lipgloss"
)

type taskState struct {
	name      string
	status    string
	startTime time.Time
	elapsed   time.Duration
	tail      []string
}

func RunQueue(ids []string, workers int, continueOnError bool) {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	var wg sync.WaitGroup
	var mu sync.Mutex
	failed := false
	states := make([]*taskState, len(ids))
	taskChan := make(chan int, len(ids))

	for i, id := range ids {
		t, _ := GetTaskByID(id)
		states[i] = &taskState{name: t.Name, status: statusQueued}
		taskChan <- i
	}
	close(taskChan)

	for i := 0; i < workers; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for idx := range taskChan {
				select {
				case <-ctx.Done():
					mu.Lock()
					states[idx].status = statusCancelled
					mu.Unlock()
					return
				default:
				}

				mu.Lock()
				if failed && !continueOnError {
					states[idx].status = statusCancelled
					mu.Unlock()
					continue
				}
				states[idx].status = statusActive
				states[idx].startTime = time.Now()
				mu.Unlock()

				id := ids[idx]
				task, _ := GetTaskByID(id)

				// Recursion Support: Dynamically resolve the absolute path of the Repokit binary
				// so that queues can safely fork sub-pipelines while preserving UI spinners!
				var cmdStr string
				if task.Type == "batch" || task.Type == "sequential" || len(task.Tasks) > 0 {
					executable, _ := os.Executable()
					if executable == "" {
						executable = os.Args[0] // Fallback
					}
					cmdStr = fmt.Sprintf("%q %q", executable, id)
				} else {
					cmdStr, _ = EvaluateCommand(task.Command, nil)
				}

				cmd := createCmd(ctx, cmdStr, task.Cwd)
				cmd.Env = os.Environ()
				if task.Type == "batch" || task.Type == "sequential" || len(task.Tasks) > 0 {
					cmd.Env = append(cmd.Env, "REPOKIT_NESTED=1")
				}

				pr, pw, _ := os.Pipe()
				cmd.Stdout, cmd.Stderr = pw, pw

				go func() {
					scanner := bufio.NewScanner(pr)
					for scanner.Scan() {
						line := scanner.Text()
						mu.Lock()
						states[idx].tail = append(states[idx].tail, line)
						if len(states[idx].tail) > 5 {
							states[idx].tail = states[idx].tail[1:]
						}
						mu.Unlock()
					}
				}()

				err := cmd.Run()
				_ = pw.Close()

				mu.Lock()
				states[idx].elapsed = time.Since(states[idx].startTime)
				if err != nil {
					states[idx].status = statusFailed
					failed = true
					if os.Getenv("REPOKIT_NESTED") == "1" {
						fmt.Printf("Error in %s:\n", states[idx].name)
						for _, t := range states[idx].tail {
							fmt.Println(t)
						}
					}
				} else {
					states[idx].status = statusCompleted
				}
				mu.Unlock()
			}
		}()
	}

	ticker := time.NewTicker(80 * time.Millisecond)
	defer ticker.Stop()
	firstRender, lineCount := true, 0
	startPipeline := time.Now()

	render := func() {
		if os.Getenv("REPOKIT_NESTED") == "1" {
			return
		}
		mu.Lock()
		defer mu.Unlock()
		if !firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
		}
		firstRender, lineCount = false, 0

		spinnerIdx := int(time.Now().UnixMilli()/80) % len(Spinners)

		for _, s := range states {
			var icon, statText string
			durStr := fmt.Sprintf("%5.1fs", s.elapsed.Seconds())

			switch s.status {
			case statusCompleted:
				icon = Green.Render("✓")
				statText = Green.Bold(true).Render("DONE")
			case statusFailed:
				icon = Red.Render("✗")
				statText = Red.Bold(true).Render("FAIL")
			case statusActive:
				icon = Blue.Render(Spinners[spinnerIdx])
				statText = Blue.Bold(true).Render("RUNNING")
				durStr = fmt.Sprintf("%5.1fs", time.Since(s.startTime).Seconds())
			case statusCancelled:
				icon = Subtle.Render("⊘")
				statText = Subtle.Render("CANCEL")
				durStr = Subtle.Render("  --.-s")
			default:
				icon = Subtle.Render("○")
				statText = Subtle.Render("PENDING")
				durStr = Subtle.Render("  --.-s")
			}

			nameStr := lipgloss.NewStyle().Width(35).Render(s.name)
			statStr := lipgloss.NewStyle().Width(12).Render(statText)

			fmt.Printf(" %s  %s %s %s\n", icon, nameStr, statStr, durStr)
			lineCount++

			if len(s.tail) > 0 && (s.status == statusActive || s.status == statusFailed) && !Quiet {
				for _, tl := range s.tail {
					fmt.Println(formatTailLine(tl))
					lineCount++
				}
			}
		}
	}

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	for processing := true; processing; {
		select {
		case <-done:
			processing = false
		case <-ticker.C:
			render()
		}
	}

	render()

	totalDur := time.Since(startPipeline).Seconds()
	completed, failedTasks := 0, 0
	for _, s := range states {
		if s.status == statusCompleted {
			completed++
		} else if s.status == statusFailed {
			failedTasks++
		}
	}

	if os.Getenv("REPOKIT_NESTED") != "1" {
		fmt.Println()
		fmt.Printf("  %s %d completed", Green.Render("●"), completed)
		if failedTasks > 0 {
			fmt.Printf(" | %s %d failed", Red.Render("●"), failedTasks)
		}
		fmt.Printf(" | %s %d total | %s %.1fs\n\n", Blue.Render("●"), len(states), Subtle.Render("⏱"), totalDur)
	}

	if failed {
		if os.Getenv("REPOKIT_NESTED") != "1" {
			fmt.Println("\n" + Bold.Render("PIPELINE FAILED"))
		}
		os.Exit(1)
	}
}
