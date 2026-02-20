package clean

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"repokit/pkg/cli"
)

// Run executes the project clean process.
func Run(force bool) {
	cli.Step("Checking clean preconditions...")

	if !force {
		// 1. Check git tree is clean
		statusOut, err := exec.Command("git", "status", "--porcelain").Output()
		if err != nil {
			cli.Fatal("Failed to run git status: " + err.Error())
		}
		if strings.TrimSpace(string(statusOut)) != "" {
			cli.Error("Git working tree is dirty — there are uncommitted changes.")
			cli.Info("Commit or stash your changes first, or use --force to skip this check.")
			os.Exit(1)
		}

		// 2. Show what would be deleted
		listOut, err := exec.Command("git", "clean", "-Xnd", "-e", ".env.local").Output()
		if err != nil {
			cli.Fatal("Failed to list files to clean: " + err.Error())
		}
		fileList := strings.TrimSpace(string(listOut))
		if fileList == "" {
			cli.Success("Nothing to clean — working tree already clean.")
			return
		}

		cli.Warning("The following files will be permanently deleted:")
		fmt.Println()
		for _, line := range strings.Split(fileList, "\n") {
			fmt.Println("  " + line)
		}
		fmt.Println()

		fmt.Print("Proceed with deletion? [y/N]: ")
		scanner := bufio.NewScanner(os.Stdin)
		scanner.Scan()
		answer := strings.ToLower(strings.TrimSpace(scanner.Text()))
		if answer != "y" && answer != "yes" {
			cli.Info("Aborted.")
			return
		}
	}

	cli.Step("Cleaning project...")
	cli.RunTask("clean_git", nil, nil)

	cli.Step("Reinstalling dependencies...")
	cli.RunTask("clean_install", nil, nil)

	cli.Success("Project cleaned successfully.")
}
