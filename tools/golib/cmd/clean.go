package cmd

import (
	"golib/pkg/clean"

	"github.com/spf13/cobra"
)

var cleanForce bool

var cleanCmd = &cobra.Command{
	Use:   "clean",
	Short: "Clean project (removes git-ignored files and reinstalls deps)",
	Run: func(cmd *cobra.Command, args []string) {
		clean.Run(cleanForce)
	},
}

func init() {
	cleanCmd.Flags().BoolVar(&cleanForce, "force", false, "skip git-clean check and confirmation prompt")
	rootCmd.AddCommand(cleanCmd)
}
