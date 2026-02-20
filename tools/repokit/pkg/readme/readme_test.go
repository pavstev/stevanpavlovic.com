package readme

import (
	"sort"
	"testing"
)

func TestDetectStack(t *testing.T) {
	tests := []struct {
		name     string
		deps     map[string]string
		expected []string
	}{
		{
			name: "Astro and Tailwind",
			deps: map[string]string{
				"astro":       "4.0.0",
				"tailwindcss": "3.3.0",
			},
			expected: []string{"Astro", "Tailwind CSS"},
		},
		{
			name: "React and TypeScript",
			deps: map[string]string{
				"react":      "18.2.0",
				"typescript": "5.0.0",
			},
			expected: []string{"React", "TypeScript"},
		},
		{
			name: "Mixed dependencies",
			deps: map[string]string{
				"next": "14.0.0",
				"zod":  "3.22.0",
			},
			expected: []string{"Next.js", "Zod"},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			stack := []string{}
			detectStack(tt.deps, &stack)

			// Note: detectStack might add "Go" or "Python" if files exist,
			// but we are testing the dependency matching logic here.
			// Sort expected to match detectStack's alphabetical sorting
			sort.Strings(tt.expected)

			// Filter out Go/Python if they were added during test execution
			actual := []string{}
			for _, s := range stack {
				if s != "Go" && s != "Python (UV)" {
					actual = append(actual, s)
				}
			}
			sort.Strings(actual)

			if len(actual) != len(tt.expected) {
				t.Fatalf("expected stack length %d, got %d. actual: %v", len(tt.expected), len(actual), actual)
			}
			for i := range actual {
				if actual[i] != tt.expected[i] {
					t.Errorf("at index %d: expected %s, got %s", i, tt.expected[i], actual[i])
				}
			}
		})
	}
}

func TestBuildOpinionatedPrompt(t *testing.T) {
	meta := &projectMetadata{
		Name:        "Test Project",
		Version:     "1.0.0",
		Description: "A test project description",
		TechStack:   []string{"Go", "Astro"},
		Tasks: map[string]string{
			"build": "Build the project",
			"lint":  "Lint the project",
		},
		Structure: "  main.go\n  README.md\n",
		FileStats: map[string]int{
			".go": 1,
			".md": 1,
		},
	}

	prompt := buildOpinionatedPrompt(meta)

	// Basic checks to ensure metadata is included
	expectedSubstrings := []string{
		"Test Project",
		"1.0.0",
		"A test project description",
		"Go, Astro",
		"build: Build the project",
		"lint: Lint the project",
		"main.go",
		".go: 1 files",
	}

	for _, s := range expectedSubstrings {
		if !contains(prompt, s) {
			t.Errorf("expected prompt to contain %q", s)
		}
	}
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || s[:len(substr)] == substr || (len(s) > len(substr) && contains(s[1:], substr)))
}
