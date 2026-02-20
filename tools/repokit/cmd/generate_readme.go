package cmd

import (
	"repokit/pkg/commands"
	"repokit/pkg/core"

	"github.com/spf13/cobra"
)

var llmConfig *commands.LLMConfig

var generateReadmeCmd = &cobra.Command{
	Use:   "generate_readme",
	Short: "Analyzes the codebase and generates a structured README using a local/cloud LLM",
	Run: func(cmd *cobra.Command, args []string) {
		core.LoadClosestEnv()
		commands.RunGenerateReadme(cmd.Context(), llmConfig)
	},
}

func init() {
	llmConfig = commands.AddLLMFlags(generateReadmeCmd, "README.md")
	rootCmd.AddCommand(generateReadmeCmd)
}
