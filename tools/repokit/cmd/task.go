package cmd

import (
	"fmt"
	"os"
	"sort"

	"repokit/pkg/cli"
	cmdutil "repokit/pkg/command"

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
			// Using the public RunTask API with 2 arguments
			cli.RunTask(taskID, nil, map[string]bool{})
		},
	}
	cmd.Flags().Bool("list", false, "list all available task IDs")
	cmdutil.AddToRoot(cmd)
}

func listTasks() {
	// Dynamically pull task IDs from the config
	config := cli.GetConfig()

	ids := make([]string, 0, len(config.Tasks))
	for id := range config.Tasks {
		ids = append(ids, id)
	}
	sort.Strings(ids)

	fmt.Println("Available tasks:")
	for _, id := range ids {
		task := config.Tasks[id]
		desc := task.Description
		if desc == "" {
			desc = task.Name
		}
		fmt.Printf("  %-20s # %s\n", id, desc)
	}
}
