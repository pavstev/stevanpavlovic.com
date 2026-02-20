package cli

import (
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// ─── Theme Definitions ───────────────────────────────────────────────────────

var (
	// Adaptive Colors for light/dark terminal support
	primaryColor   = lipgloss.AdaptiveColor{Light: "#7D56F4", Dark: "#9d86e9"}
	secondaryColor = lipgloss.AdaptiveColor{Light: "#04B575", Dark: "#06d6a0"}
	accentColor    = lipgloss.AdaptiveColor{Light: "#EE6C4D", Dark: "#f38d76"}
	mutedColor     = lipgloss.AdaptiveColor{Light: "#9B9B9B", Dark: "#626262"}

	// Label Styles for Status Badges
	labelStyle = lipgloss.NewStyle().
			Bold(true).
			Padding(0, 1).
			MarginRight(1).
			Foreground(lipgloss.Color("#FFFFFF"))

	infoLabel    = labelStyle.Copy().Background(primaryColor)
	successLabel = labelStyle.Copy().Background(secondaryColor)
	warningLabel = labelStyle.Copy().Background(accentColor)
	errorLabel   = labelStyle.Copy().Background(lipgloss.Color("#FF5555"))

	// Typography & Layout Styles
	boldStyle   = lipgloss.NewStyle().Bold(true)
	subtleStyle = lipgloss.NewStyle().Foreground(mutedColor)

	stepHeaderStyle = lipgloss.NewStyle().
			Foreground(primaryColor).
			Bold(true).
			MarginTop(1).
			MarginBottom(0)

	// Box Styling
	boxBorderStyle = lipgloss.NewStyle().
			Border(lipgloss.RoundedBorder()).
			BorderForeground(primaryColor).
			Padding(0, 2)

	osExit = os.Exit
	Quiet  = false

	// Exported styles for package-wide use
	Primary = lipgloss.NewStyle().Foreground(primaryColor)
	Yellow  = lipgloss.NewStyle().Foreground(accentColor)
	Green   = lipgloss.NewStyle().Foreground(secondaryColor)
	Red     = lipgloss.NewStyle().Foreground(lipgloss.Color("#FF5555"))
	Bold    = lipgloss.NewStyle().Bold(true)
)

// ─── Enhanced Logging ────────────────────────────────────────────────────────

// Info prints a message with an informational badge.
func Info(msg string) {
	fmt.Printf("%s %s\n", infoLabel.Render("INFO"), msg)
}

// Success prints a message with a completion badge.
func Success(msg string) {
	fmt.Printf("%s %s\n", successLabel.Render("DONE"), msg)
}

// Warning prints a message with a caution badge.
func Warning(msg string) {
	fmt.Printf("%s %s\n", warningLabel.Render("WARN"), msg)
}

// Error prints a message with a failure badge to stderr.
func Error(msg string) {
	if !Quiet {
		fmt.Fprintf(os.Stderr, "%s %s\n", errorLabel.Render("FAIL"), msg)
	}
}

// Step prints a major section header with a visual separator.
func Step(msg string) {
	headerText := "▶ " + strings.ToUpper(msg)
	separator := subtleStyle.Render(strings.Repeat("─", lipgloss.Width(headerText)+4))

	fmt.Println(lipgloss.JoinVertical(
		lipgloss.Left,
		stepHeaderStyle.Render(headerText),
		separator,
	))
}

// Fatal prints an error and exits the program.
func Fatal(msg string) {
	if !Quiet {
		Error(msg)
	}
	osExit(1)
}

// ─── Advanced Box Logic (Merged from box.go) ───────────────────────────────

// CustomBox renders content inside a styled container with a title and theme color.
func CustomBox(title, content string, color lipgloss.AdaptiveColor) {
	if Quiet && (color != accentColor && color != lipgloss.AdaptiveColor{Light: "#FF5555", Dark: "#FF5555"}) {
		return
	}

	// Prepare the border style
	style := boxBorderStyle.Copy().BorderForeground(color)

	// Create a title that "sits" on top of the border
	titleInner := lipgloss.NewStyle().
		Background(color).
		Foreground(lipgloss.Color("#FFFFFF")).
		Bold(true).
		Padding(0, 1).
		Render(" " + strings.ToUpper(title) + " ")

	// Render the main content
	renderedContent := style.Render(content)

	// Stack them using Vertical Join
	fmt.Println("\n" + lipgloss.JoinVertical(lipgloss.Left, titleInner, renderedContent))
}

// BoxOutput provides a simplified wrapper compatible with existing runner logic.
func BoxOutput(title, content string, borderColor lipgloss.Color) {
	themeColor := primaryColor
	if borderColor == lipgloss.Color("1") {
		themeColor = lipgloss.AdaptiveColor{Light: "#FF5555", Dark: "#FF5555"}
	} else if borderColor == lipgloss.Color("2") {
		themeColor = secondaryColor
	}
	CustomBox(title, content, themeColor)
}
