package cli

import (
	"fmt"
	"os"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// ─── Design System (Mapped from OKLCH & HSL) ───────────────────────────────

var (
	// Primary: Vibrant Emerald oklch(0.6862 0.2146 140.0627)
	primaryColor = lipgloss.AdaptiveColor{Light: "#10b981", Dark: "#34d399"}
	// Slate Backgrounds from hsl(240 3.7% 15.9%)
	slateColor = lipgloss.AdaptiveColor{Light: "#1e293b", Dark: "#334155"}
	// Destructive: Rose oklch(0.5714 0.2121 27.2502)
	destructiveColor = lipgloss.AdaptiveColor{Light: "#e11d48", Dark: "#fb7185"}
	// Amber/Warning
	amberColor = lipgloss.AdaptiveColor{Light: "#d97706", Dark: "#fbbf24"}
	// Muted Foreground
	mutedColor = lipgloss.AdaptiveColor{Light: "#64748b", Dark: "#94a3b8"}

	// Typography & Layout Constants
	boldStyle   = lipgloss.NewStyle().Bold(true)
	subtleStyle = lipgloss.NewStyle().Foreground(mutedColor)

	// Badge Styles (The "Pill" UI Component)
	badgeBase = lipgloss.NewStyle().
			Bold(true).
			Padding(0, 1).
			Foreground(lipgloss.Color("#FFFFFF"))

	infoBadge    = badgeBase.Copy().Background(primaryColor)
	successBadge = badgeBase.Copy().Background(lipgloss.Color("#059669"))
	warningBadge = badgeBase.Copy().Background(amberColor)
	errorBadge   = badgeBase.Copy().Background(destructiveColor)

	// Spine Style (The vertical line box effect)
	spineStyle = lipgloss.NewStyle().
			Border(lipgloss.Border{Left: "┃"}).
			PaddingLeft(1).
			MarginLeft(1)

	// Box / Container Styles (The "Glass" effect)
	glassStyle = lipgloss.NewStyle().
			Border(lipgloss.ThickBorder()).
			BorderTop(false).
			BorderLeft(true).
			BorderRight(false).
			BorderBottom(false).
			BorderForeground(primaryColor).
			Padding(1, 2).
			Margin(1, 0)

	osExit = osExitFunc
	Quiet  = false

	// Exported Styles for high-level runner integration
	Primary = lipgloss.NewStyle().Foreground(primaryColor)
	Yellow  = lipgloss.NewStyle().Foreground(amberColor)
	Green   = lipgloss.NewStyle().Foreground(primaryColor)
	Red     = lipgloss.NewStyle().Foreground(destructiveColor)
	Bold    = lipgloss.NewStyle().Bold(true)
)

var osExitFunc = os.Exit

// ─── Core Logging Interface ──────────────────────────────────────────────────

// renderEntry creates the "Spine" layout for log messages
func renderEntry(badge lipgloss.Style, tag, msg string, color lipgloss.AdaptiveColor) {
	badgePart := badge.Render(tag)
	contentPart := spineStyle.Copy().BorderForeground(color).Render(msg)
	fmt.Printf("%s %s\n", badgePart, contentPart)
}

func Info(msg string) {
	renderEntry(infoBadge, "INFO", msg, primaryColor)
}

func Success(msg string) {
	renderEntry(successBadge, "DONE", msg, lipgloss.AdaptiveColor{Light: "#10b981", Dark: "#10b981"})
}

func Warning(msg string) {
	renderEntry(warningBadge, "WARN", msg, amberColor)
}

func Error(msg string) {
	if !Quiet {
		badgePart := errorBadge.Render("FAIL")
		contentPart := spineStyle.Copy().BorderForeground(destructiveColor).Render(msg)
		fmt.Fprintf(os.Stderr, "%s %s\n", badgePart, contentPart)
	}
}

func Fatal(msg string) {
	if !Quiet {
		Error(msg)
	}
	osExit(1)
}

// ─── Advanced UI Components ──────────────────────────────────────────────────

// CustomBox renders a high-contrast container with a "Glass-Border" accent
func CustomBox(title, content string, color lipgloss.AdaptiveColor) {
	if Quiet && (color != destructiveColor) {
		return
	}

	// The Title Badge
	titleLabel := lipgloss.NewStyle().
		Background(color).
		Foreground(lipgloss.Color("#FFFFFF")).
		Bold(true).
		Padding(0, 1).
		Render(strings.ToUpper(title))

	// The Inset Content (Glass effect)
	container := glassStyle.Copy().BorderForeground(color).Render(content)

	fmt.Println("\n" + lipgloss.JoinVertical(lipgloss.Left, titleLabel, container))
}

// BoxOutput provides a shim for existing runner implementations
func BoxOutput(title, content string, borderColor lipgloss.Color) {
	themeColor := primaryColor
	if borderColor == lipgloss.Color("1") {
		themeColor = destructiveColor
	} else if borderColor == lipgloss.Color("2") {
		themeColor = primaryColor
	}
	CustomBox(title, content, themeColor)
}
