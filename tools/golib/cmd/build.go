package cmd

import (
	"golib/pkg/cliutils"
	"golib/pkg/cmdutil"
)

func init() {
	cfg := &cmdutil.QueueConfig{
		TaskIDs: []string{
			"build_astro",
			"build_py",
			"build_go",
		},
		PreRun: func() {
			cliutils.Step("Starting build process...")
		},
		PostRun: func(success bool) {
			cliutils.Success("Build complete.")
		},
	}
	cmdutil.AddToRoot(cmdutil.NewQueueCommand("build", "Build standard project components", cfg))
}
