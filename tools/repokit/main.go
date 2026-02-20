package main

import (
	"os"
	"path/filepath"
	"repokit/cmd"
)

func main() {
	// Auto-correct CWD if run from inside tools/repokit
	if cwd, err := os.Getwd(); err == nil {
		if filepath.Base(cwd) == "repokit" {
			_ = os.Chdir("../..")
		}
	}
	cmd.Execute()
}
