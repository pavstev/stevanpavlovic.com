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
	absPattern, err := filepath.Abs(pattern)
	if err != nil {
		return nil, err
	}
	pattern = filepath.ToSlash(absPattern)

	// If the pattern doesn't contain "**", use standard glob.
	// Note: filepath.Glob does not support "**" for recursive matching.
	// This check should ideally be before converting to absolute path if we want to preserve relative glob behavior for simple patterns.
	// However, the instruction implies all paths should be absolute before matching.
	if !strings.Contains(pattern, "**") {
		// filepath.Glob expects a system-native path separator, so convert back if needed.
		return filepath.Glob(filepath.FromSlash(pattern))
	}

	// Determine the base directory for walking.
	// The base should be the part of the pattern before the first "**" or "*".
	// If the pattern starts with "**", the base is the current directory.
	base := "."
	if idx := strings.Index(pattern, "**"); idx != -1 {
		base = pattern[:idx]
	} else if idx := strings.Index(pattern, "*"); idx != -1 {
		base = pattern[:idx]
	}
	// If base is still empty or just a drive letter, set it to root or current dir.
	if base == "" || (len(base) == 2 && base[1] == ':') { // Handle Windows drive letters like "C:"
		base = filepath.VolumeName(pattern) // Get drive letter if present
		if base == "" {
			base = "."
		}
	}
	base = filepath.Dir(base) // Get the directory part of the base
	if base == "" {
		base = "."
	}
	base = filepath.FromSlash(base) // Convert base to system-native path for filepath.Walk

	// Build regex:
	// Escape the whole pattern first
	regStr := regexp.QuoteMeta(pattern)
	// Replace escaped /**/ with (?:/.*/)? to make it truly optional
	regStr = strings.ReplaceAll(regStr, "/\\*\\*/", "/(?:.*/)?")
	// Cleanup any remaining ** or *
	regStr = strings.ReplaceAll(regStr, "\\*\\*", ".*")
	regStr = strings.ReplaceAll(regStr, "\\*", "[^/]*")
	regStr = "^" + regStr + "$"

	re, err := regexp.Compile(regStr)
	if err != nil {
		return nil, err
	}

	var matches []string
	err = filepath.Walk(base, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		path = filepath.ToSlash(path)
		if re.MatchString(path) {
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
