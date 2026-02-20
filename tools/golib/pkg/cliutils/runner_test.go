package cliutils

import (
	"strings"
	"testing"
)

func TestRunStep_Success(t *testing.T) {
	out, _ := captureOutput(func() {
		// Run a simple command that succeeds
		RunStep("Echo Test", "echo 'hello world'")
	})

	if !strings.Contains(out, "Echo Test completed") {
		t.Errorf("RunStep expected success message, got: %s", out)
	}
	if !strings.Contains(out, "hello world") {
		t.Errorf("RunStep expected command output in box, got: %s", out)
	}
}

func TestRunStep_Failure(t *testing.T) {
	oldFatal := osExit
	defer func() { osExit = oldFatal }()

	exited := false
	osExit = func(code int) {
		exited = true
	}

	out, _ := captureOutput(func() {
		RunStep("Failing Task", "exit 1")
	})

	if !exited {
		t.Errorf("Expected osExit to be called on step failure")
	}
	if !strings.Contains(out, "Failing Task") {
		t.Errorf("RunStep missing failed message, got: %s", out)
	}
}
