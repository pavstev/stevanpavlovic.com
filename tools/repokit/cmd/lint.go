package cmd

import (
	"repokit/pkg/cliutils"
	"repokit/pkg/cmdutil"
)

func init() {
	cfg := &cmdutil.QueueConfig{
		TaskIDs: []string{
			"lint_eslint",
						"lint_go",
		},
		PreRun: func() {
			cliutils.Step("Running linters...")
		},
		PostRun: func(success bool) {
			cliutils.Success("Linting complete.")
		},
	}
	cmdutil.AddToRoot(cmdutil.NewQueueCommand("lint", "Run linters", cfg))
}
