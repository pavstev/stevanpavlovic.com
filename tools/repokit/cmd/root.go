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
		launchTUI()
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func launchTUI() {
	m, err := tui.NewModel()
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
