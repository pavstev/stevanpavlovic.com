package utils

import (
	"regexp"
)

var ansiRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)

// CleanANSI removes all terminal color and formatting escape codes from a string.
// This is critical for calculating correct display lengths in CLI UI components.
func CleanANSI(s string) string {
	return ansiRegex.ReplaceAllString(s, "")
}
