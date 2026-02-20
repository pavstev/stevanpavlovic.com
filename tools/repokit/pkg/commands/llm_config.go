package commands

import (
	"repokit/pkg/core"

	"github.com/spf13/cobra"
)

// LLMConfig is now an alias or we just use core.LLMConfig
type LLMConfig = core.LLMConfig

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
