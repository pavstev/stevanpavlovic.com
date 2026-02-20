package cmd

import (
	"repokit/pkg/cmdutil"
	"repokit/pkg/svg"

	"github.com/spf13/cobra"
)

func init() {
	// Register the 'optimize-svg' command with the root CLI
	cmd := cmdutil.NewSimpleCommand("optimize-svg", "Optimize SVG files", func(cmd *cobra.Command, args []string) {
		// No default pattern; use the provided argument
		pattern := args[0]

		// Call the optimized logic from pkg/svg
		// The internal run loop now handles Ctrl+C gracefully
		_ = svg.Optimize(pattern)
	})

	// Define usage and validate that exactly 1 argument (the pattern) is passed
	cmd.Use = "optimize-svg <pattern>"
	cmd.Args = cobra.ExactArgs(1)

	cmdutil.AddToRoot(cmd)
}
