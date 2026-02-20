package cli

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"os/signal"
	"regexp"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/charmbracelet/lipgloss"
)

// ─── Constants & Styling ─────────────────────────────────────────────────────

const (
	statusQueued    = "queued"
	statusActive    = "active"
	statusCompleted = "completed"
	statusFailed    = "failed"
	statusCancelled = "cancelled"
)

var (
	tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)
)

// ─── Task Entry Point & Lifecycle ────────────────────────────────────────────

// RunTask handles the execution of a single task, including its lifecycle hooks.
func RunTask(id string, data any, visited map[string]bool) {
	if visited == nil {
		visited = make(map[string]bool)
	}

	// Prevent infinite recursion in cyclical dependencies
	if visited[id] {
		return
	}
	visited[id] = true

	task, err := GetTaskByID(id)
	if err != nil {
		Fatal(err.Error())
	}

	// 1. Pre-Run Hooks
	for _, preID := range task.PreRun {
		RunTask(preID, data, visited)
	}

	// 2. Main Execution: Route pipelines vs single commands properly
	if task.Type == "batch" || task.Type == "sequential" || len(task.Tasks) > 0 {
		RunPipeline(id, task, visited)
	} else {
		cmdStr, err := EvaluateCommand(task.Command, data)
		if err != nil {
			Fatal(fmt.Sprintf("Template error in %q: %v", id, err))
		}

		if task.Interactive {
			RunInteractive(task.Name, cmdStr, task.Cwd)
		} else {
			runCommand(task.Name, cmdStr, task.Cwd)
		}
	}

	// 3. Post-Run Hooks
	for _, postID := range task.PostRun {
		RunTask(postID, data, visited)
	}
}

// RunPipeline executes a set of tasks based on the TaskConfig type.
func RunPipeline(id string, config TaskConfig, visited map[string]bool) {
	Info(fmt.Sprintf("Pipeline: %s", config.Name))

	if config.Type == "batch" || config.Parallel {
		workers := config.Workers
		if workers <= 0 {
			workers = 3
		}
		RunQueue(config.Tasks, workers, config.ContinueOnError)
	} else {
		// Sequential Pipeline
		for _, taskID := range config.Tasks {
			RunTask(taskID, nil, visited)
		}
	}
}

// ─── Core Runner Logic ───────────────────────────────────────────────────────

func createCmd(ctx context.Context, command, cwd string) *exec.Cmd {
	cmd := exec.CommandContext(ctx, "bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error {
		if cmd.Process == nil {
			return nil
		}
		pgid, err := syscall.Getpgid(cmd.Process.Pid)
		if err == nil {
			_ = syscall.Kill(-pgid, syscall.SIGTERM)
			time.AfterFunc(2*time.Second, func() { _ = syscall.Kill(-pgid, syscall.SIGKILL) })
			return nil
		}
		return cmd.Process.Kill()
	}
	return cmd
}

func runCommand(name, command, cwd string) {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cmd := createCmd(ctx, command, cwd)
	var outBuf bytes.Buffer
	var mu sync.Mutex
	var tail []string

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	go func() {
		scanner := bufio.NewScanner(io.MultiReader(stdout, stderr))
		for scanner.Scan() {
			line := scanner.Text()
			mu.Lock()
			outBuf.WriteString(line + "\n")
			tail = append(tail, line)
			if len(tail) > 5 {
				tail = tail[1:]
			}
			mu.Unlock()
		}
	}()

	ticker := time.NewTicker(80 * time.Millisecond)
	defer ticker.Stop()
	start, done := time.Now(), make(chan struct{})
	lineCount, firstRender := 0, true

	go func() {
		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				mu.Lock()
				currentTail := append([]string(nil), tail...)
				mu.Unlock()

				if !firstRender {
					fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
				}
				firstRender, lineCount = false, 1

				// UI rendering with the new theme
				spinner := Spinners[int(time.Now().UnixMilli()/80)%len(Spinners)]
				icon := Blue.Render(spinner)
				statusText := Blue.Bold(true).Render("RUNNING")
				durStr := fmt.Sprintf("%5.1fs", time.Since(start).Seconds())

				nameStr := lipgloss.NewStyle().Width(35).Render(name)
				statStr := lipgloss.NewStyle().Width(12).Render(statusText)

				fmt.Printf(" %s  %s %s %s\n", icon, nameStr, statStr, durStr)

				if !Quiet {
					for _, l := range currentTail {
						fmt.Println(formatTailLine(l))
						lineCount++
					}
				}
			}
		}
	}()

	err := cmd.Run()
	close(done)

	if err != nil && ctx.Err() != nil {
		fmt.Println("\n" + Yellow.Render(fmt.Sprintf("⏹️  %s cancelled.", name)))
		os.Exit(1)
	}

	if cmd.ProcessState != nil && cmd.ProcessState.Success() {
		if !Quiet && !firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
			nameStr := lipgloss.NewStyle().Width(35).Render(name)
			statStr := lipgloss.NewStyle().Width(12).Render(Green.Bold(true).Render("DONE"))
			durStr := fmt.Sprintf("%5.1fs", time.Since(start).Seconds())
			fmt.Printf(" %s  %s %s %s\n", Green.Render("✓"), nameStr, statStr, durStr)
		}
		Success(name)
	} else {
		if !Quiet && !firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
			nameStr := lipgloss.NewStyle().Width(35).Render(name)
			statStr := lipgloss.NewStyle().Width(12).Render(Red.Bold(true).Render("FAIL"))
			durStr := fmt.Sprintf("%5.1fs", time.Since(start).Seconds())
			fmt.Printf(" %s  %s %s %s\n", Red.Render("✗"), nameStr, statStr, durStr)
		}
		Error(name)
		BoxOutput("Failure Log: "+name, outBuf.String(), lipgloss.Color("1"))
		os.Exit(1)
	}
}

func RunInteractive(name, command, cwd string) {
	Info("Interactive Session: " + name)
	cmd := exec.Command("bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		Error(fmt.Sprintf("%s failed: %v", name, err))
		os.Exit(1)
	}
	Success(name)
}

// ─── Queue Logic ─────────────────────────────────────────────────────────────

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
					cmdStr = fmt.Sprintf("%q task %q", executable, id)
				} else {
					cmdStr, _ = EvaluateCommand(task.Command, nil)
				}

				cmd := createCmd(ctx, cmdStr, task.Cwd)

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

	fmt.Println()
	fmt.Printf("  %s %d completed", Green.Render("●"), completed)
	if failedTasks > 0 {
		fmt.Printf(" | %s %d failed", Red.Render("●"), failedTasks)
	}
	fmt.Printf(" | %s %d total | %s %.1fs\n\n", Blue.Render("●"), len(states), Subtle.Render("⏱"), totalDur)

	if failed {
		fmt.Println("\n" + Bold.Render("PIPELINE FAILED"))
		os.Exit(1)
	}
}

func formatTailLine(line string) string {
	clean := ansiRegex.ReplaceAllString(line, "")
	if len(clean) > 85 {
		clean = clean[:82] + "..."
	}
	return tailStyle.Render("  │ " + clean)
}
