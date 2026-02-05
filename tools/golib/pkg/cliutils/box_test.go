package cliutils

import (
	"strings"
	"testing"

	"github.com/charmbracelet/lipgloss"
)

func TestBoxOutput(t *testing.T) {
	title := "My Box Title"
	content := "This is the content inside the box."
	color := lipgloss.Color("4") // any color

	out, _ := captureOutput(func() {
		BoxOutput(title, content, color)
	})

	if !strings.Contains(out, title) {
		t.Errorf("BoxOutput() missing title %q, got: %s", title, out)
	}
	if !strings.Contains(out, content) {
		t.Errorf("BoxOutput() missing content %q, got: %s", content, out)
	}
	if !strings.Contains(out, "─") && !strings.Contains(out, "┌") {
		t.Errorf("BoxOutput() missing box border elements, got: %s", out)
	}
}
