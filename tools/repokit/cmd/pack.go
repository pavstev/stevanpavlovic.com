package cmd

import (
	"repokit/pkg/commands"

	"github.com/spf13/cobra"
)

var packCmd = &cobra.Command{
	Use:   "pack [dir]",
	Short: "Bundle Go package documentation into a Markdown file",
	Args:  cobra.MaximumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		target := ""
		if len(args) > 0 {
			target = args[0]
		}
		commands.RunPack(target)
	},
}

func init() {
	rootCmd.AddCommand(packCmd)
}
