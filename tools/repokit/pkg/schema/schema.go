package schema

import (
	"encoding/json"
	"fmt"
	"os"

	"repokit/pkg/config"

	"github.com/swaggest/jsonschema-go"
)

// Exporter defines a function capable of generating a schema to a path.
type Exporter func(outPath string) error

// Registry maps schema names to their generator functions.
var Registry = map[string]Exporter{
	"tasks": exportTasksSchema,
}

// exportTasksSchema generates the tasks.yaml configuration schema.
func exportTasksSchema(outPath string) error {
	reflector := jsonschema.Reflector{}

	// Intercept property reflection as a Reflect option to enforce strict patternProperties
	schema, err := reflector.Reflect(config.Config{}, jsonschema.InterceptProp(func(params jsonschema.InterceptPropParams) error {
		if params.Name == "tasks" && params.PropertySchema != nil {
			if params.PropertySchema.AdditionalProperties != nil {
				params.PropertySchema.PatternProperties = map[string]jsonschema.SchemaOrBool{
					"^[a-z0-9_\\-]+$": *params.PropertySchema.AdditionalProperties,
				}
				// Disable any random keys that don't match the regex pattern
				f := false
				params.PropertySchema.AdditionalProperties = &jsonschema.SchemaOrBool{TypeBoolean: &f}
			}
		}
		return nil
	}))

	if err != nil {
		return fmt.Errorf("failed to reflect schema: %w", err)
	}

	schemaDraft := "http://json-schema.org/draft-07/schema#"
	title := "Repokit Task Configuration"
	description := "Unified Configuration schema for Repokit task runner."

	schema.Schema = &schemaDraft
	schema.Title = &title
	schema.Description = &description

	j, err := json.MarshalIndent(schema, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal schema: %w", err)
	}

	if outPath == "" {
		fmt.Println(string(j))
		return nil
	}

	err = os.WriteFile(outPath, j, 0644)
	if err != nil {
		return fmt.Errorf("failed to write schema file: %w", err)
	}
	return nil
}

// Export runs a registered schema export routine.
func Export(name, outPath string) error {
	exporter, ok := Registry[name]
	if !ok {
		return fmt.Errorf("schema %q not found in registry", name)
	}
	return exporter(outPath)
}
