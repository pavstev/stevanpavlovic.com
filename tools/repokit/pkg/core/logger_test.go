package core

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"

	"github.com/charmbracelet/lipgloss"
)

func TestCustomBox(t *testing.T) {
	// Simple smoke test for CustomBox
	Quiet = false
	CustomBox("Test Title", "Test Content", primaryColor)
	Quiet = true
	CustomBox("Test Title", "Test Content", primaryColor)
	Quiet = false
}

func TestBoxOutput(t *testing.T) {
	// Simple smoke test for BoxOutput
	BoxOutput("Test Title", "Test Content", lipgloss.Color("1"))
}

func TestLogFunctions(t *testing.T) {
	// Mock OSExit
	originalExit := OSExit
	exitCode := -1
	OSExit = func(code int) {
		exitCode = code
	}
	defer func() { OSExit = originalExit }()

	// Capture stdout/stderr
	oldStdout := os.Stdout
	oldStderr := os.Stderr
	r, w, _ := os.Pipe()
	os.Stdout = w
	os.Stderr = w

	Info("test info")
	Success("test success")
	Step("test step")
	Warning("test warning")
	Error("test error")

	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stdout = oldStdout
	os.Stderr = oldStderr

	output := buf.String()
	expectedSubstrings := []string{
		"test info",
		"test success",
		"test step",
		"test warning",
		"test error",
	}

	for _, s := range expectedSubstrings {
		if !strings.Contains(output, s) {
			t.Errorf("expected output to contain %q, but it didn't. Full output: %q", s, output)
		}
	}

	// Test Fatal
	Fatal("test fatal")
	if exitCode != 1 {
		t.Errorf("expected exit code 1, got %d", exitCode)
	}
}

func TestQuietMode(t *testing.T) {
	Quiet = true
	defer func() { Quiet = false }()

	// Capture stderr
	oldStderr := os.Stderr
	r, w, _ := os.Pipe()
	os.Stderr = w

	Error("this should not be seen")

	w.Close()
	var buf bytes.Buffer
	io.Copy(&buf, r)
	os.Stderr = oldStderr

	if strings.Contains(buf.String(), "this should not be seen") {
		t.Errorf("Error should not have printed in quiet mode")
	}
}
