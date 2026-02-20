package runner

import (
	"regexp"
	"repokit/pkg/core"

	"os"

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

	task, err := core.GetTaskByID(id)
	if err != nil {
		core.Fatal("%v", err)
	}

	// 1. Pre-Run Hooks
	for _, preID := range task.PreRun {
		RunTask(preID, data, visited)
	}

	// 2. Main Execution: Route pipelines vs single commands properly
	if task.Type == "batch" || task.Type == "sequential" || len(task.Tasks) > 0 {
		RunPipeline(id, &task, visited)
	} else {
		cmdStr, err := core.EvaluateCommand(task.Command, data)
		if err != nil {
			core.Fatal("Template error in %q: %v", id, err)
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
func RunPipeline(id string, cfg *core.TaskConfig, visited map[string]bool) {
	if os.Getenv("REPOKIT_NESTED") != "1" {
		core.Info("Pipeline: %s", cfg.Name)
	}

	if cfg.Type == "batch" && cfg.Parallel {
		workers := cfg.Workers
		if workers <= 0 {
			workers = 3
		}
		RunQueue(cfg.Tasks, workers, cfg.ContinueOnError)
	} else {
		// Sequential Pipeline (or batch with parallel: false)
		for _, taskID := range cfg.Tasks {
			RunTask(taskID, nil, visited)
		}
	}
}
