package core

import (
	"errors"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/h2non/filetype"
)

// ResolveFiles parses a glob pattern containing double asterisks for recursive matching.
// Returns a flat list of absolute file paths matching the extension.
func ResolveFiles(pattern string) ([]string, error) {
	if !strings.Contains(pattern, "**") {
		return filepath.Glob(pattern)
	}

	parts := strings.Split(pattern, "**")
	base := parts[0]
	if base == "" {
		base = "."
	}

	absBase, err := filepath.Abs(base)
	if err != nil {
		return nil, err
	}

	// Build regex: base + .* + rest
	// Quote the base path
	regStr := "^" + regexp.QuoteMeta(filepath.ToSlash(absBase))
	for i := 1; i < len(parts); i++ {
		regStr += ".*"
		p := parts[i]
		// Quote the rest but keep * as glob star and . as dot
		p = regexp.QuoteMeta(p)
		p = strings.ReplaceAll(p, "\\*", ".*")   // * becomes .* in our simplified version
		p = strings.ReplaceAll(p, "\\.\\*", ".*") // handle .* specifically if it was already there
		regStr += p
	}
	regStr += "$"

	re, err := regexp.Compile(regStr)
	if err != nil {
		return nil, err
	}

	var matches []string
	err = filepath.WalkDir(absBase, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if d.IsDir() {
			return nil
		}
		if re.MatchString(filepath.ToSlash(path)) {
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
func IsBinary(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	if knownTextExts[ext] {
		return false
	}

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
