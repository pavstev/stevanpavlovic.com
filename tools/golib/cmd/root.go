package cmd

import (
	"fmt"
	"os"

	"golib/pkg/cliutils"
	"golib/pkg/cmdutil"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "golib",
	Short: "A brief description of your Go library",
	Long: `A longer description of your Go library,
	which can span multiple lines.`,
	Run: func(cmd *cobra.Command, args []string) {
		// Do Stuff Here
		fmt.Println("Hello from golib!")
	},
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		if !cliutils.Quiet {
			fmt.Fprintf(os.Stderr, "Whoops. There was an error while executing your CLI '%s'", err)
		}
		os.Exit(1)
	}
}

func init() {
	rootCmd.PersistentFlags().BoolVarP(&cliutils.Quiet, "quiet", "q", false, "suppress error output")
	cmdutil.SetRootCommand(rootCmd)
}
