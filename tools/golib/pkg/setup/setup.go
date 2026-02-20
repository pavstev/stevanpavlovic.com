package setup

import (
	"golib/pkg/cliutils"
)

// Run executes the project setup process.
func Run(continueOnError bool) {
	cliutils.Step("Starting Project Hybrid Setup...")

	cliutils.Step("Checking Python environment manager (uv)...")
	if !cliutils.EnsureCommandExists("uv") {
		cliutils.Info("uv not found. Installing uv...")
		cliutils.RunStepByID("setup_install_uv", nil)
	} else {
		cliutils.Success("uv is already installed.")
	}

	cliutils.Step("Checking Node package manager (pnpm)...")
	if !cliutils.EnsureCommandExists("pnpm") {
		cliutils.Info("pnpm not found. Installing pnpm via npm...")
		cliutils.RunStepByID("setup_install_pnpm", nil)
	} else {
		cliutils.Success("pnpm is already installed.")
	}

	cliutils.Step("Syncing dependencies (Node & Python)...")
	cliutils.RunQueue([]string{
		"setup_uv_sync",
	}, 2, continueOnError)

	cliutils.Step("Finalizing setup...")
	cliutils.RunQueue([]string{
		"setup_wrangler_types",
	}, 1, continueOnError)

	cliutils.Success("Hybrid environment setup completed successfully!")
	cliutils.Info("Node:   Run 'pnpm dev' to start.")
}
