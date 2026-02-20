package core

import "context"

// LLMConfig holds common LLM configuration parameters.
type LLMConfig struct {
	Provider string
	Model    string
	APIKey   string
	Output   string // Specific to README generation, but kept here for convenience.
}

// Provider defines the interface for LLM operations.
type Provider interface {
	Generate(ctx context.Context, prompt string) (string, error)
}
