package core

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

// TaskConfig defines the configuration for a single or batch task.
// It is used by both the YAML parser and the JSON Schema generator.
type TaskConfig struct {
	_               struct{} `additionalProperties:"false"`
	Name            string   `yaml:"name" json:"name" required:"true" description:"Human-readable name of the task."`
	Type            string   `yaml:"type" json:"type" required:"true" enum:"single,batch,sequential" description:"Single command, parallel batch, or sequential pipeline."`
	PreMsg          string   `yaml:"pre_msg" json:"pre_msg" required:"true" description:"Status message shown before execution starts."`
	OnError         string   `yaml:"on_error" json:"on_error" required:"true" description:"Message shown if the task fails."`
	Description     string   `yaml:"description,omitempty" json:"description,omitempty" description:"Optional detailed description of the task."`
	Command         string   `yaml:"command,omitempty" json:"command,omitempty" description:"Required if type is 'single'."`
	Tasks           []string `yaml:"tasks,omitempty" json:"tasks,omitempty" description:"Required if type is 'batch' or 'sequential'."`
	Cwd             string   `yaml:"cwd,omitempty" json:"cwd,omitempty" description:"Working directory for the command."`
	PreRun          []string `yaml:"pre_run,omitempty" json:"pre_run,omitempty" description:"Tasks to run before this one."`
	PostRun         []string `yaml:"post_run,omitempty" json:"post_run,omitempty" description:"Tasks to run after this one."`
	Parallel        bool     `yaml:"parallel,omitempty" json:"parallel,omitempty" default:"false" description:"Run child tasks in parallel."`
	Workers         int      `yaml:"workers,omitempty" json:"workers,omitempty" default:"3" description:"Number of parallel workers."`
	ContinueOnError bool     `yaml:"continue_on_error,omitempty" json:"continue_on_error,omitempty" default:"false" description:"Continue execution even if child tasks fail."`
	Interactive     bool     `yaml:"interactive,omitempty" json:"interactive,omitempty" default:"false" description:"Run in interactive mode (attaches stdin/stdout)."`
}

type BatchConfig = TaskConfig

type Config struct {
	_     struct{}              `additionalProperties:"false"`
	Vars  map[string]string     `yaml:"vars" json:"vars" description:"Global variables for command and path interpolation."`
	Tasks map[string]TaskConfig `yaml:"tasks" json:"tasks" required:"true" description:"Task definitions (Atomic or Pipeline)."`
}

func (c *Config) Validate() error {
	var NativeCommands = map[string]bool{
		"export_schema": true,
		"pack":          true,
		"optimize-svg":  true,
		"help":          true,
	}

	for name := range c.Tasks {
		task := c.Tasks[name]
		// Validating batch/sequential task dependencies
		if task.Type == "batch" || task.Type == "sequential" {
			for _, subTask := range task.Tasks {
				if _, ok := c.Tasks[subTask]; !ok && !NativeCommands[subTask] {
					return fmt.Errorf("task %q depends on non-existent task %q", name, subTask)
				}
			}
		}

		// Validating hook dependencies
		for _, hook := range task.PreRun {
			if _, ok := c.Tasks[hook]; !ok && !NativeCommands[hook] {
				return fmt.Errorf("task %q has non-existent pre_run hook %q", name, hook)
			}
		}
		for _, hook := range task.PostRun {
			if _, ok := c.Tasks[hook]; !ok && !NativeCommands[hook] {
				return fmt.Errorf("task %q has non-existent post_run hook %q", name, hook)
			}
		}
	}
	return nil
}

var cfg struct {
	sync sync.Once
	data Config
	err  error
}

func GetConfig() (Config, error) {
	cfg.sync.Do(func() {
		if err := yaml.Unmarshal(configYAML, &cfg.data); err != nil {
			cfg.err = fmt.Errorf("failed to parse config: %w", err)
			return
		}
		if err := cfg.data.Validate(); err != nil {
			cfg.err = fmt.Errorf("config validation failed: %w", err)
		}
	})
	return cfg.data, cfg.err
}

func GetTaskByID(id string) (TaskConfig, error) {
	config, err := GetConfig()
	if err != nil {
		return TaskConfig{}, err
	}
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
