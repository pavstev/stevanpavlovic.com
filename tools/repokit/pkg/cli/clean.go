package cli

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"repokit/pkg/cli"
)

// Run executes the project clean process.
// It performs safety checks before triggering the destructive clean tasks.
func Run(force bool) {
	cli.Lifecycle("Checking clean preconditions")

	if !force {
		// 1. Verify that the git tree is clean to prevent accidental loss of uncommitted work.
		statusOut, err := exec.Command("git", "status", "--porcelain").Output()
		if err != nil {
			cli.Fatal("Failed to run git status: " + err.Error())
		}

		if strings.TrimSpace(string(statusOut)) != "" {
			cli.Error("Git working tree is dirty — uncommitted changes detected.")
			cli.Info("Please commit or stash changes, or use --force to bypass this safety check.")
			os.Exit(1)
		}

		// 2. Dry-run to show exactly what will be removed (excluding .env.local).
		listOut, err := exec.Command("git", "clean", "-Xnd", "-e", ".env.local").Output()
		if err != nil {
			cli.Fatal("Failed to list files to clean: " + err.Error())
		}

		fileList := strings.TrimSpace(string(listOut))
		if fileList == "" {
			cli.Success("Nothing to clean — workspace is already pristine.")
			return
		}

		// Display the findings in a warning box for maximum visibility.
		cli.Warning("The following ignored files/directories will be PERMANENTLY deleted:")
		fmt.Println()
		for _, line := range strings.Split(fileList, "\n") {
			fmt.Println("  " + cli.Subtle.Render(line))
		}
		fmt.Println()

		// Interactive confirmation.
		fmt.Print(cli.Bold.Render("? ") + "Proceed with project reset? [y/N]: ")
		scanner := bufio.NewScanner(os.Stdin)
		scanner.Scan()
		answer := strings.ToLower(strings.TrimSpace(scanner.Text()))
		if answer != "y" && answer != "yes" {
			cli.Info("Cleanup aborted by user.")
			return
		}
	}

	// 3. Trigger the unified tasks.
	// Note: We use the ID directly from tasks.yaml to stay within the unified system.
	cli.RunTask("clean", nil, nil)

	cli.Success("Project successfully reset and dependencies reinstalled.")
}
