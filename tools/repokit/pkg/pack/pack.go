package pack

import (
	"fmt"
	"go/build"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"repokit/pkg/log"

	"github.com/atotto/clipboard"
	"github.com/princjef/gomarkdoc"
	"github.com/princjef/gomarkdoc/lang"
	"github.com/princjef/gomarkdoc/logger"
)

var slugifyRegexp = regexp.MustCompile(`[^a-z0-9]+`)

// Run executes the pack command to bundle Go package documentation into a Markdown file.
func Run(targetDir string) {
	cwd, targetDir, targetDirName := resolveTargetDir(targetDir)
	if targetDir == "" {
		return // error already logged
	}

	log.Info("Generating Go documentation for: %s", targetDir)

	cleanOldOutputs("pack_output_*.md")

	docContent, pkgCount, err := buildDocumentation(targetDir, targetDirName)
	if err != nil {
		log.Fatal("Failed to parse packages: %v", err)
	}

	outputFilename := fmt.Sprintf("pack_output_%s.md", slugifyStr(targetDirName))
	outputPath := filepath.Join(cwd, "tools", "repokit", "dist", outputFilename)

	writeOutput(outputPath, docContent)

	log.Success("Success! Documented %d Go packages.", pkgCount)
	log.Info("Output saved to: %s", outputPath)
	log.Info("Content copied to clipboard.")
}

func resolveTargetDir(targetDir string) (string, string, string) {
	cwd, _ := os.Getwd()

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
				log.Error("Directory not found: %s", targetDir)
				return cwd, "", ""
			}
		}
	}

	targetDirName := filepath.Base(targetDir)
	if targetDir == cwd {
		targetDirName = "current-directory"
	}

	return cwd, targetDir, targetDirName
}

func cleanOldOutputs(pattern string) {
	files, _ := filepath.Glob(pattern)
	for _, f := range files {
		_ = os.Remove(f)
	}
}

func buildDocumentation(targetDir, targetDirName string) (string, int, error) {
	outRenderer, err := gomarkdoc.NewRenderer()
	if err != nil {
		return "", 0, fmt.Errorf("failed to create renderer: %w", err)
	}

	mdLog := logger.New(logger.ErrorLevel)
	var md strings.Builder

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

		pkg, err := lang.NewPackageFromBuild(mdLog, buildPkg)
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

	return md.String(), pkgCount, err
}

func writeOutput(outputPath, content string) {
	err := os.WriteFile(outputPath, []byte(content), 0644)
	if err != nil {
		log.Error("Failed to write output: %v", err)
		return
	}
	_ = clipboard.WriteAll(content)
}

func slugifyStr(s string) string {
	s = strings.ToLower(s)
	s = slugifyRegexp.ReplaceAllString(s, "-")
	return strings.Trim(s, "-")
}

