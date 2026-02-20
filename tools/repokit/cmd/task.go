package cmd

import (
	"fmt"
	"os"

	"repokit/pkg/cliutils"
	"repokit/pkg/cmdutil"

	"github.com/spf13/cobra"
)

func init() {
	cmd := &cobra.Command{
		Use:   "task <task-id>",
		Short: "Run a single task by ID from tasks.yaml",
		Long: `Run a single task by its ID from tasks.yaml.

Example:
  repokit task lint_go
  repokit task build_astro
  repokit task check_go

To list all available task IDs, run:
  repokit task --list`,
		Args: cobra.MaximumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			list, _ := cmd.Flags().GetBool("list")
			if list {
				listTasks()
				return
			}

			if len(args) == 0 {
				fmt.Println("Error: task ID is required")
				fmt.Println("Use --list to see available tasks")
				os.Exit(1)
			}

			taskID := args[0]
			cliutils.RunStepByID(taskID, nil)
		},
	}
	cmd.Flags().Bool("list", false, "list all available task IDs")
	cmdutil.AddToRoot(cmd)
}

func listTasks() {
	// Get all tasks from the YAML
	// We need to access the internal data or parse the file again
	// For now, let's use a simple approach - show known task IDs

	knownTasks := []string{
		"lint_eslint",
		"lint_go",
				"check_astro",
		"check_go",
				"build_astro",
		"build_go",
				"test_vitest",
		"test_go",
				"optimize_svg",
		"format",
		"setup_install_pnpm",
		"setup_wrangler_types",
		"ls_files",
		"resume_export",
		"chmod_scripts",
		"clean_git",
		"clean_install",
	}

	fmt.Println("Available tasks:")
	for _, task := range knownTasks {
		fmt.Printf("  %s\n", task)
	}
}
