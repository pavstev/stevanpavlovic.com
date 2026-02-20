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

type TaskConfig struct {
	Name            string   `yaml:"name"`
	Type            string   `yaml:"type"` // "single" or "batch"
	PreMsg          string   `yaml:"pre_msg"`
	OnError         string   `yaml:"on_error"`
	Description     string   `yaml:"description"`
	Command         string   `yaml:"command,omitempty"`
	Tasks           []string `yaml:"tasks,omitempty"`
	Cwd             string   `yaml:"cwd,omitempty"`
	PreRun          []string `yaml:"pre_run,omitempty"`
	PostRun         []string `yaml:"post_run,omitempty"`
	Parallel        bool     `yaml:"parallel,omitempty"`
	Workers         int      `yaml:"workers,omitempty"`
	ContinueOnError bool     `yaml:"continue_on_error,omitempty"`
	Interactive     bool     `yaml:"interactive,omitempty"`
}

type BatchConfig = TaskConfig

type Config struct {
	Vars  map[string]string     `yaml:"vars"`
	Tasks map[string]TaskConfig `yaml:"tasks"`
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
	mapper := func(key string) string { return config.Vars[key] }
	task.Command = os.Expand(task.Command, mapper)
	task.Cwd = os.Expand(task.Cwd, mapper)
	return task, nil
}

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

func EnsureCommandExists(tool string) bool {
	_, err := exec.LookPath(tool)
	return err == nil
}
