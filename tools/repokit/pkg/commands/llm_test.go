package commands

import (
	"context"
	"testing"
)

func TestNewProvider(t *testing.T) {
	tests := []struct {
		name    string
		llmCfg  *LLMConfig
		wantErr bool
	}{
		{
			name: "Gemini with defaults",
			llmCfg: &LLMConfig{
				Provider: "gemini",
				Model:    "",
				APIKey:   "test-key",
			},
			wantErr: false,
		},
		{
			name: "Groq with defaults",
			llmCfg: &LLMConfig{
				Provider: "groq",
				Model:    "",
				APIKey:   "test-key",
			},
			wantErr: false,
		},
		{
			name: "Local provider",
			llmCfg: &LLMConfig{
				Provider: "local",
				Model:    "path/to/model",
				APIKey:   "",
			},
			wantErr: false,
		},
		{
			name: "Unsupported provider",
			llmCfg: &LLMConfig{
				Provider: "unknown",
				Model:    "",
				APIKey:   "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p, err := NewProvider(tt.llmCfg)
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
