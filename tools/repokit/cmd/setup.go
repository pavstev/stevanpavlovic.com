package cmd

import (
	"repokit/pkg/setup"

	"github.com/spf13/cobra"
)

var setupContinueOnError bool

var setupCmd = &cobra.Command{
	Use:   "setup",
	Short: "Starting Project Hybrid Setup",
	Run: func(cmd *cobra.Command, args []string) {
		setup.Run(setupContinueOnError)
	},
}

func init() {
	setupCmd.Flags().BoolVar(&setupContinueOnError, "continue", false, "continue running tasks even if some fail")
	rootCmd.AddCommand(setupCmd)
}
