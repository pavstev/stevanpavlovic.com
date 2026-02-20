package core

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestExport(t *testing.T) {
	tmpDir, err := os.MkdirTemp("", "schema_test")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	outPath := filepath.Join(tmpDir, "tasks.json")
	err = Export("tasks", outPath)
	if err != nil {
		t.Fatalf("Export failed: %v", err)
	}

	// Verify file exists and is valid JSON
	data, err := os.ReadFile(outPath)
	if err != nil {
		t.Fatalf("Failed to read exported schema: %v", err)
	}

	var m map[string]any
	if err := json.Unmarshal(data, &m); err != nil {
		t.Fatalf("Exported schema is not valid JSON: %v", err)
	}

	if m["title"] != "Repokit Task Configuration" {
		t.Errorf("expected title %q, got %q", "Repokit Task Configuration", m["title"])
	}
}

func TestExportInvalid(t *testing.T) {
	err := Export("invalid", "")
	if err == nil {
		t.Errorf("expected error for invalid schema name, got nil")
	}
}
