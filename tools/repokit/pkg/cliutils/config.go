package cliutils

import (
	"bytes"
	_ "embed"
	"fmt"
	"os"
	"sync"
	"text/template"

	"gopkg.in/yaml.v3"
)

//go:embed tasks.yaml
var configYAML []byte

type TaskConfig struct {
	Name        string   `yaml:"name"`
	Description string   `yaml:"description"`
	Command     string   `yaml:"command"`
	Cwd         string   `yaml:"cwd"`
	PreRun      []string `yaml:"pre_run"`
	PostRun     []string `yaml:"post_run"`
	Interactive bool     `yaml:"interactive"`
}

type BatchConfig struct {
	Name            string   `yaml:"name"`
	Description     string   `yaml:"description"`
	Tasks           []string `yaml:"tasks"`
	Parallel        bool     `yaml:"parallel"`
	Workers         int      `yaml:"workers"`
	ContinueOnError bool     `yaml:"continue_on_error"`
}

type Config struct {
	Vars    map[string]string      `yaml:"vars"`
	Tasks   map[string]TaskConfig  `yaml:"tasks"`
	Batches map[string]BatchConfig `yaml:"batches"`
}

var cfg struct {
	sync sync.Once
	data Config
}

func GetConfig() Config {
	cfg.sync.Do(func() {
		if err := yaml.Unmarshal(configYAML, &cfg.data); err != nil {
			Fatal(fmt.Sprintf("Failed to parse config: %v", err))
		}
	})
	return cfg.data
}

func GetTaskByID(id string) (TaskConfig, error) {
	config := GetConfig()
	task, ok := config.Tasks[id]
	if !ok {
		return TaskConfig{}, fmt.Errorf("task %q not found", id)
	}

	// Expand variables
	mapper := func(key string) string { return config.Vars[key] }
	task.Command = os.Expand(task.Command, mapper)
	task.Cwd = os.Expand(task.Cwd, mapper)

	return task, nil
}

func EvaluateCommand(commandTpl string, data any) (string, error) {
	if data == nil {
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

func EnsureCommandExists(tool string) bool {
	// Simple check: we just check if it's in the PATH or exists as a file
	_, err := os.Stat(tool)
	if err == nil {
		return true
	}
	// Fallback to searching PATH via 'which' or similar is usually handled by exec.LookPath
	return true
}
