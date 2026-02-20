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

// ─── Types & Constants ───────────────────────────────────────────────────────

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

var (
	tailStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))
	ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)
)

// ─── Shared Helpers ───────────────────────────────────────────────────────────

// createCmd creates a context-aware command that kills entire process groups safely.
func createCmd(ctx context.Context, command, cwd string) *exec.Cmd {
	cmd := exec.CommandContext(ctx, "bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	// Setpgid ensures the shell and its children are in the same process group
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}

	// Custom Cancel function to ensure we hit the whole process group
	cmd.Cancel = func() error {
		if cmd.Process == nil {
			return nil
		}
		pgid, err := syscall.Getpgid(cmd.Process.Pid)
		if err == nil {
			// First attempt graceful termination
			_ = syscall.Kill(-pgid, syscall.SIGTERM)

			// Give it 2 seconds to exit gracefully before SIGKILL
			time.AfterFunc(2*time.Second, func() {
				_ = syscall.Kill(-pgid, syscall.SIGKILL)
			})
			return nil
		}
		return cmd.Process.Kill()
	}
	return cmd
}

func formatTailLine(line string) string {
	clean := ansiRegex.ReplaceAllString(line, "")
	clean = strings.Map(func(r rune) rune {
		if r == '\r' || r == '\n' {
			return -1
		}
		if r == '\t' {
			return ' '
		}
		return r
	}, clean)

	runes := []rune(clean)
	const maxLen = 85
	if len(runes) > maxLen {
		clean = string(runes[:maxLen-3]) + "..."
	} else {
		clean = string(runes)
	}

	return tailStyle.Render("  │ " + clean)
}

func getFallbackError(output, errorOut string, err error) string {
	errStr := strings.TrimSpace(errorOut)
	if errStr == "" {
		errStr = strings.TrimSpace(output)
	}
	if errStr == "" {
		if err != nil {
			errStr = fmt.Sprintf("Process exited with error: %v", err)
		} else {
			errStr = "Process failed silently with no output."
		}
	}
	return errStr
}

// ─── Sequential Runner ────────────────────────────────────────────────────────

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
				currentTail := append([]string(nil), tail...)
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
			fmt.Println("\n" + yellow.Render(fmt.Sprintf("⏹️  %s cancelled by user.", name)))
			osExit(1)
		}
		if _, ok := err.(*exec.ExitError); !ok {
			Fatal(err.Error())
		}
	}

	if cmd.ProcessState != nil && cmd.ProcessState.Success() {
		Success(name + " finished.")
		output := strings.TrimSpace(outBuf.String())
		if output != "" && !Quiet {
			lines := strings.Split(output, "\n")
			if len(lines) > 10 {
				lines = lines[len(lines)-10:]
			}
			BoxOutput(name, strings.Join(lines, "\n"), lipgloss.Color("6"))
		}
	} else {
		Error(name + " failed.")
		BoxOutput("Failure Detail: "+name, getFallbackError(outBuf.String(), "", err), lipgloss.Color("1"))
		osExit(1)
	}
}

func RunStepByID(id string, data any) {
	step, err := GetStepByID(id)
	if err != nil {
		Fatal(fmt.Sprintf("Task ID %q not found: %v", id, err))
	}
	cmdStr, err := EvaluateCommand(step.Command, data)
	if err != nil {
		Fatal(fmt.Sprintf("Template error in %q: %v", id, err))
	}
	runCommand(step.Name, cmdStr, step.Cwd)
}

func RunStep(name, command string) {
	runCommand(name, command, "")
}

func RunInteractive(name, command, cwd string) {
	Step("Interactive: " + name)

	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(c)

	cmd := exec.Command("bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr

	if err := cmd.Run(); err != nil {
		Error(fmt.Sprintf("%s exited with error: %v", name, err))
		osExit(1)
	}
	Success(name + " done.")
}

// ─── Parallel Queue Runner ───────────────────────────────────────────────────

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

	Info(fmt.Sprintf("Queue initialized: %d tasks | %d workers", len(tasks), workerCount))

	// Create a context that respects Ctrl+C
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
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
	close(q.taskChan)

	// Monitor for the interruption via the context
	go func() {
		<-ctx.Done()
		if ctx.Err() != nil {
			q.mu.Lock()
			q.interrupted = true
			q.mu.Unlock()
			Info("\nInterrupt received. Signaling workers to stop...")
		}
	}()

	for i := 0; i < workerCount; i++ {
		q.wg.Add(1)
		go q.worker()
	}

	q.renderUI()

	if q.interrupted {
		fmt.Println("\n" + bold.Render("PIPELINE CANCELLED"))
		q.mu.Lock()
		for i := range q.results {
			if s := q.states[i].status; s == statusActive || s == statusQueued {
				q.states[i].status = statusCancelled
			}
		}
		q.mu.Unlock()
		osExit(1)
	}

	if q.failed {
		fmt.Println("\n" + bold.Render("PIPELINE FAILED"))
		q.mu.Lock()
		for i, res := range q.results {
			if q.states[i].status == statusFailed {
				BoxOutput("Error: "+res.Name, getFallbackError(res.Output, res.ErrorOut, res.ExecErr), lipgloss.Color("1"))
			}
		}
		q.mu.Unlock()
		osExit(1)
	}

	Success("Pipeline execution successful.")
}

func (q *queueContext) worker() {
	defer q.wg.Done()

	for idx := range q.taskChan {
		select {
		case <-q.ctx.Done():
			q.mu.Lock()
			q.states[idx].status = statusCancelled
			q.mu.Unlock()
			return
		default:
		}

		q.mu.Lock()
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
	s.tail = nil

	if err != nil {
		if q.ctx.Err() != nil || q.interrupted {
			s.status = statusCancelled
		} else {
			s.status = statusFailed
			q.failed = true
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
	ticker := time.NewTicker(100 * time.Millisecond)
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
