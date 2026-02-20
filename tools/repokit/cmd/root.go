package cmd

import (
	"os"

	"repokit/pkg/cli"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "repokit",
	Short: "Repokit: The Ultimate Repository Orchestrator",
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() {
	// Dynamically register commands from tasks.yaml right before executing.
	// This ensures all init() functions have finished and hardcoded commands (like 'setup')
	// are already registered, preventing duplicates and initialization race conditions.
	config := cli.GetConfig()
	for id, task := range config.Tasks {
		taskID := id
		taskCfg := task

		// Skip if a hardcoded command with this name already exists
		var exists bool
			for _, existingCmd := range rootCmd.Commands() {
				if existingCmd.Name() == taskID {
					exists = true
					break
				}
			}
			if exists {
				continue
			}

			// Fallback to Name if Description is missing in tasks.yaml
		shortDesc := taskCfg.Description
		if shortDesc == "" {
			shortDesc = taskCfg.Name
		}

		cmd := &cobra.Command{
			Use:   taskID,
			Short: shortDesc,
			Run: func(cmd *cobra.Command, args []string) {
				cli.RunTask(taskID, nil, nil)
			},
		}
		rootCmd.AddCommand(cmd)
	}

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	// 1. Setup global flags (Using the clean standard 'cli' package alias)
	rootCmd.PersistentFlags().BoolVarP(&cli.Quiet, "quiet", "q", false, "suppress output")

	// 2. Register this command as the "Root" in the utility package
	cli.SetRootCommand(rootCmd)

	// 3. Add the generic task runner
	rootCmd.AddCommand(&cobra.Command{
		Use:     "task <task-id>",
		Aliases: []string{"run"},
		Short:   "Execute any task by ID",
		Args:    cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			cli.RunTask(args[0], nil, nil)
		},
	})
}
