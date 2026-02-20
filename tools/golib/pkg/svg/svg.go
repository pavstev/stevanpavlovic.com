package svg

import (
	"encoding/json"
	"fmt"
	"os/exec"
	"path/filepath"
	"sync"
)

type Result struct {
	File    string `json:"file"`
	Path    string `json:"path"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

type Summary struct {
	Total   int `json:"total"`
	Success int `json:"success"`
	Failed  int `json:"failed"`
}

type Output struct {
	Summary Summary  `json:"summary"`
	Results []Result `json:"results"`
}

func Optimize(pattern string) error {
	files, err := filepath.Glob(pattern)
	if err != nil {
		return err
	}

	var wg sync.WaitGroup
	results := make([]Result, len(files))

	// Process files in parallel
	for i, f := range files {
		wg.Add(1)
		go func(idx int, path string) {
			defer wg.Done()

			cmd := exec.Command("pnpm", "exec", "svgo", path)
			out, err := cmd.CombinedOutput()

			res := Result{
				File:    filepath.Base(path),
				Path:    path,
				Success: err == nil,
			}
			if err != nil {
				res.Error = string(out)
			}
			results[idx] = res
		}(i, f)
	}

	wg.Wait()

	// Calculate summary
	var success, failed int
	for _, r := range results {
		if r.Success {
			success++
		} else {
			failed++
		}
	}

	output := Output{
		Summary: Summary{Total: len(files), Success: success, Failed: failed},
		Results: results,
	}

	// Print JSON to stdout
	jsonOut, _ := json.MarshalIndent(output, "", "  ")
	fmt.Println(string(jsonOut))

	if failed > 0 {
		return fmt.Errorf("failed to optimize %d files", failed)
	}
	return nil
}
