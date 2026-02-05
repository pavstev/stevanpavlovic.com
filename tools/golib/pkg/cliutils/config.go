package cliutils

import (
	"bytes"
	_ "embed"
	"fmt"
	"os"
	"os/exec"
	"sync"
	"text/template"

	"gopkg.in/yaml.v3"
)

//go:embed tasks.yaml
var stepsYAML []byte

type StepConfig struct {
	Name    string `yaml:"name"`
	Command string `yaml:"command"`
	Cwd     string `yaml:"cwd"`
}

// stepsFile mirrors the top-level structure of tasks.yaml.
type stepsFile struct {
	Vars  map[string]string     `yaml:"vars"`
	Steps map[string]StepConfig `yaml:"tasks"`
}

var steps struct {
	sync sync.Once
	vars map[string]string
	data map[string]StepConfig
}

// GetStepByID returns the step configuration for the given ID.
// Global vars defined under the top-level `vars` key are expanded in
// both the `command` and `cwd` fields before the step is returned.
// Per-step template arguments (e.g. {{.ExcludePattern}}) are left intact
// and can be resolved later via EvaluateCommand.
func GetStepByID(id string) (StepConfig, error) {
	steps.sync.Do(func() {
		var raw stepsFile
		if err := yaml.Unmarshal(stepsYAML, &raw); err != nil {
			Fatal(fmt.Sprintf("Failed to load embedded steps configuration: %v", err))
		}
		steps.vars = raw.Vars
		steps.data = raw.Steps
	})

	step, ok := steps.data[id]
	if !ok {
		return StepConfig{}, fmt.Errorf("step with ID %q not found", id)
	}

	// Expand global vars in command and cwd.
	expanded := expandVars(step, steps.vars)
	return expanded, nil
}

// expandVars replaces ${VAR} (and $VAR) references in command/cwd with the
// values from the global vars map.  Unknown keys are left as empty strings,
// matching the behaviour of os.Expand / Docker Compose variable substitution.
func expandVars(step StepConfig, vars map[string]string) StepConfig {
	if len(vars) == 0 {
		return step
	}
	mapper := func(key string) string {
		return vars[key]
	}
	step.Command = os.Expand(step.Command, mapper)
	step.Cwd = os.Expand(step.Cwd, mapper)
	return step
}

// EvaluateCommand evaluates a templated command string with the provided data.
func EvaluateCommand(commandTpl string, data any) (string, error) {
	if data == nil {
		return commandTpl, nil
	}

	tmpl, err := template.New("cmd").Parse(commandTpl)
	if err != nil {
		return "", fmt.Errorf("failed to parse command template: %w", err)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to execute command template: %w", err)
	}

	return buf.String(), nil
}

// MustGetTask returns a Task for the given ID or fatals if not found.
func MustGetTask(id string) Task {
	step, err := GetStepByID(id)
	if err != nil {
		Fatal(fmt.Sprintf("Step %q not found: %v", id, err))
	}
	return Task(step)
}

// RunInteractiveByID resolves a step by ID and runs it interactively with a
// real TTY (stdin/stdout/stderr wired directly to the terminal).
func RunInteractiveByID(id string, data any) {
	step, err := GetStepByID(id)
	if err != nil {
		Fatal(fmt.Sprintf("Step %q not found: %v", id, err))
	}

	cmdStr, err := EvaluateCommand(step.Command, data)
	if err != nil {
		Fatal(fmt.Sprintf("Failed to map step %q: %v", id, err))
	}

	RunInteractive(step.Name, cmdStr, step.Cwd)
}

// EnsureCommandExists returns true if the given CLI tool is found on the PATH.
// It runs "<tool> --version" to probe for existence.
func EnsureCommandExists(tool string) bool {
	return exec.Command(tool, "--version").Run() == nil
}
