package cmd

import (
	"encoding/json"
	"fmt"
	"os"

	"repokit/pkg/cli"

	"github.com/spf13/cobra"
	"github.com/swaggest/jsonschema-go"
)

var schemaOut string

var schemaCmd = &cobra.Command{
	Use:   "schema",
	Short: "Generate JSON schema for tasks.yaml configuration",
	Run: func(cmd *cobra.Command, args []string) {
		reflector := jsonschema.Reflector{}

		// Intercept property reflection as a Reflect option to enforce strict patternProperties
		schema, err := reflector.Reflect(cli.Config{}, jsonschema.InterceptProp(func(params jsonschema.InterceptPropParams) error {
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
			cli.Fatal(fmt.Sprintf("Failed to reflect schema: %v", err))
		}

		schemaDraft := "http://json-schema.org/draft-07/schema#"
		title := "Repokit Task Configuration"
		description := "Unified Configuration schema for Repokit task runner."

		schema.Schema = &schemaDraft
		schema.Title = &title
		schema.Description = &description

		j, err := json.MarshalIndent(schema, "", "  ")
		if err != nil {
			cli.Fatal(fmt.Sprintf("Failed to marshal schema: %v", err))
		}

		if schemaOut == "" {
			fmt.Println(string(j))
			return
		}

		err = os.WriteFile(schemaOut, j, 0644)
		if err != nil {
			cli.Fatal(fmt.Sprintf("Failed to write schema file: %v", err))
		}
		cli.Success(fmt.Sprintf("Successfully generated JSON schema at %s", schemaOut))
	},
}

func init() {
	// Relative defaults mapping smoothly to execution paths
	schemaCmd.Flags().StringVarP(&schemaOut, "out", "o", "tools/eslint/schemas/tasks.schema.json", "Output file path")
	rootCmd.AddCommand(schemaCmd)
}
