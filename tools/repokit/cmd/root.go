package cmd

import (
	"fmt"
	"os"
	"repokit/pkg/core"
	"repokit/pkg/tui"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "repokit",
	Short: "Repokit: The Ultimate Repository Orchestrator TUI",
	Run: func(cmd *cobra.Command, args []string) {
		launchTUIWithTask("")
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() {
	// Dynamically register tasks as headless subcommands
	if config, err := core.GetConfig(); err == nil {
		for id, task := range config.Tasks {
			taskID := id // Capture for closure
			cmd := &cobra.Command{
				Use:   taskID,
				Short: task.Description,
				Run: func(cmd *cobra.Command, args []string) {
					launchTUIWithTask(taskID)
				},
			}
			rootCmd.AddCommand(cmd)
		}
	}

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func launchTUIWithTask(taskID string) {
	m, err := tui.NewAppModel(taskID)
	if err != nil {
		fmt.Println("Error initializing TUI:", err)
		os.Exit(1)
	}

	p := tea.NewProgram(m, tea.WithAltScreen())
	if _, err := p.Run(); err != nil {
		fmt.Println("Error running TUI:", err)
		os.Exit(1)
	}
}

func init() {
	// Setup global flags
	rootCmd.PersistentFlags().BoolVarP(&core.Quiet, "quiet", "q", false, "suppress output")
}
