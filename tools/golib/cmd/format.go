package cmd

import (
	"golib/pkg/cliutils"
	"golib/pkg/cmdutil"
)

func init() {
	cfg := &cmdutil.QueueConfig{
		TaskIDs: []string{
			"optimize_svg",
			"format",
			"format_py",
		},
		PreRun: func() {
			cliutils.Step("Starting formatters...")
		},
		PostRun: func(success bool) {
			cliutils.Success("All formatters completed successfully.")
		},
	}
	cmdutil.AddToRoot(cmdutil.NewQueueCommand("format", "Format all code (SVG, Prettier, Ruff)", cfg))
}
