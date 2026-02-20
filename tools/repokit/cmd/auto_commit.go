package cmd

import (
	"repokit/pkg/commands"
	"repokit/pkg/core"

	"github.com/spf13/cobra"
)

var acLLMConfig *commands.LLMConfig

var autoCommitCmd = &cobra.Command{
	Use:   "auto_commit",
	Short: "Automatically commits and pushes changes with an LLM-generated commit message",
	Run: func(cmd *cobra.Command, args []string) {
		core.LoadClosestEnv()
		commands.RunAutocommit(cmd.Context(), acLLMConfig)
	},
}

func init() {
	acLLMConfig = commands.AddLLMFlags(autoCommitCmd, "") // Autocommit doesn't use the 'output' flag
	rootCmd.AddCommand(autoCommitCmd)
}
