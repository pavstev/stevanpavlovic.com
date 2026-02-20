package cli

import (
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// ─── Theme Definitions (Mapped from Global CSS) ─────────────────────────────

var (
	// Adaptive Colors mapped from the CSS variables
	// Primary: oklch(0.6862 0.2146 140.0627) -> Vibrant Green
	primaryColor = lipgloss.AdaptiveColor{Light: "#10b981", Dark: "#34d399"}
	// Secondary/Accent: hsl(240 3.7% 15.9%) -> Deep Slate
	secondaryColor = lipgloss.AdaptiveColor{Light: "#1e293b", Dark: "#f8fafc"}
	// Destructive: oklch(0.5714 0.2121 27.2502) -> Rose/Red
	destructiveColor = lipgloss.AdaptiveColor{Light: "#e11d48", Dark: "#fb7185"}
	// Muted: hsl(240 5% 64.9%) -> Slate Grey
	mutedColor = lipgloss.AdaptiveColor{Light: "#64748b", Dark: "#94a3b8"}

	// Label Styles (Shadcn-like Badge system)
	labelStyle = lipgloss.NewStyle().
			Bold(true).
			Padding(0, 1).
			Foreground(lipgloss.Color("#FFFFFF"))

	infoLabel    = labelStyle.Copy().Background(primaryColor)
	successLabel = labelStyle.Copy().Background(lipgloss.Color("#10b981")) // Secondary Green
	warningLabel = labelStyle.Copy().Background(lipgloss.Color("#f59e0b")) // Amber Accent
	errorLabel   = labelStyle.Copy().Background(destructiveColor)

	// Typography Styles
	boldStyle   = lipgloss.NewStyle().Bold(true)
	subtleStyle = lipgloss.NewStyle().Foreground(mutedColor)

	// Step Header
	stepHeaderStyle = lipgloss.NewStyle().
			Foreground(primaryColor).
			Bold(true).
			MarginTop(1)

	// Box Styling (Simulating .glass and .shadow-glow)
	boxBorderStyle = lipgloss.NewStyle().
			Border(lipgloss.DoubleBorder()).
			BorderForeground(primaryColor).
			Padding(0, 2)

	// Subtle Log Entry "Box" Effect
	// This creates a left-border accent for every log message
	logEntryStyle = lipgloss.NewStyle().
			Border(lipgloss.Border{Left: "▎"}).
			PaddingLeft(1)

	osExit = osExitFunc
	Quiet  = false

	// Exported styles for package-wide use
	Primary = lipgloss.NewStyle().Foreground(primaryColor)
	Yellow  = lipgloss.NewStyle().Foreground(lipgloss.Color("#f59e0b"))
	Green   = lipgloss.NewStyle().Foreground(primaryColor)
	Red     = lipgloss.NewStyle().Foreground(destructiveColor)
	Bold    = lipgloss.NewStyle().Bold(true)
)

// Wrapper to allow mocking for tests
var osExitFunc = os.Exit

// ─── Enhanced Logging ────────────────────────────────────────────────────────

// renderLog applies the subtle box/border effect to a log line
func renderLog(label lipgloss.Style, tag string, msg string, color lipgloss.AdaptiveColor) {
	badge := label.Render(tag)
	content := logEntryStyle.Copy().BorderForeground(color).Render(msg)
	fmt.Printf("%s %s\n", badge, content)
}

// Info prints a message with a high-contrast informational badge.
func Info(msg string) {
	renderLog(infoLabel, "INFO", msg, primaryColor)
}

// Success prints a message with a "DONE" badge using the primary theme green.
func Success(msg string) {
	renderLog(successLabel, "DONE", msg, lipgloss.AdaptiveColor{Light: "#10b981", Dark: "#10b981"})
}

// Warning prints a message with an Amber warning badge.
func Warning(msg string) {
	renderLog(warningLabel, "WARN", msg, lipgloss.AdaptiveColor{Light: "#f59e0b", Dark: "#f59e0b"})
}

// Error prints a message with the destructive red badge to stderr.
func Error(msg string) {
	if !Quiet {
		badge := errorLabel.Render("FAIL")
		content := logEntryStyle.Copy().BorderForeground(destructiveColor).Render(msg)
		fmt.Fprintf(os.Stderr, "%s %s\n", badge, content)
	}
}

// Step prints a major section header.
func Step(msg string) {
	headerText := "▶ " + strings.ToUpper(msg)

	// Subtle separator line
	separator := lipgloss.NewStyle().
		Foreground(mutedColor).
		Faint(true).
		Render(strings.Repeat("━", lipgloss.Width(headerText)+2))

	fmt.Println(lipgloss.JoinVertical(
		lipgloss.Left,
		stepHeaderStyle.Render(headerText),
		separator,
	))
}

// Fatal prints an error and terminates execution.
func Fatal(msg string) {
	if !Quiet {
		Error(msg)
	}
	osExit(1)
}

// ─── Advanced Box Logic ─────────────────────────────────────────────────────

// CustomBox renders content inside a container that mimics the "Glass" UI utility.
func CustomBox(title, content string, color lipgloss.AdaptiveColor) {
	if Quiet && (color != destructiveColor) {
		return
	}

	// Prepare the border style with the theme color
	style := boxBorderStyle.Copy().BorderForeground(color)

	// Create a title that sits "inset" on the border line
	titleInner := lipgloss.NewStyle().
		Background(color).
		Foreground(lipgloss.Color("#FFFFFF")).
		Bold(true).
		Padding(0, 2).
		Render(strings.ToUpper(title))

	// Stack using Vertical Join
	fmt.Println("\n" + lipgloss.JoinVertical(
		lipgloss.Left,
		titleInner,
		style.Render(content),
	))
}

// BoxOutput provides a simplified wrapper compatible with legacy calls.
func BoxOutput(title, content string, borderColor lipgloss.Color) {
	themeColor := primaryColor
	// Map numeric colors to the new design system
	if borderColor == lipgloss.Color("1") {
		themeColor = destructiveColor
	} else if borderColor == lipgloss.Color("2") {
		themeColor = primaryColor
	}
	CustomBox(title, content, themeColor)
}
