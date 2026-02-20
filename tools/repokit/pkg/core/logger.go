// Package cli provides the command-line interface, task runner, and UI logging utilities.
package core

import (
	"fmt"
	"os"
	"strings"
	"sync"

	"github.com/charmbracelet/lipgloss"
	"golang.org/x/term"
)

// ─── Design System (Mapped from OKLCH & HSL) ───────────────────────────────

var (
	// Primary: Vibrant Emerald oklch(0.6862 0.2146 140.0627).
	primaryColor = lipgloss.AdaptiveColor{Light: "#10b981", Dark: "#34d399"}
	// Destructive: Rose oklch(0.5714 0.2121 27.2502).
	destructiveColor = lipgloss.AdaptiveColor{Light: "#e11d48", Dark: "#fb7185"}
	// Amber/Warning.
	amberColor = lipgloss.AdaptiveColor{Light: "#d97706", Dark: "#fbbf24"}
	// Muted Foreground.
	mutedColor = lipgloss.AdaptiveColor{Light: "#64748b", Dark: "#94a3b8"}

	BlueColor = lipgloss.AdaptiveColor{Light: "#3b82f6", Dark: "#60a5fa"}
	cyanColor = lipgloss.AdaptiveColor{Light: "#06b6d4", Dark: "#22d3ee"}

	// Typography & Layout Constants.

	// Badge Styles (The "Pill" UI Component).
	badgeBase = lipgloss.NewStyle().
			Bold(true).
			Padding(0, 1).
			Foreground(lipgloss.Color("#FFFFFF"))

	infoBadge    = badgeBase.Background(primaryColor)
	successBadge = badgeBase.Background(lipgloss.Color("#059669"))
	warningBadge = badgeBase.Background(amberColor)
	errorBadge   = badgeBase.Background(destructiveColor)

	// Spine Style (The vertical line box effect).
	spineStyle = lipgloss.NewStyle().
			Border(lipgloss.Border{Left: "┃"}).
			PaddingLeft(1).
			MarginLeft(1)

	OSExit = osExitFunc
	Quiet  = false

	// TUI Mode variables
	TuiMode   = false
	TuiBuffer []string
	tuiMu     sync.Mutex

	// Exported Styles for high-level runner integration.
	Primary = lipgloss.NewStyle().Foreground(primaryColor)
	Yellow  = lipgloss.NewStyle().Foreground(amberColor)
	Green   = lipgloss.NewStyle().Foreground(primaryColor)
	Red     = lipgloss.NewStyle().Foreground(destructiveColor)
	Blue    = lipgloss.NewStyle().Foreground(BlueColor)
	Cyan    = lipgloss.NewStyle().Foreground(cyanColor)
	Subtle  = lipgloss.NewStyle().Foreground(mutedColor)
	Bold    = lipgloss.NewStyle().Bold(true)

	// Professional subtle UI Icons
	IconInfo      = "·"
	IconSuccess   = "✓"
	IconWarning   = "!"
	IconError     = "✕"
	IconPending   = "⟳"
	IconCancelled = "−"
)

var Spinners = []string{"⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"}

var osExitFunc = os.Exit

// ─── Core Logging Interface ──────────────────────────────────────────────────

// renderEntry creates the "Spine" layout for log messages.
func renderEntry(badge lipgloss.Style, tag, msg string, color lipgloss.AdaptiveColor) {
	badgePart := badge.Render(tag)
	contentPart := spineStyle.BorderForeground(color).Render(msg)

	formatted := fmt.Sprintf("%s %s", badgePart, contentPart)

	if TuiMode {
		tuiMu.Lock()
		TuiBuffer = append(TuiBuffer, formatted)
		tuiMu.Unlock()
	} else {
		fmt.Println(formatted)
	}
}

// GetLogLines returns a copy of the current buffered log lines and clears the buffer.
func GetLogLines() []string {
	tuiMu.Lock()
	defer tuiMu.Unlock()
	lines := make([]string, len(TuiBuffer))
	copy(lines, TuiBuffer)
	TuiBuffer = nil
	return lines
}

func Info(format string, args ...any) {
	msg := format
	if len(args) > 0 {
		msg = fmt.Sprintf(format, args...)
	}
	renderEntry(infoBadge, IconInfo, msg, primaryColor)
}

func Success(format string, args ...any) {
	msg := format
	if len(args) > 0 {
		msg = fmt.Sprintf(format, args...)
	}
	renderEntry(successBadge, IconSuccess, msg, primaryColor)
}

func Step(format string, args ...any) {
	msg := format
	if len(args) > 0 {
		msg = fmt.Sprintf(format, args...)
	}
	renderEntry(infoBadge, "STEP", msg, cyanColor)
}

func Warning(format string, args ...any) {
	msg := format
	if len(args) > 0 {
		msg = fmt.Sprintf(format, args...)
	}
	renderEntry(warningBadge, IconWarning, msg, amberColor)
}

func Error(format string, args ...any) {
	if Quiet {
		return
	}
	msg := format
	if len(args) > 0 {
		msg = fmt.Sprintf(format, args...)
	}
	badgePart := errorBadge.Render(IconError)
	contentPart := spineStyle.BorderForeground(destructiveColor).Render(msg)

	formatted := fmt.Sprintf("%s %s", badgePart, contentPart)

	if TuiMode {
		tuiMu.Lock()
		TuiBuffer = append(TuiBuffer, formatted)
		tuiMu.Unlock()
	} else {
		fmt.Fprintln(os.Stderr, formatted)
	}
}

func Fatal(format string, args ...any) {
	Error(format, args...)
	OSExit(1)
}

// ─── Advanced UI Components ──────────────────────────────────────────────────

// CustomBox renders a high-contrast container with a rounded border and title.
func CustomBox(title, content string, color lipgloss.AdaptiveColor) {
	if Quiet && (color != destructiveColor) {
		return
	}

	termWidth, _, err := term.GetSize(int(os.Stdout.Fd()))
	isTTY := err == nil

	// Styles
	// Outer container
	outerBoxStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder(), true).
		BorderForeground(color).
		Padding(1).
		Margin(1, 0)

	// Title
	titleStyle := lipgloss.NewStyle().
		Background(color).
		Foreground(lipgloss.Color("#FFFFFF")).
		Padding(0, 1).
		Bold(true)

	// Content
	contentStyle := lipgloss.NewStyle().
		MarginTop(1)

	var titleStr, contentStr string

	contentWidth := lipgloss.Width(content)
	titleText := strings.ToUpper(title)
	titleLen := lipgloss.Width(titleText) + 2

	if isTTY {
		maxWidth := termWidth - outerBoxStyle.GetHorizontalFrameSize()
		if contentWidth < maxWidth {
			maxWidth = contentWidth
		}
		if maxWidth < titleLen {
			maxWidth = titleLen
		}
		titleStr = titleStyle.Width(maxWidth).Align(lipgloss.Center).Render(titleText)
		contentStr = contentStyle.Width(maxWidth).Render(content)
	} else {
		// Non-TTY: flow naturally, don't force artificial text wrap
		boxWidth := contentWidth
		if titleLen > boxWidth {
			boxWidth = titleLen
		}
		titleStr = titleStyle.Width(boxWidth).Align(lipgloss.Center).Render(titleText)
		contentStr = contentStyle.Render(content)
	}

	// Join the parts vertically
	ui := lipgloss.JoinVertical(lipgloss.Left, titleStr, contentStr)
	formatted := outerBoxStyle.Render(ui)

	if TuiMode {
		tuiMu.Lock()
		// Split by newline and append so TUI viewport renders properly
		lines := strings.Split(formatted, "\n")
		TuiBuffer = append(TuiBuffer, lines...)
		tuiMu.Unlock()
	} else {
		// Render the final output
		fmt.Println(formatted)
	}
}

// BoxOutput provides a shim for existing runner implementations.
func BoxOutput(title, content string, borderColor lipgloss.Color) {
	themeColor := primaryColor
	if borderColor == lipgloss.Color("1") {
		themeColor = destructiveColor
	} else if borderColor == lipgloss.Color("2") {
		themeColor = primaryColor
	}
	CustomBox(title, content, themeColor)
}
