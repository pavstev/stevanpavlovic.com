package cmd

import (
	"repokit/pkg/cliutils"
	"repokit/pkg/cmdutil"
)

func init() {
	cfg := &cmdutil.QueueConfig{
		TaskIDs: []string{
			"optimize_svg",
			"prettier_write",
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
