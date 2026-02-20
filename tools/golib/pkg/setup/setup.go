package setup

import (
	"os"
	"path/filepath"

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
		"setup_install",
		"setup_uv_sync",
	}, 2, continueOnError)

	cliutils.Step("Finalizing setup...")
	cliutils.RunQueue([]string{
		"setup_wrangler_types",
	}, 1, continueOnError)

	// Ensure Python package __init__.py files exist
	cliutils.Step("Ensuring Python package structure (__init__.py)...")
	ensurePythonPackageStructure()

	cliutils.Success("Hybrid environment setup completed successfully!")
	cliutils.Info("Node:   Run 'pnpm dev' to start.")
}

// ensurePythonPackageStructure ensures __init__.py files exist in Python packages.
func ensurePythonPackageStructure() {
	targetDir := "tools/pylib"
	_ = filepath.Walk(targetDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() && path != targetDir && path != "." {
			initFile := filepath.Join(path, "__init__.py")
			if _, err := os.Stat(initFile); os.IsNotExist(err) {
				_ = os.WriteFile(initFile, []byte(""), 0644)
				cliutils.Info("Created " + initFile)
			}
		}
		return nil
	})
	cliutils.Success("Python package structure verified.")
}
