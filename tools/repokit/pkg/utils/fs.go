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
	root, suffix := filepath.Clean(parts[0]), parts[1]
	var matches []string
	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() {
			return err
		}
		if strings.HasSuffix(path, suffix) {
			matches = append(matches, path)
		}
		return nil
	})
	return matches, err
}

// IsBinary attempts to detect if a file is a non-text binary payload.
// Uses h2non/filetype magic byte inspection alongside manual null-byte scanning.
func IsBinary(path string) bool {
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
