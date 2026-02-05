package cmd

import (
	"golib/pkg/pack"

	"github.com/spf13/cobra"
)

var packCmd = &cobra.Command{
	Use:   "pack [directory]",
	Short: "Bundle directory contents into a single Markdown file",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		var targetDir string
		if len(args) > 0 {
			targetDir = args[0]
		}
		pack.Run(targetDir)
	},
}

func init() {
	rootCmd.AddCommand(packCmd)
}
