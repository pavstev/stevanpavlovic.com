package readme

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"repokit/pkg/llm"
	"repokit/pkg/log"

	"gopkg.in/yaml.v3"
)

// projectMetadata represents the context gathered for README generation.
type projectMetadata struct {
	Name         string            `json:"name"`
	Version      string            `json:"version"`
	Description  string            `json:"description"`
	TechStack    []string          `json:"tech_stack"`
	Dependencies map[string]string `json:"dependencies"`
	Tasks        map[string]string `json:"tasks"`
	Structure    string            `json:"structure"`
	FileStats    map[string]int    `json:"file_stats"`
}

// Run executes the codebase analysis and generates a structured README using an LLM.
func Run(ctx context.Context, providerName, model, apiKey string) {
	log.Info("Starting codebase analysis for README generation...")

	meta, err := gatherContext()
	if err != nil {
		log.Fatal("Analysis failed: %v", err)
	}

	log.Info("Generating README using %s...", providerName)

	p, err := llm.NewProvider(providerName, model, apiKey)
	if err != nil {
		log.Fatal("Failed to initialize LLM provider: %v", err)
	}

	prompt := buildOpinionatedPrompt(meta)

	resp, err := p.Generate(ctx, prompt)
	if err != nil {
		log.Fatal("LLM generation failed: %v", err)
	}

	outFile := "README.md"
	if err := os.WriteFile(outFile, []byte(resp), 0644); err != nil {
		log.Fatal("Failed to write to %s: %v", outFile, err)
	}

	log.Success("Generated %s successfully!", outFile)
}

func gatherContext() (*projectMetadata, error) {
	meta := &projectMetadata{
		FileStats: make(map[string]int),
		TechStack: []string{},
	}

	// 1. Parse package.json
	if b, err := os.ReadFile("package.json"); err == nil {
		var pj map[string]any
		if err := json.Unmarshal(b, &pj); err == nil {
			if n, ok := pj["name"].(string); ok {
				meta.Name = n
			}
			if v, ok := pj["version"].(string); ok {
				meta.Version = v
			}
			if d, ok := pj["description"].(string); ok {
				meta.Description = d
			}

			deps := make(map[string]string)
			if d, ok := pj["dependencies"].(map[string]any); ok {
				for k, v := range d {
					deps[k] = fmt.Sprintf("%v", v)
				}
			}
			if d, ok := pj["devDependencies"].(map[string]any); ok {
				for k, v := range d {
					deps[k] = fmt.Sprintf("%v", v)
				}
			}
			meta.Dependencies = deps
			detectStack(deps, &meta.TechStack)
		}
	}

	// 2. Parse tasks.yaml
	if b, err := os.ReadFile("tools/repokit/pkg/config/tasks.yaml"); err == nil {
		var tc struct {
			Tasks map[string]any `yaml:"tasks"`
		}
		if err := yaml.Unmarshal(b, &tc); err == nil {
			meta.Tasks = make(map[string]string)
			for k, v := range tc.Tasks {
				if t, ok := v.(map[string]any); ok {
					if name, ok := t["name"].(string); ok {
						meta.Tasks[k] = name
					}
				}
			}
		}
	}

	// 3. Gather Directory Structure & Stats
	var sb strings.Builder
	err := filepath.WalkDir(".", func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		name := d.Name()
		if d.IsDir() {
			if path != "." && (strings.HasPrefix(name, ".") || name == "node_modules" || name == "vendor" || name == "dist" || name == "bin" || name == "build" || name == "pkg") {
				return filepath.SkipDir
			}
			return nil
		}
		ext := filepath.Ext(path)
		if ext != "" {
			meta.FileStats[ext]++
		}
		sb.WriteString("  " + path + "\n")
		return nil
	})
	if err != nil {
		return nil, err
	}
	meta.Structure = sb.String()

	return meta, nil
}

func detectStack(deps map[string]string, stack *[]string) {
	markers := map[string]string{
		"astro":         "Astro",
		"react":         "React",
		"next":          "Next.js",
		"vite":          "Vite",
		"tailwindcss":   "Tailwind CSS",
		"typescript":    "TypeScript",
		"cloudflare":    "Cloudflare Workers/Pages",
		"zod":           "Zod",
		"framer-motion": "Framer Motion",
	}
	for marker, name := range markers {
		for d := range deps {
			if strings.Contains(d, marker) {
				*stack = append(*stack, name)
				break
			}
		}
	}
	if _, err := os.Stat("go.mod"); err == nil {
		*stack = append(*stack, "Go")
	}
	if _, err := os.Stat("pyproject.toml"); err == nil {
		*stack = append(*stack, "Python (UV)")
	}

	m := make(map[string]bool)
	unique := []string{}
	for _, s := range *stack {
		if !m[s] {
			m[s] = true
			unique = append(unique, s)
		}
	}
	sort.Strings(unique)
	*stack = unique
}

func buildOpinionatedPrompt(meta *projectMetadata) string {
	var sb strings.Builder
	sb.WriteString("Act as a Senior Software Architect. Generate a premium README.md for the following project.\n\n")

	sb.WriteString(fmt.Sprintf("PROJECT METADATA:\n- Name: %s\n- Version: %s\n- Description: %s\n", meta.Name, meta.Version, meta.Description))
	sb.WriteString("- Tech Stack: " + strings.Join(meta.TechStack, ", ") + "\n")

	sb.WriteString("\nCLI COMMANDS (Defined in repokit):\n")
	// Sort task IDs for deterministic output
	taskIDs := make([]string, 0, len(meta.Tasks))
	for id := range meta.Tasks {
		taskIDs = append(taskIDs, id)
	}
	sort.Strings(taskIDs)

	for _, id := range taskIDs {
		sb.WriteString(fmt.Sprintf("  - %s: %s\n", id, meta.Tasks[id]))
	}

	sb.WriteString("\nDIRECTORY STRUCTURE:\n" + meta.Structure + "\n")

	sb.WriteString("\nFILE STATISTICS:\n")
	// Sort keys for deterministic output
	exts := make([]string, 0, len(meta.FileStats))
	for ext := range meta.FileStats {
		exts = append(exts, ext)
	}
	sort.Strings(exts)

	for _, ext := range exts {
		sb.WriteString(fmt.Sprintf("  - %s: %d files\n", ext, meta.FileStats[ext]))
	}

	sb.WriteString("\nGUIDELINES:\n")
	sb.WriteString("1. Use high-end MD formatting.\n")
	sb.WriteString("2. Output ONLY the raw Markdown content.\n")

	return sb.String()
}
