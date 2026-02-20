package commands

import (
	"github.com/spf13/cobra"
)

// LLMConfig holds common LLM configuration parameters.
type LLMConfig struct {
	Provider string
	Model    string
	APIKey   string
	Output   string // Specific to README generation, but kept here for convenience.
}

// AddLLMFlags adds common LLM-related flags to a Cobra command.
// It returns a pointer to an LLMConfig struct which will be populated when flags are parsed.
func AddLLMFlags(cmd *cobra.Command, defaultOutput string) *LLMConfig {
	cfg := &LLMConfig{}

	cmd.Flags().StringVar(&cfg.Provider, "provider", "gemini", "LLM provider (gemini, groq, local)")
	cmd.Flags().StringVar(&cfg.Model, "model", "", "Model name (defaults: gemini-2.5-flash, llama3-8b-8192)")
	cmd.Flags().StringVar(&cfg.APIKey, "api-key", "", "API Key (or set GEMINI_API_KEY / GROQ_API_KEY)")
	cmd.Flags().StringVar(&cfg.Output, "output", defaultOutput, "Output file path (e.g., README.md for generate_readme)")

	return cfg
}
