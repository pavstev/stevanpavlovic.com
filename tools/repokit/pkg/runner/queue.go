package runner

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

	"repokit/pkg/config"
	"repokit/pkg/log"

	"github.com/charmbracelet/lipgloss"
)

type taskState struct {
	name      string
	status    string
	startTime time.Time
	elapsed   time.Duration
	tail      []string
}

type queueContext struct {
	states          []*taskState
	ids             []string
	workers         int
	continueOnError bool
	failed          bool
	mu              sync.Mutex
	wg              sync.WaitGroup
	ctx             context.Context
}

// RunQueue executes a list of task IDs in parallel with a dynamic UI spinner and logging tail.
func RunQueue(ids []string, workers int, continueOnError bool) {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	q := &queueContext{
		states:          make([]*taskState, len(ids)),
		ids:             ids,
		workers:         workers,
		continueOnError: continueOnError,
		ctx:             ctx,
	}

	taskChan := make(chan int, len(ids))
	for i, id := range ids {
		t, _ := config.GetTaskByID(id)
		q.states[i] = &taskState{name: t.Name, status: statusQueued}
		taskChan <- i
	}
	close(taskChan)

	q.startWorkers(taskChan)

	startPipeline := time.Now()
	done := make(chan struct{})
	go func() {
		q.wg.Wait()
		close(done)
	}()

	ticker := time.NewTicker(80 * time.Millisecond)
	defer ticker.Stop()
	firstRender, lineCount := true, 0

	for processing := true; processing; {
		select {
		case <-done:
			processing = false
		case <-ticker.C:
			firstRender, lineCount = q.renderUI(firstRender, lineCount)
		}
	}
	q.renderUI(false, lineCount)

	q.printSummary(startPipeline)

	if q.failed {
		if os.Getenv("REPOKIT_NESTED") != "1" {
			fmt.Println("\n" + log.Bold.Render("PIPELINE FAILED"))
		}
		os.Exit(1)
	}
}

func (q *queueContext) startWorkers(taskChan <-chan int) {
	for i := 0; i < q.workers; i++ {
		q.wg.Add(1)
		go func() {
			defer q.wg.Done()
			for idx := range taskChan {
				q.processTask(idx)
			}
		}()
	}
}

func (q *queueContext) processTask(idx int) {
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
		q.mu.Unlock()
		return
	}
	q.states[idx].status = statusActive
	q.states[idx].startTime = time.Now()
	q.mu.Unlock()

	id := q.ids[idx]
	task, _ := config.GetTaskByID(id)

	var cmdStr string
	if task.Type == "batch" || task.Type == "sequential" || len(task.Tasks) > 0 {
		executable, _ := os.Executable()
		if executable == "" {
			executable = os.Args[0]
		}
		cmdStr = fmt.Sprintf("%q %q", executable, id)
	} else {
		cmdStr, _ = config.EvaluateCommand(task.Command, nil)
	}

	cmd := createCmd(q.ctx, cmdStr, task.Cwd)
	cmd.Env = os.Environ()
	if task.Type == "batch" || task.Type == "sequential" || len(task.Tasks) > 0 {
		cmd.Env = append(cmd.Env, "REPOKIT_NESTED=1")
	}

	pr, pw, _ := os.Pipe()
	cmd.Stdout, cmd.Stderr = pw, pw

	go func(sIdx int) {
		scanner := bufio.NewScanner(pr)
		for scanner.Scan() {
			line := scanner.Text()
			q.mu.Lock()
			q.states[sIdx].tail = append(q.states[sIdx].tail, line)
			if len(q.states[sIdx].tail) > 5 {
				q.states[sIdx].tail = q.states[sIdx].tail[1:]
			}
			q.mu.Unlock()
		}
	}(idx)

	err := cmd.Run()
	_ = pw.Close()

	q.mu.Lock()
	defer q.mu.Unlock()
	q.states[idx].elapsed = time.Since(q.states[idx].startTime)
	if err != nil {
		q.states[idx].status = statusFailed
		q.failed = true
		if os.Getenv("REPOKIT_NESTED") == "1" {
			fmt.Printf("Error in %s:\n", q.states[idx].name)
			for _, t := range q.states[idx].tail {
				fmt.Println(t)
			}
		}
	} else {
		q.states[idx].status = statusCompleted
	}
}

func (q *queueContext) renderUI(firstRender bool, lineCount int) (bool, int) {
	if os.Getenv("REPOKIT_NESTED") == "1" {
		return firstRender, lineCount
	}
	q.mu.Lock()
	defer q.mu.Unlock()

	if !firstRender {
		fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
	}
	newLineCount := 0
	spinnerIdx := int(time.Now().UnixMilli()/80) % len(log.Spinners)

	for _, s := range q.states {
		var icon, statText string
		durStr := fmt.Sprintf("%5.1fs", s.elapsed.Seconds())

		switch s.status {
		case statusCompleted:
			icon = log.Green.Render("•")
			statText = log.Green.Bold(true).Render("✅")
		case statusFailed:
			icon = log.Red.Render("•")
			statText = log.Red.Bold(true).Render("❌")
		case statusActive:
			icon = log.Blue.Render(log.Spinners[spinnerIdx])
			statText = log.Blue.Bold(true).Render("⏳")
			durStr = fmt.Sprintf("%5.1fs", time.Since(s.startTime).Seconds())
		case statusCancelled:
			icon = log.Subtle.Render("•")
			statText = log.Subtle.Render("⛔")
			durStr = log.Subtle.Render("  --.-s")
		default:
			icon = log.Subtle.Render("○")
			statText = log.Subtle.Render("🕒")
			durStr = log.Subtle.Render("  --.-s")
		}

		padLen := 38 - lipgloss.Width(s.name)
		if padLen < 2 {
			padLen = 2
		}
		dots := log.Subtle.Render(strings.Repeat(".", padLen))
		nameStr := s.name + " " + dots
		statStr := lipgloss.NewStyle().Width(4).Render(statText)

		fmt.Printf(" %s  %s %s %s\n", icon, nameStr, statStr, durStr)
		newLineCount++

		if len(s.tail) > 0 && (s.status == statusActive || s.status == statusFailed) && !log.Quiet {
			for _, tl := range s.tail {
				fmt.Println(formatTailLine(tl))
				newLineCount++
			}
		}
	}
	return false, newLineCount
}

func (q *queueContext) printSummary(startPipeline time.Time) {
	if os.Getenv("REPOKIT_NESTED") == "1" {
		return
	}
	totalDur := time.Since(startPipeline).Seconds()
	completed, failedTasks := 0, 0
	for _, s := range q.states {
		if s.status == statusCompleted {
			completed++
		} else if s.status == statusFailed {
			failedTasks++
		}
	}

	fmt.Println()
	fmt.Printf("  %s %d completed", log.Green.Render("●"), completed)
	if failedTasks > 0 {
		fmt.Printf(" | %s %d failed", log.Red.Render("●"), failedTasks)
	}
	fmt.Printf(" | %s %d total | %s %.1fs\n\n", log.Blue.Render("●"), len(q.states), log.Subtle.Render("⏱"), totalDur)
}
