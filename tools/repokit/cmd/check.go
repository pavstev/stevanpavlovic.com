package cmd

import (
	"repokit/pkg/cliutils"
	"repokit/pkg/cmdutil"
)

func init() {
	cfg := &cmdutil.QueueConfig{
		TaskIDs: []string{
			"check_astro",
			"check_go",
		},
		PreRun: func() {
			cliutils.Step("Running type checkers...")
		},
		PostRun: func(success bool) {
			cliutils.Success("Type checks passed.")
		},
	}
	cmdutil.AddToRoot(cmdutil.NewQueueCommand("check", "Run type checkers", cfg))
}
