package cmd

import (
	"golib/pkg/cliutils"
	"golib/pkg/cmdutil"
)

var allContinueOnError bool

func init() {
	phaseCfg := &cmdutil.PhaseConfig{
		Workers:         3,
		ContinueOnError: allContinueOnError,
		PrePhase: func(phase int) {
			switch phase {
			case 0:
				cliutils.Info("Phase 1: Validation Queue")
			case 1:
				cliutils.Info("Phase 2: Build Queue")
			case 2:
				cliutils.Step("Phase 3: Post-processing")
			}
		},
	}

	cmd := cmdutil.NewPhaseCommand("all", "Run all validation and build pipeline", phaseCfg,
		[]string{ // Phase 1: Validation
			"lint_eslint",
			"lint_go",
			"lint_py",
			"check_astro",
			"check_go",
			"check_py",
			"test_vitest",
			"test_go",
			"test_py",
		},
		[]string{ // Phase 2: Build
			"build_astro",
			"build_go",
			"build_py",
		},
		[]string{ // Phase 3: Post-processing
			"chmod_scripts",
		},
	)

	cmd.Flags().BoolVar(&allContinueOnError, "continue", false, "continue running tasks even if some fail")
	// keep --full as a hidden backward-compat alias
	cmd.Flags().BoolVar(&allContinueOnError, "full", false, "")
	_ = cmd.Flags().MarkHidden("full")

	cmdutil.AddToRoot(cmd)
}
