package cmd

import (
	"repokit/pkg/autocommit"

	"github.com/spf13/cobra"
)

var (
	acProvider string
	acModel    string
	acAPIKey   string
)

var autoCommitCmd = &cobra.Command{
	Use:   "auto_commit",
	Short: "Automatically commits and pushes changes with an LLM-generated commit message",
	Run: func(cmd *cobra.Command, args []string) {
		autocommit.Run(cmd.Context(), acProvider, acModel, acAPIKey)
	},
}

func init() {
	autoCommitCmd.Flags().StringVar(&acProvider, "provider", "gemini", "LLM provider (gemini, groq, local)")
	autoCommitCmd.Flags().StringVar(&acModel, "model", "", "Model name (defaults: gemini-1.5-flash, llama3-8b-8192)")
	autoCommitCmd.Flags().StringVar(&acAPIKey, "api-key", "", "API Key (or set GEMINI_API_KEY / GROQ_API_KEY)")
	rootCmd.AddCommand(autoCommitCmd)
}
