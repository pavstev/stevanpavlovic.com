package cmd

import (
	"repokit/pkg/cli"

	"github.com/spf13/cobra"
)

var resumeCmd = &cobra.Command{
	Use:   "resume [export]",
	Short: "Resume commands",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		switch args[0] {
		case "export":
			cli.Step("Exporting resume...")
			cli.RunTask("resume_export", nil, map[string]bool{})
			cli.Success("Resume exported to resume.pdf")
		default:
			cli.Fatal("Unknown command: " + args[0])
		}
	},
}

func init() {
	rootCmd.AddCommand(resumeCmd)
}
