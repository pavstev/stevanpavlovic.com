package cli

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"strings"
)

// RunClean executes the project clean process with safety checks.
// This is moved here to resolve the cmd -> pkg/clean -> pkg/cli import cycle.
func RunClean(force bool) {
	// Replaced missing "Lifecycle" with "Step"
	Step("Checking clean preconditions")

	if !force {
		statusOut, _ := exec.Command("git", "status", "--porcelain").Output()
		if strings.TrimSpace(string(statusOut)) != "" {
			Error("Git working tree is dirty — uncommitted changes detected.")
			Info("Please commit or stash changes, or use --force to bypass this check.")
			os.Exit(1)
		}

		listOut, _ := exec.Command("git", "clean", "-Xnd", "-e", ".env.local").Output()
		fileList := strings.TrimSpace(string(listOut))
		if fileList == "" {
			Success("Nothing to clean — workspace is already pristine.")
			return
		}

		Warning("The following ignored files will be PERMANENTLY deleted:")
		fmt.Println()
		for _, line := range strings.Split(fileList, "\n") {
			// Used the correct internal 'subtleStyle' variable
			fmt.Println("  " + subtleStyle.Render(line))
		}

		fmt.Printf("\n%s Proceed with project reset? [y/N]: ", Bold.Render("?"))
		scanner := bufio.NewScanner(os.Stdin)
		scanner.Scan()
		if ans := strings.ToLower(strings.TrimSpace(scanner.Text())); ans != "y" && ans != "yes" {
			Info("Cleanup aborted.")
			return
		}
	}

	RunTask("clean", nil, nil)
	Success("Project successfully reset.")
}
