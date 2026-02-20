package cli

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
var configYAML []byte

// TaskConfig represents a unified task definition in the system.
type TaskConfig struct {
	Name            string   `yaml:"name"`
	Type            string   `yaml:"type"` // "single" or "batch"
	PreMsg          string   `yaml:"pre_msg"`
	OnError         string   `yaml:"on_error"`
	Description     string   `yaml:"description"`
	Command         string   `yaml:"command,omitempty"` // Required for single
	Tasks           []string `yaml:"tasks,omitempty"`   // Required for batch
	Cwd             string   `yaml:"cwd,omitempty"`
	PreRun          []string `yaml:"pre_run,omitempty"`
	PostRun         []string `yaml:"post_run,omitempty"`
	Parallel        bool     `yaml:"parallel,omitempty"`
	Workers         int      `yaml:"workers,omitempty"`
	ContinueOnError bool     `yaml:"continue_on_error,omitempty"` // Required for batch error handling
	Interactive     bool     `yaml:"interactive,omitempty"`
}

// BatchConfig is kept as an alias to TaskConfig to prevent build errors in legacy runner code.
type BatchConfig = TaskConfig

type Config struct {
	Vars  map[string]string     `yaml:"vars"`
	Tasks map[string]TaskConfig `yaml:"tasks"`
}

var cfg struct {
	sync sync.Once
	data Config
}

// GetConfig returns the parsed singleton configuration.
func GetConfig() Config {
	cfg.sync.Do(func() {
		if err := yaml.Unmarshal(configYAML, &cfg.data); err != nil {
			Fatal(fmt.Sprintf("Failed to parse config: %v", err))
		}
	})
	return cfg.data
}

// GetTaskByID retrieves a task and expands its variables.
func GetTaskByID(id string) (TaskConfig, error) {
	config := GetConfig()
	task, ok := config.Tasks[id]
	if !ok {
		return TaskConfig{}, fmt.Errorf("task %q not found", id)
	}

	// Expand variables using the vars map
	mapper := func(key string) string { return config.Vars[key] }
	task.Command = os.Expand(task.Command, mapper)
	task.Cwd = os.Expand(task.Cwd, mapper)

	return task, nil
}

// EvaluateCommand parses Go template syntax in commands.
func EvaluateCommand(commandTpl string, data any) (string, error) {
	if data == nil || commandTpl == "" {
		return commandTpl, nil
	}
	tmpl, err := template.New("cmd").Parse(commandTpl)
	if err != nil {
		return "", err
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}
	return buf.String(), nil
}

// EnsureCommandExists verifies if a tool is available in the environment.
func EnsureCommandExists(tool string) bool {
	_, err := exec.LookPath(tool)
	return err == nil
}
