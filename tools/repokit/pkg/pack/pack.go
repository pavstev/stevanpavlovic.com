package pack

import (
	"fmt"
	"go/build"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"repokit/pkg/cli"

	"github.com/atotto/clipboard"
	"github.com/princjef/gomarkdoc"
	"github.com/princjef/gomarkdoc/lang"
	"github.com/princjef/gomarkdoc/logger"
)

var slugifyRegexp = regexp.MustCompile(`[^a-z0-9]+`)

// Run executes the pack command to bundle Go package documentation into a Markdown file.
//
//nolint:nestif,gocyclo
func Run(targetDir string) {
	cwd, _ := os.Getwd()

	// Resolve target directory
	if targetDir == "" {
		targetDir = cwd
	} else {
		if !filepath.IsAbs(targetDir) {
			targetDir = filepath.Join(cwd, targetDir)
		}

		if info, err := os.Stat(targetDir); err != nil || !info.IsDir() {
			alt := filepath.Join(cwd, "tools", targetDir)
			if info, err := os.Stat(alt); err == nil && info.IsDir() {
				targetDir = alt
			} else {
				cli.Error("Directory not found: %s", targetDir)
				return
			}
		}
	}

	cli.Info("Generating Go documentation for: %s", targetDir)

	// Clean up old output files
	files, _ := filepath.Glob("pack_output_*.md")
	for _, f := range files {
		_ = os.Remove(f)
	}

	outRenderer, err := gomarkdoc.NewRenderer()
	if err != nil {
		cli.Fatal("Failed to create renderer: %v", err)
	}

	log := logger.New(logger.ErrorLevel)
	var md strings.Builder

	targetDirName := filepath.Base(targetDir)
	if targetDir == cwd {
		targetDirName = "current-directory"
	}
	md.WriteString(fmt.Sprintf("# 📦 Go API Documentation: `%s`\n\n", targetDirName))

	pkgCount := 0
	err = filepath.WalkDir(targetDir, func(path string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			return nil
		}

		name := d.Name()
		if name == "vendor" || name == ".git" || name == "node_modules" || name == "dist" {
			return filepath.SkipDir
		}

		buildPkg, err := build.ImportDir(path, build.ImportComment)
		if err != nil {
			// Skip directories that are not valid Go packages
			return nil //nolint:nilerr
		}

		pkg, err := lang.NewPackageFromBuild(log, buildPkg)
		if err != nil {
			return nil //nolint:nilerr
		}

		doc, err := outRenderer.Package(pkg)
		if err != nil {
			return nil //nolint:nilerr
		}

		md.WriteString(doc)
		md.WriteString("\n---\n\n")
		pkgCount++
		return nil
	})

	if err != nil {
		cli.Fatal("Failed to parse packages: %v", err)
	}

	outputFilename := fmt.Sprintf("pack_output_%s.md", slugifyStr(targetDirName))
	outputPath := filepath.Join(cwd, "tools", "repokit", "dist", outputFilename)

	err = os.WriteFile(outputPath, []byte(md.String()), 0644)
	if err != nil {
		cli.Error("Failed to write output: %v", err)
		return
	}

	_ = clipboard.WriteAll(md.String())

	cli.Success("Success! Documented %d Go packages.", pkgCount)
	cli.Info("Output saved to: %s", outputPath)
	cli.Info("Content copied to clipboard.")
}

func slugifyStr(s string) string {
	s = strings.ToLower(s)
	s = slugifyRegexp.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}
