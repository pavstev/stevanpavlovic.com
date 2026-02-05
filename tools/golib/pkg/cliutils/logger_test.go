package cliutils

import (
	"bytes"
	"os"
	"strings"
	"testing"
)

// captureOutput intercepts stdout and stderr for testing.
// Returns a function that restores os.Stdout and os.Stderr and returns the captured strings.
func captureOutput(f func()) (out, err string) {
	oldStdout := os.Stdout
	oldStderr := os.Stderr
	rOut, wOut, _ := os.Pipe()
	rErr, wErr, _ := os.Pipe()

	os.Stdout = wOut
	os.Stderr = wErr

	outC := make(chan string)
	errC := make(chan string)

	// Copy output concurrently
	go func() {
		var buf bytes.Buffer
		_, _ = buf.ReadFrom(rOut)
		outC <- buf.String()
	}()
	go func() {
		var buf bytes.Buffer
		_, _ = buf.ReadFrom(rErr)
		errC <- buf.String()
	}()

	f()

	// Close writers and restore standard ones
	_ = wOut.Close()
	_ = wErr.Close()
	os.Stdout = oldStdout
	os.Stderr = oldStderr

	return <-outC, <-errC
}

func TestInfo(t *testing.T) {
	msg := "test info message"
	out, _ := captureOutput(func() {
		Info(msg)
	})
	if !strings.Contains(out, msg) {
		t.Errorf("Info() output didn't contain %q, got: %q", msg, out)
	}
	if !strings.Contains(out, "ℹ️") {
		t.Errorf("Info() missing icon, got: %q", out)
	}
}

func TestSuccess(t *testing.T) {
	msg := "test success message"
	out, _ := captureOutput(func() {
		Success(msg)
	})
	if !strings.Contains(out, msg) {
		t.Errorf("Success() output didn't contain %q, got: %q", msg, out)
	}
	if !strings.Contains(out, "✅") {
		t.Errorf("Success() missing icon, got: %q", out)
	}
}

func TestWarning(t *testing.T) {
	msg := "test warning message"
	out, _ := captureOutput(func() {
		Warning(msg)
	})
	if !strings.Contains(out, msg) {
		t.Errorf("Warning() output didn't contain %q, got: %q", msg, out)
	}
	if !strings.Contains(out, "⚠️") {
		t.Errorf("Warning() missing icon, got: %q", out)
	}
}

func TestError(t *testing.T) {
	msg := "test error message"
	_, errOut := captureOutput(func() {
		Error(msg)
	})
	if !strings.Contains(errOut, msg) {
		t.Errorf("Error() output didn't contain %q in stderr, got: %q", msg, errOut)
	}
	if !strings.Contains(errOut, "❌") {
		t.Errorf("Error() missing icon in stderr, got: %q", errOut)
	}
}

func TestStep(t *testing.T) {
	msg := "test step message"
	out, _ := captureOutput(func() {
		Step(msg)
	})
	if !strings.Contains(out, msg) {
		t.Errorf("Step() output didn't contain %q, got: %q", msg, out)
	}
	if !strings.Contains(out, "▶") {
		t.Errorf("Step() missing icon, got: %q", out)
	}
}
