package autocommit

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"repokit/pkg/llm"
	"repokit/pkg/log"
)

// Run executes the auto commit logic: gathers changes, generates a commit message using LLM, and pushes changes.
func Run(ctx context.Context, providerName, model, apiKey string) {
	log.Info("Checking for changes...")

	// Check if there are any changes (staged or unstaged)
	statusCmd := exec.Command("git", "status", "--porcelain")
	statusOut, err := statusCmd.Output()
	if err != nil {
		log.Fatal("Failed to check git status: %v", err)
	}

	if len(strings.TrimSpace(string(statusOut))) == 0 {
		log.Success("No changes to commit. Exiting.")
		return
	}

	// Add all changes
	log.Info("Adding changes to index...")
	addCmd := exec.Command("git", "add", "-A")
	if err := addCmd.Run(); err != nil {
		log.Fatal("Failed to git add: %v", err)
	}

	// Get the diff of staged changes
	diffCmd := exec.Command("git", "diff", "--staged")
	diffOut, err := diffCmd.Output()
	if err != nil {
		log.Fatal("Failed to get git diff: %v", err)
	}

	diffStr := string(diffOut)
	if len(diffStr) == 0 {
		log.Success("No changes to commit. Exiting.")
		return
	}

	// Truncate diff if it's too large to fit in context window (rough approximation)
	maxDiffLength := 6000
	if len(diffStr) > maxDiffLength {
		diffStr = diffStr[:maxDiffLength] + "\n... (diff truncated due to size)"
	}

	log.Info("Generating commit message using %s...", providerName)

	p, err := llm.NewProvider(providerName, model, apiKey)
	if err != nil {
		log.Fatal("Failed to initialize LLM provider: %v", err)
	}

	prompt := fmt.Sprintf(`You are an expert software engineer. Write a concise and descriptive Git commit message based on the following `+"`git diff`"+`.
ONLY output the commit message itself, nothing else. Do not wrap it in quotes or markdown blocks. Keep it under 70 characters for the first line.

Git Diff:
%s`, diffStr)

	commitMsg, err := p.Generate(ctx, prompt)
	if err != nil {
		log.Fatal("LLM generation failed: %v", err)
	}

	commitMsg = strings.TrimSpace(commitMsg)
	// Remove quotes if the LLM added them despite instructions
	commitMsg = strings.TrimPrefix(commitMsg, "\"")
	commitMsg = strings.TrimPrefix(commitMsg, "'")
	commitMsg = strings.TrimSuffix(commitMsg, "\"")
	commitMsg = strings.TrimSuffix(commitMsg, "'")

	if commitMsg == "" {
		log.Fatal("Generated commit message was empty.")
	}

	log.Info("Commit message: %s", commitMsg)

	// Commit
	log.Info("Committing changes...")
	commitCmd := exec.Command("git", "commit", "-m", commitMsg)
	commitCmd.Stdout = os.Stdout
	commitCmd.Stderr = os.Stderr
	if err := commitCmd.Run(); err != nil {
		log.Fatal("Failed to commit changes: %v", err)
	}

	// Push
	log.Info("Pushing changes...")
	pushCmd := exec.Command("git", "push")
	pushCmd.Stdout = os.Stdout
	pushCmd.Stderr = os.Stderr
	if err := pushCmd.Run(); err != nil {
		log.Fatal("Failed to push changes: %v", err)
	}

	log.Success("Successfully committed and pushed changes!")
}
