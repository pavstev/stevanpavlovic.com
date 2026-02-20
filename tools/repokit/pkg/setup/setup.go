package setup

import (
	"golib/pkg/cliutils"
	"golib/pkg/svg"
)

// Run executes the project setup process.
func Run(continueOnError bool) {
	cliutils.Step("Starting Project Hybrid Setup...")

	cliutils.Step("Checking Node package manager (pnpm)...")
	if !cliutils.EnsureCommandExists("pnpm") {
		cliutils.Info("pnpm not found. Installing pnpm via npm...")
		cliutils.RunStepByID("setup_install_pnpm", nil)
	} else {
		cliutils.Success("pnpm is already installed.")
	}

	cliutils.Step("Optimizing Project Assets...")
	// Break the recursive loop: Call the Go function directly
	// instead of spawning the 'gocli optimize-svg' sub-process.
	if err := svg.Optimize("src/assets/**/*.svg"); err != nil {
		cliutils.Warning("SVG optimization encountered errors, but continuing setup...")
	}

	cliutils.Step("Finalizing setup...")
	cliutils.RunQueue([]string{
		"setup_wrangler_types",
	}, 1, continueOnError)

	cliutils.Success("Hybrid environment setup completed successfully!")
	cliutils.Info("Node:   Run 'pnpm dev' to start.")
}
