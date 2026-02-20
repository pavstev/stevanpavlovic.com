package commands

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/go-git/go-git/v5"
	"github.com/sergi/go-diff/diffmatchpatch"

	"repokit/pkg/core"
)

// RunAutocommit executes the auto commit logic: gathers changes, generates a commit message using LLM, and pushes changes.
func RunAutocommit(ctx context.Context, llmCfg *LLMConfig) {
	core.Info("Checking for changes...")

	r, err := git.PlainOpen(".")
	if err != nil {
		core.Fatal("Failed to open git repository: %v", err)
	}

	w, err := r.Worktree()
	if err != nil {
		core.Fatal("Failed to get worktree: %v", err)
	}

	status, err := w.Status()
	if err != nil {
		core.Fatal("Failed to get git status: %v", err)
	}

	if status.IsClean() {
		core.Success("No changes to commit. Exiting.")
		return
	}

	// Gather diffs before committing
	diffStr, err := getDiff(r, status)
	if err != nil {
		core.Fatal("Failed to get git diff: %v", err)
	}
	if len(strings.TrimSpace(diffStr)) == 0 {
		core.Success("No changes to commit. Exiting.")
		return
	}

	// Add all changes
	core.Info("Adding changes to index...")
	err = w.AddWithOptions(&git.AddOptions{All: true})
	if err != nil {
		core.Fatal("Failed to git add: %v", err)
	}

	// Truncate diff if it's too large to fit in context window (rough approximation)
	maxDiffLength := 6000
	if len(diffStr) > maxDiffLength {
		diffStr = diffStr[:maxDiffLength] + "\n... (diff truncated due to size)"
	}

	core.Info("Generating commit message using %s...", llmCfg.Provider)

	p, err := NewProvider(llmCfg)
	if err != nil {
		core.Fatal("Failed to initialize LLM provider: %v", err)
	}

	prompt := fmt.Sprintf(`You are an expert software engineer. Write a concise and descriptive Git commit message based on the following `+"`git diff`"+`.
ONLY output the commit message itself, nothing else. Do not wrap it in quotes or markdown blocks. Keep it under 70 characters for the first line.

Git Diff:
%s`, diffStr)

	commitMsg, err := p.Generate(ctx, prompt)
	if err != nil {
		core.Fatal("LLM generation failed: %v", err)
	}

	commitMsg = strings.TrimSpace(commitMsg)
	// Remove quotes if the LLM added them despite instructions
	commitMsg = strings.TrimPrefix(commitMsg, "\"")
	commitMsg = strings.TrimPrefix(commitMsg, "'")
	commitMsg = strings.TrimSuffix(commitMsg, "\"")
	commitMsg = strings.TrimSuffix(commitMsg, "'")

	if commitMsg == "" {
		core.Fatal("Generated commit message was empty.")
	}

	core.Info("Commit message: %s", commitMsg)

	// Commit
	core.Info("Committing changes...")
	_, err = w.Commit(commitMsg, &git.CommitOptions{})
	if err != nil {
		core.Fatal("Failed to commit changes: %v", err)
	}

	// Push
	core.Info("Pushing changes...")
	err = r.Push(&git.PushOptions{})
	if err != nil {
		core.Fatal("Failed to push changes: %v", err)
	}

	core.Success("Successfully committed and pushed changes!")
}

func getDiff(r *git.Repository, status git.Status) (string, error) {
	ref, err := r.Head()
	if err != nil {
		return "", err
	}
	commit, err := r.CommitObject(ref.Hash())
	if err != nil {
		return "", err
	}
	tree, err := commit.Tree()
	if err != nil {
		return "", err
	}

	dmp := diffmatchpatch.New()
	var diffStr strings.Builder

	for path, fileStatus := range status {
		if fileStatus.Staging == git.Unmodified && fileStatus.Worktree == git.Unmodified {
			continue
		}

		var oldContent, newContent string

		// Get old content
		if fileStatus.Staging == git.Modified || fileStatus.Staging == git.Deleted || fileStatus.Worktree == git.Modified || fileStatus.Worktree == git.Deleted {
			file, err := tree.File(path)
			if err == nil {
				oldContent, _ = file.Contents()
			}
		}

		// Get new content
		if fileStatus.Staging != git.Deleted && fileStatus.Worktree != git.Deleted {
			b, err := os.ReadFile(path)
			if err == nil {
				newContent = string(b)
			}
		}

		patches := dmp.PatchMake(oldContent, newContent)
		if len(patches) > 0 {
			diffStr.WriteString(fmt.Sprintf("--- a/%s\n+++ b/%s\n", path, path))
			diffStr.WriteString(dmp.PatchToText(patches))
			diffStr.WriteString("\n")
		}
	}

	return diffStr.String(), nil
}
