package clean

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"golib/pkg/cliutils"
)

// Run executes the project clean process.
func Run(force bool) {
	cliutils.Step("Checking clean preconditions...")

	if !force {
		// 1. Check git tree is clean (no uncommitted changes)
		statusOut, err := exec.Command("git", "status", "--porcelain").Output()
		if err != nil {
			cliutils.Fatal("Failed to run git status: " + err.Error())
		}
		if strings.TrimSpace(string(statusOut)) != "" {
			cliutils.Error("Git working tree is dirty — there are uncommitted changes.")
			cliutils.Info("Commit or stash your changes first, or use --force to skip this check.")
			cliutils.Info("Dirty files:\n" + strings.TrimSpace(string(statusOut)))
			os.Exit(1)
		}

		// 2. Show what would be deleted
		listOut, err := exec.Command("git", "clean", "-Xnd", "-e", ".env.local").Output()
		if err != nil {
			cliutils.Fatal("Failed to list files to clean: " + err.Error())
		}
		fileList := strings.TrimSpace(string(listOut))
		if fileList == "" {
			cliutils.Success("Nothing to clean — working tree already clean.")
			return
		}

		cliutils.Warning("The following files will be permanently deleted:")
		fmt.Println()
		for _, line := range strings.Split(fileList, "\n") {
			fmt.Println("  " + line)
		}
		fmt.Println()

		// 3. Prompt for confirmation
		fmt.Print("Proceed with deletion? [y/N]: ")
		scanner := bufio.NewScanner(os.Stdin)
		scanner.Scan()
		answer := strings.ToLower(strings.TrimSpace(scanner.Text()))
		if answer != "y" && answer != "yes" {
			cliutils.Info("Aborted.")
			return
		}
	}

	cliutils.Step("Cleaning project...")
	cliutils.RunStepByID("clean_git", nil)

	cliutils.Step("Reinstalling dependencies...")
	cliutils.RunStepByID("clean_install", nil)

	cliutils.Success("Project cleaned and dependencies reinstalled.")
}
