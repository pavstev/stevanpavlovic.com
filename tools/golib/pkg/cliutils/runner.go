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

// ─── Types ────────────────────────────────────────────────────────────────────

type Task struct {
	Name    string
	Command string
	Cwd     string
}

type TaskResult struct {
	Name     string
	Success  bool
	Output   string
	ErrorOut string
	ExecErr  error
}

const (
	statusQueued    = "queued"
	statusActive    = "active"
	statusCompleted = "completed"
	statusFailed    = "failed"
	statusCancelled = "cancelled"
)

var tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
var ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)

// ─── Shared Helpers ───────────────────────────────────────────────────────────

// createCmd creates a context-aware command that kills entire process groups safely.
func createCmd(ctx context.Context, command, cwd string) *exec.Cmd {
	cmd := exec.CommandContext(ctx, "bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error {
		pgid, err := syscall.Getpgid(cmd.Process.Pid)
		if err == nil {
			return syscall.Kill(-pgid, syscall.SIGKILL)
		}
		return cmd.Process.Kill()
	}
	return cmd
}

func formatTailLine(line string) string {
	// Strip ANSI codes to prevent terminal corruption when truncated
	cleanLine := ansiRegex.ReplaceAllString(line, "")
	cleanLine = strings.ReplaceAll(cleanLine, "\r", "")
	cleanLine = strings.ReplaceAll(cleanLine, "\t", "  ")

	// Convert to runes for safe multi-byte/emoji truncation
	runes := []rune(cleanLine)

	// Max 75 chars: prevents wrapping on standard 80-column terminals.
	// If a line wraps, \033[A cursor math breaks and causes duplicate lines!
	if len(runes) > 75 {
		return tailStyle.Render("  │ " + string(runes[:72]) + "...")
	}
	return tailStyle.Render("  │ " + string(runes))
}

func getFallbackError(output, errorOut string, err error) string {
	errStr := strings.TrimSpace(errorOut)
	if errStr == "" {
		errStr = strings.TrimSpace(output)
	}
	if errStr == "" {
		if err != nil {
			errStr = fmt.Sprintf("Task failed with no output.\nSystem Error: %v", err)
		} else {
			errStr = "Task failed with no output."
		}
	}
	return errStr
}

// ─── Sequential Runners ───────────────────────────────────────────────────────

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

	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()
	start := time.Now()
	done := make(chan struct{})
	lineCount, firstRender := 0, true

	go func() {
		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				mu.Lock()
				currentTail := append([]string(nil), tail...) // copy tail safely
				mu.Unlock()

				if !firstRender {
					fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
				}
				firstRender, lineCount = false, 0

				activeText := lipgloss.NewStyle().Foreground(lipgloss.Color("3")).Render("🚀 ACTIVE")
				fmt.Printf("  %-25s %s (%.1fs)\n", name, activeText, time.Since(start).Seconds())
				lineCount++

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

	if err != nil {
		if ctx.Err() != nil {
			Error(fmt.Sprintf("%s was cancelled.", name))
			osExit(1)
		}
		if _, isExitError := err.(*exec.ExitError); !isExitError {
			Fatal(err.Error())
		}
	}

	if cmd.ProcessState != nil && cmd.ProcessState.Success() {
		Success(name + " completed.")
		output := strings.TrimSpace(outBuf.String())
		if output != "" && !Quiet {
			lines := strings.Split(output, "\n")
			if len(lines) > 8 {
				lines = lines[len(lines)-8:]
			}
			BoxOutput(name, strings.Join(lines, "\n"), lipgloss.Color("6"))
		}
	} else {
		Error(name + " failed.")
		BoxOutput("Error Detail: "+name, getFallbackError(outBuf.String(), "", err), lipgloss.Color("1"))
		osExit(1)
	}
}

func RunStepByID(id string, data any) {
	step, err := GetStepByID(id)
	if err != nil {
		Fatal(fmt.Sprintf("Step %q not found: %v", id, err))
	}
	cmdStr, err := EvaluateCommand(step.Command, data)
	if err != nil {
		Fatal(fmt.Sprintf("Failed to map step %q: %v", id, err))
	}
	runCommand(step.Name, cmdStr, step.Cwd)
}

func RunStep(name, command string) {
	runCommand(name, command, "")
}

func RunInteractive(name, command, cwd string) {
	Step("Running: " + name)

	// FIX: We do NOT use NotifyContext here. We temporarily catch SIGINT so
	// the Go CLI doesn't crash, allowing the terminal to naturally pass
	// the SIGINT to the interactive child process (e.g. Python).
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(c)

	cmd := exec.Command("bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr

	if err := cmd.Run(); err != nil {
		Error(fmt.Sprintf("%s failed: %v", name, err))
		osExit(1)
	}
	Success(name + " completed.")
}

// ─── Parallel Queue ───────────────────────────────────────────────────────────

type taskState struct {
	task      Task
	status    string
	startTime time.Time
	elapsed   time.Duration
	tail      []string
}

type queueContext struct {
	ctx             context.Context
	cancel          context.CancelFunc
	tasks           []Task
	states          []*taskState
	results         []TaskResult
	taskChan        chan int
	mu              sync.Mutex
	wg              sync.WaitGroup
	failed          bool
	interrupted     bool
	continueOnError bool
}

func RunQueue(ids []string, workerCount int, continueOnError bool) {
	tasks := make([]Task, 0, len(ids))
	for _, id := range ids {
		tasks = append(tasks, MustGetTask(id))
	}
	if len(tasks) == 0 {
		return
	}

	Info(fmt.Sprintf("Starting task queue with %d workers...", workerCount))
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	q := &queueContext{
		ctx:             ctx,
		cancel:          cancel,
		tasks:           tasks,
		states:          make([]*taskState, len(tasks)),
		results:         make([]TaskResult, len(tasks)),
		taskChan:        make(chan int, len(tasks)),
		continueOnError: continueOnError,
	}

	for i := range tasks {
		q.states[i] = &taskState{task: tasks[i], status: statusQueued}
		q.taskChan <- i
	}

	// FIX: We MUST close the channel immediately after queuing!
	// This tells the workers to gracefully exit once the queue is empty.
	close(q.taskChan)

	// FIX: Use a buffer of 2 so a double Ctrl+C can bypass hangs
	sigChan := make(chan os.Signal, 2)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	go func() {
		sig := <-sigChan
		Info(fmt.Sprintf("\nReceived %v, stopping tasks... (Press Ctrl+C again to force quit)", sig))
		q.mu.Lock()
		q.interrupted = true
		q.mu.Unlock()
		q.cancel()

		// If a stuck subprocess ignores the SIGKILL, pressing Ctrl+C again forces exit immediately
		<-sigChan
		osExit(1)
	}()

	for i := 0; i < workerCount; i++ {
		q.wg.Add(1)
		go q.worker()
	}

	q.renderUI()

	if q.interrupted {
		fmt.Println("\n" + bold.Render("PIPELINE INTERRUPTED:"))
		q.mu.Lock()
		for i := range q.results {
			if s := q.states[i].status; s == statusActive || s == statusQueued {
				q.states[i].status = statusCancelled
				BoxOutput("Cancelled: "+q.tasks[i].Name, "Task was cancelled due to interrupt", lipgloss.Color("8"))
			}
		}
		q.mu.Unlock()
		osExit(1)
	}

	if q.failed {
		fmt.Println("\n" + bold.Render("PIPELINE FAILED:"))
		q.mu.Lock()
		for i, res := range q.results {
			if q.states[i].status == statusFailed {
				BoxOutput("Error: "+res.Name, getFallbackError(res.Output, res.ErrorOut, res.ExecErr), lipgloss.Color("1"))
			}
		}
		q.mu.Unlock()
		osExit(1)
	}

	Success("All tasks completed successfully!")
}

func (q *queueContext) worker() {
	defer q.wg.Done()

	for idx := range q.taskChan {
		select {
		case <-q.ctx.Done():
			return
		default:
		}

		q.mu.Lock()
		// If another task failed and we aren't continuing, skip this task
		if q.failed && !q.continueOnError {
			q.states[idx].status = statusCancelled
			q.results[idx] = TaskResult{Name: q.tasks[idx].Name}
			q.mu.Unlock()
			continue
		}

		q.states[idx].status = statusActive
		q.states[idx].startTime = time.Now()
		q.mu.Unlock()

		t := q.tasks[idx]
		var outBuf, errBuf bytes.Buffer
		pr, pw, _ := os.Pipe()

		cmd := createCmd(q.ctx, t.Command, t.Cwd)
		cmd.Stdout = io.MultiWriter(&outBuf, pw)
		cmd.Stderr = io.MultiWriter(&errBuf, pw)

		tailDone := make(chan struct{})
		go q.tailReader(pr, idx, tailDone)

		err := cmd.Run()
		_ = pw.Close()
		<-tailDone

		q.finalizeTask(idx, err, outBuf.String(), errBuf.String())
	}
}

func (q *queueContext) tailReader(r *os.File, idx int, done chan struct{}) {
	defer close(done)
	defer r.Close()
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		line := scanner.Text()
		q.mu.Lock()
		s := q.states[idx]
		s.tail = append(s.tail, line)
		if len(s.tail) > 5 {
			s.tail = s.tail[1:]
		}
		q.mu.Unlock()
	}
}

func (q *queueContext) finalizeTask(idx int, err error, output, errorOut string) {
	q.mu.Lock()
	defer q.mu.Unlock()

	s := q.states[idx]
	s.elapsed = time.Since(s.startTime)
	s.tail = nil // clear tail on finish

	if err != nil {
		if q.ctx.Err() != nil || q.interrupted {
			s.status = statusCancelled
		} else {
			s.status = statusFailed
			if !q.failed {
				q.failed = true
			}
		}
	} else {
		s.status = statusCompleted
	}

	q.results[idx] = TaskResult{
		Name:     q.tasks[idx].Name,
		Success:  err == nil,
		Output:   output,
		ErrorOut: errorOut,
		ExecErr:  err,
	}
}

func (q *queueContext) renderUI() {
	ticker := time.NewTicker(120 * time.Millisecond)
	defer ticker.Stop()
	firstRender, lineCount := true, 0

	render := func() {
		q.mu.Lock()
		defer q.mu.Unlock()

		if !firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
		}
		firstRender, lineCount = false, 0

		for _, s := range q.states {
			elapsed := s.elapsed
			if s.status == statusActive {
				elapsed = time.Since(s.startTime)
			}
			timeStr := fmt.Sprintf("(%.1fs)", elapsed.Seconds())

			var statusStr string
			switch s.status {
			case statusQueued:
				statusStr = lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Render("⏳ QUEUED")
			case statusActive:
				statusStr = lipgloss.NewStyle().Foreground(lipgloss.Color("3")).Render("🚀 ACTIVE") + " " + timeStr
			case statusCompleted:
				statusStr = lipgloss.NewStyle().Foreground(lipgloss.Color("2")).Render("✅ DONE  ") + " " + timeStr
			case statusFailed:
				statusStr = lipgloss.NewStyle().Foreground(lipgloss.Color("1")).Render("❌ FAILED") + " " + timeStr
			case statusCancelled:
				statusStr = lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Render("🚫 CANCEL")
			}

			fmt.Printf("  %-25s %s\n", s.task.Name, statusStr)
			lineCount++

			if !Quiet && s.status == statusActive && len(s.tail) > 0 {
				for _, line := range s.tail {
					fmt.Println(formatTailLine(line))
					lineCount++
				}
			}
		}
	}

	doneChan := make(chan struct{})
	go func() {
		q.wg.Wait()
		close(doneChan)
	}()

	for {
		select {
		case <-doneChan:
			render()
			return
		case <-ticker.C:
			render()
		}
	}
}
