package log

import (
	"bytes"
	"io"
	"os"
	"strings"
	"testing"
)

func TestLogFunctions(t *testing.T) {
	// Mock osExit
	originalExit := osExit
	exitCode := -1
	osExit = func(code int) {
		exitCode = code
	}
	defer func() { osExit = originalExit }()

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
