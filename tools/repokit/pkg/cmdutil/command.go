package cmdutil

import (
	"sync"

	"repokit/pkg/cliutils"

	"github.com/spf13/cobra"
)

// QueueConfig holds configuration for a queue command.
type QueueConfig struct {
	TaskIDs         []string
	Workers         int
	ContinueOnError bool
	PreRun          func()
	PostRun         func(success bool)
}

// CommandData holds data passed to commands for template interpolation.
type CommandData struct {
	Message string
	ID      string
	Args    []string
	Extra   map[string]any
}

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
	rootCmd *cobra.Command
	mu      sync.Mutex
)

func SetRootCommand(cmd *cobra.Command) {
	mu.Lock()
	defer mu.Unlock()
	rootCmd = cmd
}

func AddToRoot(cmd *cobra.Command) {
	mu.Lock()
	defer mu.Unlock()
	if rootCmd != nil {
		rootCmd.AddCommand(cmd)
	}
}
