package main

import (
	"golib/cmd"
	"os"
	"path/filepath"
)

func main() {
	if cwd, err := os.Getwd(); err == nil {
		if filepath.Base(cwd) == "golib" {
			_ = os.Chdir("..")
		}
	}
	cmd.Execute()
}
