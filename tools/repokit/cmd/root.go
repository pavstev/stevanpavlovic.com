package cmd

import (
	"fmt"
	"os"
	"repokit/pkg/commands"
	"repokit/pkg/core"
	"repokit/pkg/runner"
	"repokit/pkg/tui"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/spf13/cobra"
)

var (
	noTui bool
)

var rootCmd = &cobra.Command{
	Use:   "repokit",
	Short: "Repokit: The Ultimate Repository Orchestrator TUI",
	Run: func(cmd *cobra.Command, args []string) {
		if noTui {
			_ = cmd.Help()
			return
		}
		launchTUIWithTask("")
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() {
	// Register fixed commands
	commands.RegisterCommands(rootCmd)

	// Dynamically register tasks as headless subcommands if not already present
	if config, err := core.GetConfig(); err == nil {
		existingCmds := make(map[string]bool)
		for _, cmd := range rootCmd.Commands() {
			existingCmds[cmd.Name()] = true
		}

		for id, task := range config.Tasks {
			if existingCmds[id] {
				continue
			}
			taskID := id // Capture for closure
			cmd := &cobra.Command{
				Use:   taskID,
				Short: task.Description,
				Run: func(cmd *cobra.Command, args []string) {
					if noTui {
						runner.RunTask(taskID, nil, nil)
						return
					}
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

	p := tea.NewProgram(m, tea.WithAltScreen(), tea.WithMouseCellMotion())
	if _, err := p.Run(); err != nil {
		fmt.Println("Error running TUI:", err)
		os.Exit(1)
	}
}

func init() {
	// Setup global flags
	rootCmd.PersistentFlags().BoolVarP(&core.Quiet, "quiet", "q", false, "suppress output")
	rootCmd.PersistentFlags().BoolVar(&noTui, "no-tui", false, "disable TUI and run in headless mode")
}
