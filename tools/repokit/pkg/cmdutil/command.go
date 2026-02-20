package cmdutil

import (
	"sync"

	"repokit/pkg/cliutils"

	"github.com/spf13/cobra"
)

// CommandData holds data passed to commands for template interpolation.
type CommandData struct {
	Message string
	ID      string
	Args    []string
	Extra   map[string]any
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
			cliutils.RunTask(taskID, data, nil)
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
			cliutils.RunTask(taskID, &CommandData{Args: args}, nil)
		},
	}
}

var (
	rootCmd     *cobra.Command
	mu          sync.Mutex
)

// SetRootCommand assigns the global root command for dynamic registration.
func SetRootCommand(cmd *cobra.Command) {
	mu.Lock()
	defer mu.Unlock()
	rootCmd = cmd
}

// AddToRoot registers a command to the global root command.
func AddToRoot(cmd *cobra.Command) {
	mu.Lock()
	defer mu.Unlock()
	if rootCmd != nil {
		rootCmd.AddCommand(cmd)
	}
}
