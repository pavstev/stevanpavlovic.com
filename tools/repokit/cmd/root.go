package cmd

import (
	"os"

	"repokit/pkg/cliutils"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "repokit",
	Short: "Repokit: The Ultimate Repository Orchestrator",
	Long:  `A powerful, YAML-driven task runner for modern monorepos and hybrid projects.`,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().BoolVarP(&cliutils.Quiet, "quiet", "q", false, "suppress output")

	// Dynamically register Batch Commands
	config := cliutils.GetConfig()
	for id, batch := range config.Batches {
		batchID := id // capture for closure
		batchCfg := batch

		cmd := &cobra.Command{
			Use:   batchID,
			Short: batchCfg.Description,
			Run: func(cmd *cobra.Command, args []string) {
				cliutils.RunBatch(batchID, batchCfg)
			},
		}
		rootCmd.AddCommand(cmd)
	}

	// Add manual task runner
	rootCmd.AddCommand(&cobra.Command{
		Use:   "run <task-id>",
		Short: "Execute an atomic task by ID",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			cliutils.RunTask(args[0], nil, nil)
		},
	})
}
