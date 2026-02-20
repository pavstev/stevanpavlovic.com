package commands

import (
	"context"
	"testing"
)

func TestNewProvider(t *testing.T) {
	tests := []struct {
		name         string
		providerType string
		model        string
		apiKey       string
		wantErr      bool
	}{
		{
			name:         "Gemini with defaults",
			providerType: "gemini",
			model:        "",
			apiKey:       "test-key",
			wantErr:      false,
		},
		{
			name:         "Groq with defaults",
			providerType: "groq",
			model:        "",
			apiKey:       "test-key",
			wantErr:      false,
		},
		{
			name:         "Local provider",
			providerType: "local",
			model:        "path/to/model",
			apiKey:       "",
			wantErr:      false,
		},
		{
			name:         "Unsupported provider",
			providerType: "unknown",
			model:        "",
			apiKey:       "",
			wantErr:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p, err := NewProvider(tt.providerType, tt.model, tt.apiKey)
			if (err != nil) != tt.wantErr {
				t.Errorf("NewProvider() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !tt.wantErr && p == nil {
				t.Error("NewProvider() returned nil provider without error")
			}
		})
	}
}

func TestLocalProvider_Generate(t *testing.T) {
	// This test normally requires llama-cli. We can't easily run it.
	// But we can test that it attempts to run the command.
	p := &LocalProvider{ModelPath: "test-model"}
	ctx := context.Background()
	_, err := p.Generate(ctx, "test prompt")
	if err == nil {
		t.Error("Expected error because llama-cli is not in PATH, but got nil")
	}
}
