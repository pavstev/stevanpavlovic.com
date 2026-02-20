package cmd

import (
	"os"

	cliutil "repokit/pkg/cli"
	cmdutil "repokit/pkg/command"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "repokit",
	Short: "Repokit: The Ultimate Repository Orchestrator",
	Long:  `A powerful, YAML-driven task runner for modern monorepos and hybrid projects.`,
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

	// 2. Register this command as the "Root" in the utility package.
	// This flushes any commands (like optimize-svg) that registered themselves
	// before root.go was initialized.
	cmdutil.SetRootCommand(rootCmd)

	// 3. Dynamically register Batch Commands from tasks.yaml
	// This replaces the need for separate all.go, build.go, etc.
	config := cliutil.GetConfig()
	for id, batch := range config.Batches {
		batchID := id // capture for closure
		batchCfg := batch

		cmd := &cobra.Command{
			Use:   batchID,
			Short: batchCfg.Description,
			Run: func(cmd *cobra.Command, args []string) {
				cliutil.RunBatch(batchID, batchCfg)
			},
		}
		rootCmd.AddCommand(cmd)
	}

	// 4. Add the generic task runner
	rootCmd.AddCommand(&cobra.Command{
		Use:   "run <task-id>",
		Short: "Execute an atomic task by ID",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			cliutil.RunTask(args[0], nil, map[string]bool{})
		},
	})
}
