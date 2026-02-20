package cli

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
)

// BoxOutput outputs content inside a styled box.
func BoxOutput(title, content string, borderColor lipgloss.Color) {
	if Quiet && borderColor == lipgloss.Color("1") {
		return
	}
	borderStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder()).
		BorderForeground(borderColor)

	titleStyle := lipgloss.NewStyle().
		Bold(true).
		Align(lipgloss.Center).
		Padding(0, 1)

	// Add top and bottom padding to the content, and restrict width if necessary
	contentStyle := lipgloss.NewStyle().
		MaxWidth(116). // 120 total max width minus borders
		Padding(0, 1)

	// We format the title to live inside the top edge of the box roughly,
	// or just place it as the first element inside the box.
	// For simplicity, we stack title and a divider then content.

	combined := lipgloss.JoinVertical(
		lipgloss.Left,
		titleStyle.Render(title),
		lipgloss.NewStyle().Foreground(borderColor).Render(strings.Repeat("─", lipgloss.Width(title)+4)),
		contentStyle.Render(content),
	)

	fmt.Println(borderStyle.Render(combined))
}
