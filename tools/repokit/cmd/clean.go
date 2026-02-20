package cmd

import (
	"repokit/pkg/commands"
	"github.com/spf13/cobra"
)

var cleanForce bool

var cleanCmd = &cobra.Command{
	Use:   "clean",
	Short: "Clean project (removes git-ignored files and reinstalls deps)",
	Run: func(cmd *cobra.Command, args []string) {
		commands.RunClean(cleanForce)
	},
}

func init() {
	cleanCmd.Flags().BoolVar(&cleanForce, "force", false, "skip git-clean check and confirmation prompt")
	rootCmd.AddCommand(cleanCmd)
}
