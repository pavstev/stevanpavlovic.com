package cliutils

import (
	"strings"
	"testing"
)

func TestGetStepByID_VarExpansion(t *testing.T) {
	// lint_py, check_py and test_py all reference ${uv_py} which should expand
	// to the value declared under vars: in tasks.yaml.
	cases := []struct {
		id      string
		wantSub string
	}{
		{"lint_py", "env -u VIRTUAL_ENV uv run --project tools/pylib"},
		{"check_py", "env -u VIRTUAL_ENV uv run --project tools/pylib"},
		{"test_py", "env -u VIRTUAL_ENV uv run --project tools/pylib"},
	}

	for _, tc := range cases {
		step, err := GetStepByID(tc.id)
		if err != nil {
			t.Fatalf("GetStepByID(%q): unexpected error: %v", tc.id, err)
		}
		if !strings.Contains(step.Command, tc.wantSub) {
			t.Errorf("GetStepByID(%q): command %q does not contain %q", tc.id, step.Command, tc.wantSub)
		}
		// The raw ${uv_py} placeholder must not remain in the expanded command.
		if strings.Contains(step.Command, "${uv_py}") {
			t.Errorf("GetStepByID(%q): command still contains unexpanded ${uv_py}: %q", tc.id, step.Command)
		}
	}
}

func TestGetStepByID_NoVarLeakage(t *testing.T) {
	// Steps that don't reference any vars should be returned unchanged.
	step, err := GetStepByID("lint_eslint")
	if err != nil {
		t.Fatalf("GetStepByID(lint_eslint): %v", err)
	}
	if step.Command != "pnpm exec eslint ." {
		t.Errorf("unexpected command: %q", step.Command)
	}
}

func TestExpandVars_UnknownKey(t *testing.T) {
	cfg := StepConfig{Command: "echo ${unknown_var}", Cwd: "."}
	result := expandVars(cfg, map[string]string{"other": "val"})
	// os.Expand maps unknown keys to empty string.
	if result.Command != "echo " {
		t.Errorf("expected unknown key to expand to empty, got: %q", result.Command)
	}
}
