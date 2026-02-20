package cmd

import (
	"repokit/pkg/cli"
	"repokit/pkg/svg"

	"github.com/spf13/cobra"
)

var cmd = &cobra.Command{
	Use:   "optimize-svg <pattern>",
	Short: "Optimize SVG files using native minifier",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		_ = svg.Optimize(args[0])
	},
}

func init() {
	cli.AddToRoot(cmd)
}
