package runner

import (
	"repokit/pkg/core"
	"testing"
)

func TestRunTask_NonExistent(t *testing.T) {
	// Mock osExit
	originalExit := core.OSExit
	core.OSExit = func(int) {}
	defer func() { core.OSExit = originalExit }()

	// Capture output to avoid noise
	core.Quiet = true
	defer func() { core.Quiet = false }()
}

func TestRunQueue_Basic(t *testing.T) {
	// Mock some tasks in the config if needed
	// For now, test empty queue
	RunQueue([]string{}, 1, false)
}
