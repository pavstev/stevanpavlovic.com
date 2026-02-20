package cliutils

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

	if visited[id] {
		return // Prevent infinite recursion
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

	// 2. Main Execution
	cmdStr, err := EvaluateCommand(task.Command, data)
	if err != nil {
		Fatal(fmt.Sprintf("Template error in %q: %v", id, err))
	}

	if task.Interactive {
		RunInteractive(task.Name, cmdStr, task.Cwd)
	} else {
		runCommand(task.Name, cmdStr, task.Cwd)
	}

	// 3. Post-Run Hooks
	for _, postID := range task.PostRun {
		RunTask(postID, data, visited)
	}
}

// RunBatch executes a set of tasks based on BatchConfig
func RunBatch(id string, config BatchConfig) {
	Step(fmt.Sprintf("Batch: %s", config.Name))

	if config.Parallel {
		workers := config.Workers
		if workers <= 0 {
			workers = 3
		}
		RunQueue(config.Tasks, workers, config.ContinueOnError)
	} else {
		for _, taskID := range config.Tasks {
			RunTask(taskID, nil, nil)
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
				fmt.Printf("  %-25s %s (%.1fs)\n", name, yellow.Render("🚀 ACTIVE"), time.Since(start).Seconds())
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
		fmt.Println("\n" + yellow.Render(fmt.Sprintf("⏹️  %s cancelled.", name)))
		os.Exit(1)
	}

	if cmd.ProcessState != nil && cmd.ProcessState.Success() {
		Success(name + " finished.")
	} else {
		Error(name + " failed.")
		BoxOutput("Failure Detail: "+name, outBuf.String(), lipgloss.Color("1"))
		os.Exit(1)
	}
}

func RunInteractive(name, command, cwd string) {
	Step("Interactive: " + name)
	cmd := exec.Command("bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		Error(fmt.Sprintf("%s failed: %v", name, err))
		os.Exit(1)
	}
	Success(name + " done.")
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
				cmd := createCmd(ctx, task.Command, task.Cwd)

				pr, pw, _ := os.Pipe()
				cmd.Stdout, cmd.Stderr = pw, pw

				go func() {
					scanner := bufio.NewScanner(pr)
					for scanner.Scan() {
						line := scanner.Text()
						mu.Lock()
						states[idx].tail = append(states[idx].tail, line)
						if len(states[idx].tail) > 5 { states[idx].tail = states[idx].tail[1:] }
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

	// UI Render loop
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()
	firstRender, lineCount := true, 0

	render := func() {
		mu.Lock()
		defer mu.Unlock()
		if !firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
		}
		firstRender, lineCount = false, 0
		for _, s := range states {
			status := s.status
			switch s.status {
			case statusActive:
				status = yellow.Render("🚀 ACTIVE")
			case statusCompleted:
				status = green.Render("✅ DONE  ")
			case statusFailed:
				status = red.Render("❌ FAILED")
			case statusCancelled:
				status = lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Render("🚫 CANCEL")
			default:
				status = lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Render("⏳ QUEUED")
			}
			fmt.Printf("  %-25s %s\n", s.name, status)
			lineCount++
		}
	}

	done := make(chan struct{})
	go func() {
		wg.Wait()
		close(done)
	}()

	// Simplified UI Loop: Watch channels directly
	for processing := true; processing; {
		select {
		case <-done:
			processing = false
		case <-ticker.C:
			render()
		}
	}

	// Final render to show completed state
	render()

	if failed {
		fmt.Println("\n" + bold.Render("PIPELINE FAILED"))
		os.Exit(1)
	}
	Success("Pipeline finished.")
}

func formatTailLine(line string) string {
	clean := ansiRegex.ReplaceAllString(line, "")
	if len(clean) > 85 { clean = clean[:82] + "..." }
	return tailStyle.Render("  │ " + clean)
}
