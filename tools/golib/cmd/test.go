package cmd

import (
	"golib/pkg/cliutils"
	"golib/pkg/cmdutil"
)

func init() {
	cfg := &cmdutil.QueueConfig{
		TaskIDs: []string{
			"test_vitest",
			"test_py",
			"test_go",
		},
		PreRun: func() {
			cliutils.Step("Running tests...")
		},
		PostRun: func(success bool) {
			cliutils.Success("All tests passed.")
		},
	}
	cmdutil.AddToRoot(cmdutil.NewQueueCommand("test", "Run all tests", cfg))
}
