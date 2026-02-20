package cmd

import (
	"repokit/pkg/commands"
	"repokit/pkg/svg"

	"github.com/spf13/cobra"
)

var osLLMConfig *commands.LLMConfig

var optimizeSvgCmd = &cobra.Command{
	Use:   "optimize_svg <pattern>",
	Short: "Optimize SVG files using native minifier and LLM analysis",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		svg.SetLLMConfig(osLLMConfig)
		svg.Optimize(args[0])
	},
}

func init() {
	osLLMConfig = commands.AddLLMFlags(optimizeSvgCmd, "")
	rootCmd.AddCommand(optimizeSvgCmd)
}
