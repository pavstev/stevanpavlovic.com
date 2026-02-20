package cmd

import (
	"os"
	"repokit/pkg/core"
	"repokit/pkg/runner"
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
	configData, err := core.GetConfig()
	if err != nil {
		core.Fatal("%v", err)
	}
	for id := range configData.Tasks {
		taskID := id
		taskCfg := configData.Tasks[id]

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
				runner.RunTask(taskID, nil, nil)
			},
		}
		rootCmd.AddCommand(cmd)
	}

	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	// Setup global flags (Using the clean standard 'cli' package alias)
	rootCmd.PersistentFlags().BoolVarP(&core.Quiet, "quiet", "q", false, "suppress output")
}
