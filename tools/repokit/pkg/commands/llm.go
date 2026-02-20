package commands

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"github.com/joho/godotenv"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"
)

// Provider defines the interface for LLM operations.
type Provider interface {
	Generate(ctx context.Context, prompt string) (string, error)
}

// ─── Gemini Provider (Cloud) ────────────────────────────────────────────────

type GeminiProvider struct {
	APIKey string
	Model  string
}

var modelsBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models/"

func (p *GeminiProvider) Generate(ctx context.Context, prompt string) (string, error) {
	url := fmt.Sprintf("%s%s:generateContent?key=%s", modelsBaseUrl, p.Model, p.APIKey)

	reqBody := map[string]any{
		"contents": []any{
			map[string]any{
				"parts": []any{
					map[string]any{"text": prompt},
				},
			},
		},
	}

	jsonData, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("gemini error (%d): %s", resp.StatusCode, string(b))
	}

	var res struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}

	if len(res.Candidates) == 0 || len(res.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("gemini returned empty response")
	}

	return res.Candidates[0].Content.Parts[0].Text, nil
}

// ─── Groq Provider (Cloud / OpenAI Compatible) ─────────────────────────────

type GroqProvider struct {
	APIKey string
	Model  string
}

func (p *GroqProvider) Generate(ctx context.Context, prompt string) (string, error) {
	url := "https://api.groq.com/openai/v1/chat/completions"

	reqBody := map[string]any{
		"model": p.Model,
		"messages": []any{
			map[string]any{"role": "user", "content": prompt},
		},
		"temperature": 0.7,
	}

	jsonData, _ := json.Marshal(reqBody)
	req, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.APIKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		b, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("groq error (%d): %s", resp.StatusCode, string(b))
	}

	var res struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", err
	}

	if len(res.Choices) == 0 {
		return "", fmt.Errorf("groq returned empty response")
	}

	return res.Choices[0].Message.Content, nil
}

// ─── Local Provider (One-Shot Execute) ──────────────────────────────────────

type LocalProvider struct {
	ModelPath string
}

func (p *LocalProvider) Generate(ctx context.Context, prompt string) (string, error) {
	// Uses llama-cli (from llama.cpp) for a one-shot inference without a daemon.
	args := []string{
		"-m", p.ModelPath,
		"-p", prompt,
		"-n", "512", // Limit output tokens
		"--quiet",
	}

	cmd := exec.CommandContext(ctx, "llama-cli", args...)
	var out bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return "", fmt.Errorf("local inference failed: %v", err)
	}

	return strings.TrimSpace(out.String()), nil
}

// ─── Factory ────────────────────────────────────────────────────────────────

func NewProvider(llmCfg *LLMConfig) (Provider, error) {
	switch strings.ToLower(llmCfg.Provider) {
	case "gemini":
		apiKey := llmCfg.APIKey
		if apiKey == "" {
			// Load .env and then .env.local, which will override .env
			godotenv.Load() // loads .env by default
			godotenv.Load(".env.local")
			apiKey = os.Getenv("GEMINI_API_KEY")
		}
		model := llmCfg.Model
		if model == "" {
			model = "gemini-2.5-flash"
		}
		return &GeminiProvider{APIKey: apiKey, Model: model}, nil
	case "groq":
		apiKey := llmCfg.APIKey
		if apiKey == "" {
			apiKey = os.Getenv("GROQ_API_KEY")
		}
		model := llmCfg.Model
		if model == "" {
			model = "llama3-8b-8192"
		}
		return &GroqProvider{APIKey: apiKey, Model: model}, nil
	case "local":
		return &LocalProvider{ModelPath: llmCfg.Model}, nil
	default:
		return nil, fmt.Errorf("unsupported llm provider: %s", llmCfg.Provider)
	}
}
