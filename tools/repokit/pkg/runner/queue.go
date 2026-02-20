package runner

import (
	"bufio"
	"context"
	"fmt"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"repokit/pkg/core"
)

type queueContext struct {
	ids             []string
	workers         int
	continueOnError bool
	failed          bool
	mu              sync.Mutex
	wg              sync.WaitGroup
	ctx             context.Context
}

// RunQueue executes a list of task IDs in parallel
func RunQueue(ids []string, workers int, continueOnError bool) {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	q := &queueContext{
		ids:             ids,
		workers:         workers,
		continueOnError: continueOnError,
		ctx:             ctx,
	}

	taskChan := make(chan int, len(ids))
	for i := range ids {
		taskChan <- i
	}
	close(taskChan)

	q.startWorkers(taskChan)

	startPipeline := time.Now()
	q.wg.Wait()

	if !core.TuiMode && os.Getenv("REPOKIT_NESTED") != "1" {
		totalDur := time.Since(startPipeline).Seconds()
		if q.failed {
			fmt.Printf("\n  %s Pipeline completed with failures | %s %.1fs\n\n", core.Red.Render("●"), core.Subtle.Render("⏱"), totalDur)
		} else {
			fmt.Printf("\n  %s Pipeline completed successfully | %s %.1fs\n\n", core.Green.Render("●"), core.Subtle.Render("⏱"), totalDur)
		}
	}

	core.PublishEvent(core.EventPipelineDone, "pipeline", "")

	if q.failed {
		if os.Getenv("REPOKIT_NESTED") != "1" && !core.TuiMode {
			fmt.Println("\n" + core.Bold.Render("PIPELINE FAILED"))
		}
		// If in TUI mode, we rely on the TUI to handle the error presentation and exit gracefully
		if !core.TuiMode {
			os.Exit(1)
		} else {
			// Trigger a panic so our TUI's runner recovery grabs it
			panic("pipeline failed")
		}
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
	id := q.ids[idx]
	task, _ := core.GetTaskByID(id)

	select {
	case <-q.ctx.Done():
		core.PublishEvent(core.EventTaskError, id, "cancelled")
		return
	default:
	}

	q.mu.Lock()
	if q.failed && !q.continueOnError {
		q.mu.Unlock()
		core.PublishEvent(core.EventTaskError, id, "cancelled due to previous failure")
		return
	}
	q.mu.Unlock()

	core.PublishEvent(core.EventTaskStart, id, task.Name)

	var cmdStr string
	if task.Type == "batch" || task.Type == "sequential" || len(task.Tasks) > 0 {
		executable, _ := os.Executable()
		if executable == "" {
			executable = os.Args[0]
		}
		cmdStr = fmt.Sprintf("%q %q", executable, id)
	} else {
		cmdStr, _ = core.EvaluateCommand(task.Command, nil)
	}

	cmd := createCmd(q.ctx, cmdStr, task.Cwd)
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
			core.PublishEvent(core.EventTaskLog, id, line)
			if !core.TuiMode && !core.Quiet {
				fmt.Printf("[%s] %s\n", task.Name, line)
			}
		}
	}()

	err := cmd.Run()
	_ = pw.Close()

	if err != nil {
		q.mu.Lock()
		q.failed = true
		q.mu.Unlock()
		core.PublishEvent(core.EventTaskError, id, err.Error())
	} else {
		core.PublishEvent(core.EventTaskDone, id, "")
	}
}
