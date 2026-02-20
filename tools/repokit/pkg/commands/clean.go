package commands

import (
	"fmt"
	"os"
	"os/exec"
	"repokit/pkg/core"
	"repokit/pkg/runner"
	"strings"
)

// RunClean executes the project clean logic.
// If force is true, it skips the git status check and confirmation prompt.
func RunClean(force bool) {
	core.Step("Checking clean preconditions...")

	if !force {
		// 1. Check git tree is clean (no uncommitted changes)
		statusOut, err := exec.Command("git", "status", "--porcelain").Output()
		if err != nil {
			core.Fatal("Failed to run git status: %v", err)
		}
		if len(strings.TrimSpace(string(statusOut))) > 0 {
			core.Error("Git working tree is dirty — there are uncommitted changes.")
			core.Info("Commit or stash your changes first, or use --force to skip this check.")
			core.Info("Dirty files:\n%s", strings.TrimSpace(string(statusOut)))
			os.Exit(1)
		}

		// 2. Show what would be deleted
		listOut, err := exec.Command("git", "clean", "-Xnd", "-e", ".env.local").Output()
		if err != nil {
			core.Fatal("Failed to list files to clean: %v", err)
		}
		fileList := strings.TrimSpace(string(listOut))
		if fileList == "" {
			core.Success("Nothing to clean — working tree already clean.")
			return
		}

		core.Warning("The following files will be permanently deleted:")
		fmt.Println()
		for _, line := range strings.Split(fileList, "\n") {
			fmt.Println("  " + line)
		}
		fmt.Println()

		// 3. We skip manual Stdin prompts here because the TUI or flag already confirmed the intent.
	}

	core.Step("Cleaning project...")
	runner.RunInteractive("Git Clean", "git clean -Xfd -e .env.local", ".")

	core.Step("Reinstalling dependencies...")
	runner.RunInteractive("PNPM Install", "pnpm install", ".")

	core.Success("Project cleaned and dependencies reinstalled.")
}
