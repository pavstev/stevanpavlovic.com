package cmd

import (
	"repokit/pkg/cli"
	"repokit/pkg/schema"

	"github.com/spf13/cobra"
)

var schemaOut string

var schemaCmd = &cobra.Command{
	Use:   "export_schema",
	Short: "Generate JSON schema for tasks.yaml configuration",
	Run: func(cmd *cobra.Command, args []string) {
		err := schema.Export("tasks", schemaOut)
		if err != nil {
			cli.Fatal("Failed to export schema: %v", err)
		}
		cli.Success("Successfully generated JSON schema at %s", schemaOut)
	},
}

func init() {
	// Relative defaults mapping smoothly to execution paths
	schemaCmd.Flags().StringVarP(&schemaOut, "out", "o", "tools/eslint/schemas/tasks.schema.json", "Output file path")
	rootCmd.AddCommand(schemaCmd)
}
