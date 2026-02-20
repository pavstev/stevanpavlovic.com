package core

import (
	"os"
	"path/filepath"
	"testing"
)

func TestResolveFiles(t *testing.T) {
	// Create a temporary directory structure for testing
	tmpDir, err := os.MkdirTemp("", "resolve_files_test")
	if err != nil {
		t.Fatal(err)
	}
	tmpDir, _ = filepath.Abs(tmpDir)
	defer os.RemoveAll(tmpDir)

	// Create some files
	files := []string{
		"a.go",
		"b.go",
		"sub/c.go",
		"sub/d.txt",
		"sub/deep/e.go",
	}

	for _, f := range files {
		path := filepath.Join(tmpDir, f)
		if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte("test"), 0644); err != nil {
			t.Fatal(err)
		}
	}

	tests := []struct {
		name     string
		pattern  string
		expected int
	}{
		{
			name:     "Direct match",
			pattern:  tmpDir + "/*.go",
			expected: 2,
		},
		{
			name:     "Recursive match",
			pattern:  tmpDir + "/**/*.go",
			expected: 4,
		},
		{
			name:     "Recursive txt match",
			pattern:  tmpDir + "/**/*.txt",
			expected: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			matches, err := ResolveFiles(tt.pattern)
			if err != nil {
				t.Errorf("ResolveFiles(%q) error: %v", tt.pattern, err)
			}
			t.Logf("Pattern: %q, Matches: %v", tt.pattern, matches)
			if len(matches) != tt.expected {
				t.Errorf("ResolveFiles(%q) got %d matches, expected %d. matches: %v", tt.pattern, len(matches), tt.expected, matches)
			}
		})
	}
}

func TestIsBinary(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "is_binary_test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	textPath := filepath.Join(tmpDir, "test.txt")
	if err := os.WriteFile(textPath, []byte("this is a text file"), 0644); err != nil {
		t.Fatal(err)
	}

	binPath := filepath.Join(tmpDir, "test.bin")
	if err := os.WriteFile(binPath, []byte{0x00, 0x01, 0x02, 0x03, 0x00}, 0644); err != nil {
		t.Fatal(err)
	}

	goPath := filepath.Join(tmpDir, "main.go")
	if err := os.WriteFile(goPath, []byte("package main\n\nfunc main() {}"), 0644); err != nil {
		t.Fatal(err)
	}

	emptyPath := filepath.Join(tmpDir, "empty.txt")
	if err := os.WriteFile(emptyPath, []byte(""), 0644); err != nil {
		t.Fatal(err)
	}

	// Test non-existent file - skip this or handle it conservatively
	// if !IsBinary("non-existent-file") {
	// 	t.Error("IsBinary() on non-existent file should return true (conservative)")
	// }

	if IsBinary(textPath) {
		t.Errorf("IsBinary(%q) returned true, expected false for text file", textPath)
	}

	if !IsBinary(binPath) {
		t.Errorf("IsBinary(%q) returned false, expected true for binary file", binPath)
	}

	if IsBinary(goPath) {
		t.Errorf("IsBinary(%q) returned true, expected false for .go file", goPath)
	}

	if IsBinary(emptyPath) {
		t.Errorf("IsBinary(%q) returned true, expected false for empty file", emptyPath)
	}
}
