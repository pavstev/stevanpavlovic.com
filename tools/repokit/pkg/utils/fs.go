package utils

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"strings"

	"github.com/h2non/filetype"
)

// ResolveFiles parses a glob pattern containing double asterisks for recursive matching.
// Returns a flat list of absolute file paths matching the extension.
func ResolveFiles(pattern string) ([]string, error) {
	if !strings.Contains(pattern, "**") {
		return filepath.Glob(pattern)
	}

	parts := strings.SplitN(pattern, "**", 2)
	root := parts[0]
	if root == "" {
		root = "."
	} else if strings.HasSuffix(root, string(filepath.Separator)) {
		root = root[:len(root)-1]
	}
	if root == "" {
		root = "/"
	}

	suffix := parts[1]
	var matches []string
	err := filepath.WalkDir(root, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		// Convert both to same separator for robustness
		p := filepath.ToSlash(path)
		s := filepath.ToSlash(suffix)
		if strings.HasSuffix(p, s) {
			matches = append(matches, path)
		}
		return nil
	})
	return matches, err
}

var knownTextExts = map[string]bool{
	".js": true, ".ts": true, ".jsx": true, ".tsx": true,
	".json": true, ".html": true, ".css": true, ".scss": true,
	".md": true, ".yml": true, ".yaml": true, ".sh": true,
	".zsh": true, ".astro": true, ".toml": true, ".sql": true,
	".go": true, ".txt": true, ".csv": true, ".xml": true,
}

// IsBinary attempts to detect if a file is a non-text binary payload.
// Uses h2non/filetype magic byte inspection alongside manual null-byte scanning.
func IsBinary(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	if knownTextExts[ext] {
		return false
	}

	f, err := os.Open(path)
	if err != nil {
		return true // Assumed unreadable/binary if missing access
	}
	defer func() { _ = f.Close() }()

	head := make([]byte, 1024)
	n, err := f.Read(head)
	if err != nil && !errors.Is(err, io.EOF) {
		return true
	}
	head = head[:n]

	// Manual null byte check fallback for raw binary chunks without magic headers
	for _, b := range head {
		if b == 0 {
			return true
		}
	}

	// Magic byte inspection
	kind, _ := filetype.Match(head)
	if kind != filetype.Unknown && strings.HasPrefix(kind.MIME.Value, "application/") {
		return true
	}

	return false
}
