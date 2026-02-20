package cmd

import (
	"repokit/pkg/readme"

	"github.com/spf13/cobra"
)

var (
	readmeProvider string
	readmeModel    string
	readmeAPIKey   string
)

var generateReadmeCmd = &cobra.Command{
	Use:   "generate_readme",
	Short: "Analyzes the codebase and generates a structured README using a local/cloud LLM",
	Run: func(cmd *cobra.Command, args []string) {
		readme.Run(cmd.Context(), readmeProvider, readmeModel, readmeAPIKey)
	},
}

func init() {
	generateReadmeCmd.Flags().StringVar(&readmeProvider, "provider", "gemini", "LLM provider (gemini, groq, local)")
	generateReadmeCmd.Flags().StringVar(&readmeModel, "model", "", "Model name (defaults: gemini-1.5-flash, llama3-8b-8192)")
	generateReadmeCmd.Flags().StringVar(&readmeAPIKey, "api-key", "", "API Key (or set GEMINI_API_KEY / GROQ_API_KEY)")
	rootCmd.AddCommand(generateReadmeCmd)
}
