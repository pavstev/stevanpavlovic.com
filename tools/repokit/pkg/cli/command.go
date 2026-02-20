package cli

import (
	"fmt"
	"sync"

	"github.com/spf13/cobra"
)

// ─── Config Structs ───────────────────────────────────────────────────────────

// QueueConfig holds configuration for a queue command (parallel execution).
type QueueConfig struct {
	TaskIDs         []string
	Workers         int
	ContinueOnError bool
	PreRun          func()
	PostRun         func(success bool)
}

// PhaseConfig holds configuration for a multi-phase pipeline.
type PhaseConfig struct {
	Workers         int
	ContinueOnError bool
	PrePhase        func(phase int)
	PostPhase       func(phase int, success bool)
}

// CommandData holds data passed to commands for template interpolation.
type CommandData struct {
	Message string
	ID      string
	Args    []string
	Extra   map[string]any
}

// ─── Command Factories ───────────────────────────────────────────────────────

// NewQueueCommand creates a cobra command that runs a set of tasks in parallel.
func NewQueueCommand(use, short string, cfg *QueueConfig) *cobra.Command {
	if cfg.Workers == 0 {
		cfg.Workers = 3
	}

	cmd := &cobra.Command{
		Use:   use,
		Short: short,
		Run: func(cmd *cobra.Command, args []string) {
			if cfg.PreRun != nil {
				cfg.PreRun()
			}

			cont, _ := cmd.Flags().GetBool("continue")
			RunQueue(cfg.TaskIDs, cfg.Workers, cfg.ContinueOnError || cont)

			if cfg.PostRun != nil {
				cfg.PostRun(true)
			}
		},
	}
	cmd.Flags().Bool("continue", false, "continue running tasks even if some fail")
	return cmd
}

// NewPhaseCommand runs multiple task queues in sequence.
func NewPhaseCommand(use, short string, cfg *PhaseConfig, phases ...[]string) *cobra.Command {
	if cfg.Workers == 0 {
		cfg.Workers = 3
	}

	return &cobra.Command{
		Use:   use,
		Short: short,
		Run: func(cmd *cobra.Command, args []string) {
			for i, phase := range phases {
				if cfg.PrePhase != nil {
					cfg.PrePhase(i)
				}

				Info(fmt.Sprintf("Phase %d: Running %d tasks...", i+1, len(phase)))
				RunQueue(phase, cfg.Workers, cfg.ContinueOnError)

				if cfg.PostPhase != nil {
					cfg.PostPhase(i, true)
				}
			}
			Success("All phases completed!")
		},
	}
}

// NewDataCommand creates a command that accepts --message and --id flags.
func NewDataCommand(use, short string, taskID string) *cobra.Command {
	var message string
	var id string

	cmd := &cobra.Command{
		Use:   use,
		Short: short,
		Run: func(cmd *cobra.Command, args []string) {
			data := &CommandData{
				Message: message,
				ID:      id,
				Args:    args,
			}
			RunTask(taskID, data, map[string]bool{})
		},
	}

	cmd.Flags().StringVar(&message, "message", "", "Message to pass to the task")
	cmd.Flags().StringVar(&id, "id", "", "ID to pass to the task")

	return cmd
}

// NewStepCommand creates a simple command that passes arguments to a task.
func NewStepCommand(use, short string, taskID string) *cobra.Command {
	return &cobra.Command{
		Use:   use,
		Short: short,
		Run: func(cmd *cobra.Command, args []string) {
			RunTask(taskID, &CommandData{Args: args}, map[string]bool{})
		},
	}
}

// NewSimpleCommand creates a cobra command with a custom run function.
func NewSimpleCommand(use, short string, runFn func(*cobra.Command, []string)) *cobra.Command {
	return &cobra.Command{
		Use:   use,
		Short: short,
		Run:   runFn,
	}
}

// ─── Registration & Queue Logic ─────────────────────────────────────────────

var (
	rootCmd     *cobra.Command
	pendingCmds []*cobra.Command
	mu          sync.Mutex
)

// SetRootCommand assigns the global root command and flushes any pending registrations.
func SetRootCommand(cmd *cobra.Command) {
	mu.Lock()
	defer mu.Unlock()

	rootCmd = cmd

	// Add any commands that were registered before the root was ready
	for _, c := range pendingCmds {
		rootCmd.AddCommand(c)
	}
	pendingCmds = nil
}

// AddToRoot registers a command to the global root command.
// If the root is not yet set, it queues the command for later registration.
func AddToRoot(cmd *cobra.Command) {
	mu.Lock()
	defer mu.Unlock()

	if rootCmd == nil {
		pendingCmds = append(pendingCmds, cmd)
		return
	}
	rootCmd.AddCommand(cmd)
}
