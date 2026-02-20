package cmdutil

import (
	"fmt"
	"sync"

	"golib/pkg/cliutils"

	"github.com/spf13/cobra"
)

// ─── Config Structs ───────────────────────────────────────────────────────────

// QueueConfig holds configuration for a queue command.
type QueueConfig struct {
	// TaskIDs is a list of task IDs from tasks.yaml to run. Required.
	TaskIDs []string
	// Workers is the number of parallel workers. Default: 3
	Workers int
	// ContinueOnError determines whether to continue if a task fails. Default: false
	ContinueOnError bool
	// PreRun is a function to run before the queue starts. Optional.
	PreRun func()
	// PostRun is a function to run after the queue finishes. Optional.
	PostRun func(success bool)
}

// DataConfig holds configuration for a data command.
type DataConfig struct {
	// TaskID is the task ID from tasks.yaml to run. Required.
	TaskID string
	// PreRun is a function to run before the step. Optional.
	PreRun func()
	// PostRun is a function to run after the step finishes. Optional.
	PostRun func(success bool)
	// CustomFlags is a function to add custom flags. Optional.
	CustomFlags func(*cobra.Command)
	// Message is a pre-configured message to pass to the task.
	Message string
	// ID is a pre-configured ID to pass to the task.
	ID string
}

// StepConfig holds configuration for a step command.
type StepConfig struct {
	// TaskID is the task ID from tasks.yaml to run. Required.
	TaskID string
	// PreRun is a function to run before the step. Optional.
	PreRun func()
	// PostRun is a function to run after the step finishes. Optional.
	PostRun func(success bool)
	// CustomFlags is a function to add custom flags. Optional.
	CustomFlags func(*cobra.Command)
}

// PhaseConfig holds configuration for a multi-phase command.
type PhaseConfig struct {
	// Workers is the number of parallel workers per phase. Default: 3
	Workers int
	// ContinueOnError determines whether to continue if a task fails. Default: false
	ContinueOnError bool
	// PrePhase is a function to run before each phase. Receives phase index (0-based). Optional.
	PrePhase func(phase int)
	// PostPhase is a function to run after each phase. Receives phase index and success bool. Optional.
	PostPhase func(phase int, success bool)
}

// CommandData holds data passed to commands.
// Use this struct to pass variables to command templates.
type CommandData struct {
	// Message is a general-purpose message field.
	Message string
	// ID is a general-purpose ID field.
	ID string
	// Args contains remaining command-line arguments.
	Args []string
	// Extra contains any additional key-value pairs for template expansion.
	Extra map[string]any
}

// NewCommandData creates a new CommandData instance.
func NewCommandData() *CommandData {
	return &CommandData{
		Extra: make(map[string]any),
	}
}

// WithMessage sets the Message field.
func (d *CommandData) WithMessage(msg string) *CommandData {
	d.Message = msg
	return d
}

// WithID sets the ID field.
func (d *CommandData) WithID(id string) *CommandData {
	d.ID = id
	return d
}

// WithArg adds an argument to the Args slice.
func (d *CommandData) WithArg(arg string) *CommandData {
	d.Args = append(d.Args, arg)
	return d
}

// WithExtra adds an extra key-value pair for template expansion.
func (d *CommandData) WithExtra(key string, value any) *CommandData {
	d.Extra[key] = value
	return d
}

// ─── Queue Command ───────────────────────────────────────────────────────────

// NewQueueCommand creates a new cobra command that runs a queue of tasks.
//
// Example:
//
//	cfg := &cmdutil.QueueConfig{
//	    TaskIDs: []string{"build_astro", "build_go"},
//	    Workers: 3,
//	    ContinueOnError: false,
//	}
//	cmd := cmdutil.NewQueueCommand("build", "Build the project", cfg)
func NewQueueCommand(use, short string, cfg *QueueConfig) *cobra.Command {
	if cfg == nil || len(cfg.TaskIDs) == 0 {
		panic("QueueConfig with TaskIDs is required")
	}
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

			continueOnError, _ := cmd.Flags().GetBool("continue")
			cfg.ContinueOnError = continueOnError

			cliutils.RunQueue(cfg.TaskIDs, cfg.Workers, cfg.ContinueOnError)

			if cfg.PostRun != nil {
				cfg.PostRun(true)
			}
		},
	}

	// Add standard --continue flag
	cmd.Flags().Bool("continue", false, "continue running tasks even if some fail")

	return cmd
}

// ─── Data Command ───────────────────────────────────────────────────────────

// NewDataCommand creates a new cobra command that runs a single task with data.
// Data can be passed via flags (--message, --id) or as arguments.
//
// Example:
//
//	config := &cmdutil.DataConfig{
//	    TaskID: "resume_export",
//	}
//	cmd := cmdutil.NewDataCommand("resume", "Export resume", config)
func NewDataCommand(use, short string, cfg *DataConfig) *cobra.Command {
	if cfg == nil || cfg.TaskID == "" {
		panic("DataConfig with TaskID is required")
	}

	cmd := &cobra.Command{
		Use:   use,
		Short: short,
		Run: func(cmd *cobra.Command, args []string) {
			data := &CommandData{
				Message: cfg.Message,
				ID:      cfg.ID,
				Args:    args,
			}

			if cfg.PreRun != nil {
				cfg.PreRun()
			}

			cliutils.RunStepByID(cfg.TaskID, data)

			if cfg.PostRun != nil {
				cfg.PostRun(true)
			}
		},
	}

	// Add standard flags
	cmd.Flags().StringVar(&cfg.Message, "message", "", "Message to pass to the task")
	cmd.Flags().StringVar(&cfg.ID, "id", "", "ID to pass to the task")

	// Add custom flags if provided
	if cfg.CustomFlags != nil {
		cfg.CustomFlags(cmd)
	}

	return cmd
}

// ─── Step Command ───────────────────────────────────────────────────────────

// NewStepCommand creates a new cobra command that runs a single task sequentially.
// This is useful for commands that need to run a single task with a spinner.
//
// Example:
//
//	config := &cmdutil.StepConfig{
//	    TaskID: "chmod_scripts",
//	}
//	cmd := cmdutil.NewStepCommand("chmod", "Fix script permissions", config)
func NewStepCommand(use, short string, cfg *StepConfig) *cobra.Command {
	if cfg == nil || cfg.TaskID == "" {
		panic("StepConfig with TaskID is required")
	}

	cmd := &cobra.Command{
		Use:   use,
		Short: short,
		Run: func(cmd *cobra.Command, args []string) {
			data := &CommandData{
				Args: args,
			}

			if cfg.PreRun != nil {
				cfg.PreRun()
			}

			cliutils.RunStepByID(cfg.TaskID, data)

			if cfg.PostRun != nil {
				cfg.PostRun(true)
			}
		},
	}

	if cfg.CustomFlags != nil {
		cfg.CustomFlags(cmd)
	}

	return cmd
}

// NewStepCommandWithData creates a new cobra command that runs a single task
// with data passed to the command template.
//
// Example:
//
//	config := &cmdutil.StepConfig{
//	    TaskID: "ls_files",
//	    CustomFlags: func(cmd *cobra.Command) {
//	        var exclude string
//	        cmd.Flags().StringVar(&exclude, "exclude", "", "Exclude pattern")
//	    },
//	}
//	cmd := cmdutil.NewStepCommandWithData("ls", "List files", config)
func NewStepCommandWithData(use, short string, cfg *StepConfig) *cobra.Command {
	if cfg == nil || cfg.TaskID == "" {
		panic("StepConfig with TaskID is required")
	}

	message := ""
	id := ""

	cmd := &cobra.Command{
		Use:   use,
		Short: short,
		Run: func(cmd *cobra.Command, args []string) {
			data := &CommandData{
				Message: message,
				ID:      id,
				Args:    args,
			}

			if cfg.PreRun != nil {
				cfg.PreRun()
			}

			cliutils.RunStepByID(cfg.TaskID, data)

			if cfg.PostRun != nil {
				cfg.PostRun(true)
			}
		},
	}

	cmd.Flags().StringVar(&message, "message", "", "Message to pass to the task")
	cmd.Flags().StringVar(&id, "id", "", "ID to pass to the task")

	if cfg.CustomFlags != nil {
		cfg.CustomFlags(cmd)
	}

	return cmd
}

// ─── Simple Command ──────────────────────────────────────────────────────────

// NewSimpleCommand creates a new cobra command with a custom run function.
// This provides full control over the command behavior.
//
// Example:
//
//	cmd := cmdutil.NewSimpleCommand("version", "Print version", func(cmd *cobra.Command, args []string) {
//	    fmt.Println("v1.0.0")
//	})
func NewSimpleCommand(use, short string, runFn func(*cobra.Command, []string)) *cobra.Command {
	return &cobra.Command{
		Use:   use,
		Short: short,
		Run:   runFn,
	}
}

// NewCommand creates a new cobra command with custom configuration.
// This is the most flexible option, giving full access to the cobra command.
//
// Example:
//
//	cmd := cmdutil.NewCommand("build", "Build the project", func(cmd *cobra.Command, args []string) {
//	    // custom logic
//	})
//	cmd.Flags().BoolVar(&myFlag, "fast", false, "Fast build")
//	return cmd
func NewCommand(use, short string, runFn func(*cobra.Command, []string)) *cobra.Command {
	return &cobra.Command{
		Use:   use,
		Short: short,
		Run:   runFn,
	}
}

// ─── Command Registration Helpers ───────────────────────────────────────────

// rootCmd is a reference to the root command set by the cli package.
var (
	rootCmd     *cobra.Command
	pendingCmds []*cobra.Command
	mu          sync.Mutex
)

// SetRootCommand sets the root command for cmdutil to use.
// Call this in your cmd/root.go after the rootCmd is defined.
// This also adds any commands that were registered before SetRootCommand was called.
func SetRootCommand(cmd *cobra.Command) {
	mu.Lock()
	defer mu.Unlock()

	rootCmd = cmd

	// Add any pending commands
	for _, c := range pendingCmds {
		rootCmd.AddCommand(c)
	}
	pendingCmds = nil
}

// AddToRoot adds a command to the root command.
//
// Example:
//
//	func init() {
//	    cmdutil.AddToRoot(cmdutil.NewQueueCommand(...))
//	}
func AddToRoot(cmd *cobra.Command) {
	mu.Lock()
	defer mu.Unlock()

	if rootCmd == nil {
		// Queue the command to be added later when SetRootCommand is called
		pendingCmds = append(pendingCmds, cmd)
		return
	}
	rootCmd.AddCommand(cmd)
}

// MustAdd is a helper that adds a command and panics on error.
//
// Example:
//
//	func init() {
//	    cmdutil.MustAdd(cmdutil.NewQueueCommand(...))
//	}
func MustAdd(cmd *cobra.Command) {
	AddToRoot(cmd)
}

// ─── Phase Command ──────────────────────────────────────────────────────────

// NewPhaseCommand runs multiple task queues in sequence.
// This is useful for commands that need to run multiple phases.
//
// Example:
//
//	config := &cmdutil.PhaseConfig{
//	    Workers: 3,
//	    ContinueOnError: false,
//	}
//	cmd := cmdutil.NewPhaseCommand("all", "Run full pipeline", config,
//	    []string{"lint_eslint", "lint_go", "lint_py"},       // Phase 1
//	    []string{"check_astro", "check_go", "check_py"},     // Phase 2
//	    []string{"test_vitest", "test_go", "test_py"},      // Phase 3
//	    []string{"build_astro", "build_go", "build_py"},    // Phase 4
//	)
func NewPhaseCommand(use, short string, cfg *PhaseConfig, phases ...[]string) *cobra.Command {
	if cfg == nil {
		cfg = &PhaseConfig{}
	}
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

				cliutils.Info(fmt.Sprintf("Phase %d: Running %d tasks...", i+1, len(phase)))
				cliutils.RunQueue(phase, cfg.Workers, cfg.ContinueOnError)

				if cfg.PostPhase != nil {
					cfg.PostPhase(i, true)
				}
			}
			cliutils.Success("All phases completed!")
		},
	}
}
