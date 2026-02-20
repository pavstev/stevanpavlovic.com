package commands

import (
	"repokit/pkg/core"
	"repokit/pkg/svg"

	"github.com/spf13/cobra"
)

var (
	osLLMConfig *LLMConfig
	schemaOut   string
)

// RegisterCommands adds all available commands to the provided root command.
func RegisterCommands(rootCmd *cobra.Command) {
	// 1. Pack Command
	var packCmd = &cobra.Command{
		Use:   "pack [dir]",
		Short: "Bundle Go package documentation into a Markdown file",
		Args:  cobra.MaximumNArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			target := ""
			if len(args) > 0 {
				target = args[0]
			}
			RunPack(target)
		},
	}
	rootCmd.AddCommand(packCmd)

	// 2. Clean Command
	var cleanCmd = &cobra.Command{
		Use:   "clean",
		Short: "Removes untracked files from the repository",
		Run: func(cmd *cobra.Command, args []string) {
			RunClean(false) // Default to safe mode; --force logic can be added if needed
		},
	}
	rootCmd.AddCommand(cleanCmd)

	// 3. Optimize SVG Command
	var optimizeSvgCmd = &cobra.Command{
		Use:   "optimize-svg <pattern>",
		Short: "Optimize SVG files using native minifier and LLM analysis",
		Args:  cobra.ExactArgs(1),
		Run: func(cmd *cobra.Command, args []string) {
			p, _ := NewProvider(osLLMConfig)
			svg.SetLLMConfig(osLLMConfig, p)
			svg.Optimize(args[0])
		},
	}
	osLLMConfig = AddLLMFlags(optimizeSvgCmd, "")
	rootCmd.AddCommand(optimizeSvgCmd)

	// 4. Export Schema Command
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
	exportSchemaCmd.Flags().StringVarP(&schemaOut, "out", "o", "tools/eslint/schemas/tasks.schema.json", "Output file path")
	rootCmd.AddCommand(exportSchemaCmd)

	// 5. Generate README Command
	var readmeCmd = &cobra.Command{
		Use:   "generate-readme",
		Short: "AI-powered README generation for your codebase",
		Run: func(cmd *cobra.Command, args []string) {
			RunGenerateReadme(cmd.Context(), osLLMConfig)
		},
	}
	AddLLMFlags(readmeCmd, "README.md")
	rootCmd.AddCommand(readmeCmd)

	// 6. Auto Commit Command
	var commitCmd = &cobra.Command{
		Use:   "auto-commit",
		Short: "AI-assisted automatic commit message generation",
		Run: func(cmd *cobra.Command, args []string) {
			RunAutocommit(cmd.Context(), osLLMConfig)
		},
	}
	AddLLMFlags(commitCmd, "")
	rootCmd.AddCommand(commitCmd)
}
