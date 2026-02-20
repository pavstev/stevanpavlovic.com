package cmd

import (
	"repokit/pkg/commands" // Import commands package for LLMConfig
	"repokit/pkg/svg"

	"github.com/spf13/cobra"
)

var osLLMConfig *commands.LLMConfig // Local LLMConfig for optimize-svg command

var optimizeSvgCmd = &cobra.Command{
	Use:   "optimize-svg <pattern>",
	Short: "Optimize SVG files using native minifier and LLM analysis",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		svg.SetLLMConfig(osLLMConfig) // Set the global LLM config in the svg package
		svg.Optimize(args[0])
	},
}

func init() {
	osLLMConfig = commands.AddLLMFlags(optimizeSvgCmd, "") // No output flag for optimize-svg
	rootCmd.AddCommand(optimizeSvgCmd)
}
