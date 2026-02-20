package cmd

import (
	"os"
	cliutil "repokit/pkg/cli"
	cmdutil "repokit/pkg/cli"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "repokit",
	Short: "Repokit: The Ultimate Repository Orchestrator",
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	// 1. Setup global flags
	rootCmd.PersistentFlags().BoolVarP(&cliutil.Quiet, "quiet", "q", false, "suppress output")

	// 2. Register this command as the "Root" in the utility package
	cmdutil.SetRootCommand(rootCmd)

	// 3. Dynamically register commands from tasks.yaml
	// In the unified system, we expose tasks of type "batch" as top-level commands.
	config := cliutil.GetConfig()
	for id, task := range config.Tasks {
		if task.Type == "batch" {
			taskID := id
			taskCfg := task

			cmd := &cobra.Command{
				Use:   taskID,
				Short: taskCfg.Description,
				Run: func(cmd *cobra.Command, args []string) {
					cliutil.RunTask(taskID, nil, nil)
				},
			}
			rootCmd.AddCommand(cmd)
		}
	}

	// 4. Add the generic task runner for atomic "single" tasks
	rootCmd.AddCommand(&cobra.Command{
		Use:   "run <task-id>",
		Short: "Execute any task (single or batch) by ID",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			cliutil.RunTask(args[0], nil, nil)
		},
	})
}
