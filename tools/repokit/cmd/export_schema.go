package cmd

import (
	"repokit/pkg/core"

	"github.com/spf13/cobra"
)

var schemaOut string

var exportSchemaCmd = &cobra.Command{
	Use:   "export_schema",
	Short: "Generate JSON schema for tasks.yaml configuration",
	Run: func(cmd *cobra.Command, args []string) {
		err := core.Export("tasks", schemaOut)
		if err != nil {
			core.Fatal("Failed to export schema: %v", err)
		}
		core.Success("Successfully generated JSON schema at %s", schemaOut)
	},
}

func init() {
	// Relative defaults mapping smoothly to execution paths
	exportSchemaCmd.Flags().StringVarP(&schemaOut, "out", "o", "tools/eslint/schemas/tasks.schema.json", "Output file path")
	rootCmd.AddCommand(exportSchemaCmd)
}
