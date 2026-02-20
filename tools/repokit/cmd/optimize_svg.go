package cmd

import (
	cmdutils "repokit/pkg/command"
	"repokit/pkg/svg"

	"github.com/spf13/cobra"
)

func init() {
	// Register the 'optimize-svg' command directly with the root CLI.
	// We use a standard cobra.Command to ensure stability and reduce
	// dependency on external helper functions for this specific native task.
	cmd := &cobra.Command{
		Use:   "optimize-svg <pattern>",
		Short: "Optimize SVG files using native minifier",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			// Pattern example: src/assets/**/*.svg
			pattern := args[0]

			// Call the optimized logic from pkg/svg which handles the UI loop and interrupts.
			_ = svg.Optimize(pattern)
		},
	}

	cmdutils.AddToRoot(cmd)
}
