package core

import (
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

// LoadClosestEnv searches upwards from the current working directory for a .env or .env.local file
// and loads the first one it finds.
func LoadClosestEnv() {
	curr, err := os.Getwd()
	if err != nil {
		return
	}

	for {
		// Try .env.local first
		localPath := filepath.Join(curr, ".env.local")
		if _, err := os.Stat(localPath); err == nil {
			_ = godotenv.Load(localPath)
			return
		}

		// Try .env second
		envPath := filepath.Join(curr, ".env")
		if _, err := os.Stat(envPath); err == nil {
			_ = godotenv.Load(envPath)
			return
		}

		// Move up
		parent := filepath.Dir(curr)
		if parent == curr {
			break
		}
		curr = parent
	}
}
