package cmd

import (
	"repokit/pkg/cliutils"

	"github.com/spf13/cobra"
)

var resumeCmd = &cobra.Command{
	Use:   "resume [export]",
	Short: "Resume commands",
	Args:  cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		switch args[0] {
		case "export":
			cliutils.Step("Exporting resume...")
			cliutils.RunStepByID("resume_export", nil)
			cliutils.Success("Resume exported to resume.pdf")
		default:
			cliutils.Fatal("Unknown command: " + args[0])
		}
	},
}

func init() {
	rootCmd.AddCommand(resumeCmd)
}
