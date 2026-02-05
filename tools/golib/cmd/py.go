package cmd

import (
	"fmt"
	"strings"

	"golib/pkg/cliutils"
	"golib/pkg/cmdutil"

	"github.com/spf13/cobra"
)

func init() {
	cmd := cmdutil.NewSimpleCommand("py", "Run the Python CLI (tools/pylib/main.py)", func(cmd *cobra.Command, args []string) {
		// Use the same uv project isolation pattern defined in your tasks.yaml
		baseCmd := "env -u VIRTUAL_ENV uv run --project tools/pylib python tools/pylib/main.py"

		// Append any extra arguments passed by the user
		fullCmd := baseCmd
		if len(args) > 0 {
			// Note: We don't do complex shell-escaping here because bash -c
			// combined with strings.Join handles standard flags gracefully.
			fullCmd = fmt.Sprintf("%s %s", baseCmd, strings.Join(args, " "))
		}

		// Use RunInteractive! This wires up os.Stdin/Stdout/Stderr directly
		// so Python can prompt for input and render rich CLI colors.
		cliutils.RunInteractive("Python CLI", fullCmd, ".")
	})

	// CRITICAL: This tells Cobra to stop intercepting flags!
	// If you run `pr py --help` or `pr py --verbose`, Cobra will ignore them
	// and pass them directly down to your Python script via `args`.
	cmd.DisableFlagParsing = true

	cmdutil.AddToRoot(cmd)
}
