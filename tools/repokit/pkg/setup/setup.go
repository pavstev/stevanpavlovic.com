package setup

import (
	"repokit/pkg/cli"
	"repokit/pkg/svg"
)

// Run executes the project setup process.
func Run(continueOnError bool) {
	cli.Step("Starting Project Hybrid Setup...")

	cli.Step("Checking Node package manager (pnpm)...")
	if !cli.EnsureCommandExists("pnpm") {
		cli.Info("pnpm not found. Installing pnpm via npm...")
		cli.RunTask("setup_install_pnpm", nil, map[string]bool{})
	} else {
		cli.Success("pnpm is already installed.")
	}

	cli.Step("Optimizing Project Assets...")
	// Break the recursive loop: Call the Go function directly
	// instead of spawning the 'repokit optimize-svg' sub-process.
	if err := svg.Optimize("src/assets/**/*.svg"); err != nil {
		cli.Warning("SVG optimization encountered errors, but continuing setup...")
	}

	cli.Step("Finalizing setup...")
	cli.RunQueue([]string{
		"setup_wrangler_types",
	}, 1, continueOnError)

	cli.Success("Hybrid environment setup completed successfully!")
	cli.Info("Node:   Run 'pnpm dev' to start.")
}
