package pack

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"repokit/pkg/cli"

	"github.com/atotto/clipboard"
	"github.com/go-git/go-git/v5"
	"github.com/go-git/go-git/v5/plumbing/format/gitignore"
	"github.com/h2non/filetype"
)

var (
	ExcludeDirs = map[string]bool{
		"node_modules": true,
		"__pycache__":  true,
		".astro":       true,
		"dist":         true,
		".gemini":      true,
		".git":         true,
		".svn":         true,
		".hg":          true,
		"CVS":          true,
	}
	ExcludeFiles = map[string]bool{
		"package-lock.json": true,
		"pnpm-lock.yaml":    true,
		"yarn.lock":         true,
		".DS_Store":         true,
		"xclip-check.tmp":   true,
	}
	ExtensionToLang = map[string]string{
		".js":    "javascript",
		".ts":    "typescript",
		".jsx":   "javascript",
		".tsx":   "typescript",
		".json":  "json",
		".html":  "html",
		".css":   "css",
		".scss":  "scss",
		".md":    "markdown",
		".yml":   "yaml",
		".yaml":  "yaml",
		".sh":    "bash",
		".zsh":   "bash",
		".astro": "astro",
		".toml":  "toml",
		".sql":   "sql",
		".go":    "go",
	}
	slugifyRegexp = regexp.MustCompile(`[^a-z0-9]+`)
)

type Context struct {
	Cwd            string
	TargetBaseDir  string
	FileIndex      int
	CollectedFiles []CollectedFile
	TreeLines      []string
	GitMatcher     gitignore.Matcher
}

type CollectedFile struct {
	Idx     int
	Path    string
	RelPath string
	Content string
	Anchor  string
}

// Run executes the pack command to bundle directory contents into a single Markdown file.
func Run(targetDir string) {
	cwd, _ := os.Getwd()

	// Resolve target directory
	if targetDir == "" {
		targetDir = cwd
	} else {
		if !filepath.IsAbs(targetDir) {
			targetDir = filepath.Join(cwd, targetDir)
		}

		if info, err := os.Stat(targetDir); err != nil || !info.IsDir() {
			alt := filepath.Join(cwd, "tools", targetDir)
			if info, err := os.Stat(alt); err == nil && info.IsDir() {
				targetDir = alt
			} else {
				cli.Error(fmt.Sprintf("Directory not found: %s", targetDir))
				return
			}
		}
	}

	cli.Step(fmt.Sprintf("Bundling: %s", targetDir))

	// Clean up old output files
	files, _ := filepath.Glob("pack_output_*.md")
	for _, f := range files {
		_ = os.Remove(f)
	}

	gitStatus := getGitStatus(cwd)
	cli.Info(gitStatus)

	ctx := &Context{
		Cwd:           cwd,
		TargetBaseDir: targetDir,
		GitMatcher:    loadGitignore(cwd),
	}

	buildTree(targetDir, ctx, "", true)

	// Generate markdown output
	md := generateMarkdown(ctx, targetDir, cwd, gitStatus)

	outputFilename := fmt.Sprintf("pack_output_%s.md", slugifyStr(filepath.Base(targetDir)))
	if targetDir == cwd {
		outputFilename = "pack_output_current-directory.md"
	}
	outputPath := filepath.Join(cwd, "tools/repokit/dist", outputFilename)

	err := os.WriteFile(outputPath, []byte(md.String()), 0644)
	if err != nil {
		cli.Error(fmt.Sprintf("Failed to write output: %v", err))
		return
	}

	_ = clipboard.WriteAll(md.String())

	cli.Success(fmt.Sprintf("Success! Bundled %d files.", ctx.FileIndex))
	cli.Info(fmt.Sprintf("Output saved to: %s", outputPath))
	cli.Info("Content copied to clipboard.")
}

func generateMarkdown(ctx *Context, targetDir, cwd, gitStatus string) strings.Builder {
	var md strings.Builder
	targetDirName := filepath.Base(targetDir)
	if targetDir == cwd {
		targetDirName = "current-directory"
	}

	md.WriteString(fmt.Sprintf("# 📦 Code Pack: %s\n\n", targetDirName))
	md.WriteString(fmt.Sprintf("> **Git Status:** %s\n\n", gitStatus))

	metaContent := extractMetadata(cwd)
	if metaContent != "" {
		md.WriteString(metaContent + "\n")
	}

	md.WriteString("## 🌳 Directory Structure\n\n<pre>\n")
	md.WriteString(strings.Join(ctx.TreeLines, "\n"))
	md.WriteString("\n</pre>\n\n")

	if len(ctx.CollectedFiles) > 0 {
		md.WriteString("## 📂 Files\n\n")
		for _, f := range ctx.CollectedFiles {
			md.WriteString(fmt.Sprintf("<a id=%q></a>\n", f.Anchor))
			md.WriteString(fmt.Sprintf("### %d. 📄 `%s`\n\n", f.Idx, f.RelPath))
			md.WriteString("<details>\n")
			md.WriteString(fmt.Sprintf("<summary>Click to expand/collapse `%s`</summary>\n\n", filepath.Base(f.Path)))

			lang := ExtensionToLang[filepath.Ext(f.Path)]
			md.WriteString(fmt.Sprintf("```%s\n", lang))
			md.WriteString(f.Content)
			md.WriteString("\n```\n</details>\n\n")
		}
	}

	return md
}

func slugifyStr(s string) string {
	s = strings.ToLower(s)
	s = slugifyRegexp.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

func isBinary(path string) bool {
	f, err := os.Open(path)
	if err != nil {
		return true
	}
	defer func() { _ = f.Close() }()

	head := make([]byte, 1024)
	n, err := f.Read(head)
	if err != nil && !errors.Is(err, io.EOF) {
		return true
	}
	head = head[:n]

	for _, b := range head {
		if b == 0 {
			return true
		}
	}

	kind, _ := filetype.Match(head)
	if kind != filetype.Unknown && strings.HasPrefix(kind.MIME.Value, "application/") {
		return true
	}

	return false
}

func (ctx *Context) shouldExclude(path string, isDir bool) bool {
	rel, err := filepath.Rel(ctx.Cwd, path)
	if err != nil {
		return false
	}

	parts := strings.Split(rel, string(os.PathSeparator))
	return ctx.GitMatcher.Match(parts, isDir)
}

//nolint:gocyclo
func buildTree(currentPath string, ctx *Context, indent string, isLast bool) {
	info, err := os.Stat(currentPath)
	if err != nil {
		return
	}

	name := info.Name()

	// Determine the connector prefix for this node.
	// The root call uses indent="" and isRoot=true (no connector).
	// All other nodes get ├── or └── based on position.
	isRoot := indent == "" && currentPath == ctx.TargetBaseDir
	var connector string
	if !isRoot {
		if isLast {
			connector = "└── "
		} else {
			connector = "├── "
		}
	}

	if info.IsDir() {
		if !isRoot && (ExcludeDirs[name] || ctx.shouldExclude(currentPath, true)) {
			return
		}

		ctx.TreeLines = append(ctx.TreeLines, fmt.Sprintf("%s%s📁 %s/", indent, connector, name))

		entries, err := os.ReadDir(currentPath)
		if err != nil {
			return
		}

		sort.Slice(entries, func(i, j int) bool {
			if entries[i].IsDir() != entries[j].IsDir() {
				return entries[i].IsDir()
			}
			return strings.ToLower(entries[i].Name()) < strings.ToLower(entries[j].Name())
		})

		var validEntries []os.DirEntry
		for _, entry := range entries {
			entryPath := filepath.Join(currentPath, entry.Name())
			if entry.IsDir() {
				if !ExcludeDirs[entry.Name()] && !ctx.shouldExclude(entryPath, true) {
					validEntries = append(validEntries, entry)
				}
			} else {
				validEntries = append(validEntries, entry)
			}
		}

		// Build child indent: root children have no continuation, others extend with │ or space.
		var childIndent string
		if isRoot {
			childIndent = ""
		} else if isLast {
			childIndent = indent + "    "
		} else {
			childIndent = indent + "│   "
		}

		for i, entry := range validEntries {
			buildTree(filepath.Join(currentPath, entry.Name()), ctx, childIndent, i == len(validEntries)-1)
		}
	} else {
		// File entry
		if ExcludeFiles[name] || ctx.shouldExclude(currentPath, false) {
			ctx.TreeLines = append(ctx.TreeLines, fmt.Sprintf("%s%s📄 %s (skipped)", indent, connector, name))
			return
		}

		if info.Size() == 0 {
			ctx.TreeLines = append(ctx.TreeLines, fmt.Sprintf("%s%s📄 %s (empty, skipped)", indent, connector, name))
			return
		}

		if isBinary(currentPath) {
			ctx.TreeLines = append(ctx.TreeLines, fmt.Sprintf("%s%s📄 %s (binary, skipped)", indent, connector, name))
			return
		}

		ctx.FileIndex++
		idx := ctx.FileIndex
		anchor := fmt.Sprintf("file-%d", idx)
		relPath, _ := filepath.Rel(ctx.Cwd, currentPath)

		ctx.TreeLines = append(ctx.TreeLines, fmt.Sprintf("%s%s<a href=\"#%s\">📄 %s</a>", indent, connector, anchor, name))

		content, err := os.ReadFile(currentPath)
		if err == nil {
			ctx.CollectedFiles = append(ctx.CollectedFiles, CollectedFile{
				Idx:     idx,
				Path:    currentPath,
				RelPath: relPath,
				Content: string(content),
				Anchor:  anchor,
			})
		}
	}
}

func getGitStatus(cwd string) string {
	repo, err := git.PlainOpenWithOptions(cwd, &git.PlainOpenOptions{DetectDotGit: true})
	if err != nil {
		return "ℹ️  Not a git repository"
	}

	wt, err := repo.Worktree()
	if err != nil {
		return "❌ Error checking git status"
	}

	status, err := wt.Status()
	if err != nil {
		return "❌ Error checking git status"
	}

	if status.IsClean() {
		return "✅ Git repository is clean"
	}

	return "⚠️  Git repository has changes"
}

func extractMetadata(cwd string) string {
	var parts []string

	if data, err := os.ReadFile(filepath.Join(cwd, "package.json")); err == nil {
		var pkg map[string]interface{}
		if err := json.Unmarshal(data, &pkg); err == nil {
			parts = append(parts, "### 📦 `package.json`")
			if name, ok := pkg["name"].(string); ok {
				parts = append(parts, fmt.Sprintf("- **Name**: %s", name))
			}
			if version, ok := pkg["version"].(string); ok {
				parts = append(parts, fmt.Sprintf("- **Version**: %s", version))
			}
			if desc, ok := pkg["description"].(string); ok {
				parts = append(parts, fmt.Sprintf("- **Description**: %s", desc))
			}
			if deps, ok := pkg["dependencies"].(map[string]interface{}); ok {
				parts = append(parts, fmt.Sprintf("- **Dependencies**: %d items", len(deps)))
			}
			parts = append(parts, "")
		}
	}

	if data, err := os.ReadFile(filepath.Join(cwd, "go.mod")); err == nil {
		parts = append(parts, "### 🐹 `go.mod`")
		lines := strings.Split(string(data), "\n")
		count := 0
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if strings.HasPrefix(line, "module") || strings.HasPrefix(line, "go ") {
				parts = append(parts, fmt.Sprintf("- `%s`", line))
				count++
			}
			if count >= 5 {
				break
			}
		}
		parts = append(parts, "")
	}

	if len(parts) > 0 {
		return "## 🔍 Project Metadata\n\n" + strings.Join(parts, "\n")
	}
	return ""
}

func loadVSCodeExcludes(cwd string) []string {
	path := filepath.Join(cwd, ".vscode", "settings.json")
	var patterns []string
	if data, err := os.ReadFile(path); err == nil {
		var settings map[string]interface{}
		if err := json.Unmarshal(data, &settings); err == nil {
			if excludes, ok := settings["files.exclude"].(map[string]interface{}); ok {
				for k, v := range excludes {
					if b, ok := v.(bool); ok && b {
						patterns = append(patterns, k)
					}
				}
			}
			if searchEx, ok := settings["search.exclude"].(map[string]interface{}); ok {
				for k, v := range searchEx {
					if b, ok := v.(bool); ok && b {
						patterns = append(patterns, k)
					}
				}
			}
		}
	}
	return patterns
}

func loadGitignore(cwd string) gitignore.Matcher {
	path := filepath.Join(cwd, ".gitignore")
	patterns := make([]gitignore.Pattern, 0, 32)

	if data, err := os.ReadFile(path); err == nil {
		lines := strings.Split(string(data), "\n")
		for _, line := range lines {
			line = strings.TrimSpace(line)
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			patterns = append(patterns, gitignore.ParsePattern(line, nil))
		}
	}

	for _, p := range loadVSCodeExcludes(cwd) {
		patterns = append(patterns, gitignore.ParsePattern(p, nil))
	}

	return gitignore.NewMatcher(patterns)
}
