package core

import (
	"testing"
)

func TestGetConfig(t *testing.T) {
	config, err := GetConfig()
	if err != nil {
		t.Fatalf("GetConfig() error: %v", err)
	}

	if len(config.Tasks) == 0 {
		t.Error("GetConfig() returned empty tasks")
	}

	if _, ok := config.Tasks["build_go"]; !ok {
		t.Error("Expected task 'build_go' not found in config")
	}
}

func TestGetTaskByID(t *testing.T) {
	task, err := GetTaskByID("build_go")
	if err != nil {
		t.Fatalf("GetTaskByID('build_go') error: %v", err)
	}

	if task.Name == "" {
		t.Error("GetTaskByID() returned task with empty name")
	}

	// Test non-existent task
	_, err = GetTaskByID("non-existent")
	if err == nil {
		t.Error("GetTaskByID('non-existent') expected error, got nil")
	}
}

func TestEvaluateCommand(t *testing.T) {
	tests := []struct {
		name     string
		tpl      string
		data     any
		expected string
	}{
		{
			name:     "Simple template",
			tpl:      "hello {{.Name}}",
			data:     map[string]string{"Name": "World"},
			expected: "hello World",
		},
		{
			name:     "Empty template",
			tpl:      "",
			data:     nil,
			expected: "",
		},
		{
			name:     "No data",
			tpl:      "fixed command",
			data:     nil,
			expected: "fixed command",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := EvaluateCommand(tt.tpl, tt.data)
			if err != nil {
				t.Errorf("EvaluateCommand() error: %v", err)
			}
			if got != tt.expected {
				t.Errorf("EvaluateCommand() got %q, expected %q", got, tt.expected)
			}
		})
	}
}

func TestEnsureCommandExists(t *testing.T) {
	if !EnsureCommandExists("go") {
		t.Error("EnsureCommandExists('go') returned false, expected true")
	}
	if EnsureCommandExists("non-existent-command-xyz") {
		t.Error("EnsureCommandExists('non-existent-command-xyz') returned true, expected false")
	}
}
