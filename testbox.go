package main

import (
"fmt"
"strings"

"github.com/charmbracelet/lipgloss"
)

func main() {
	color := lipgloss.Color("#e11d48")
	title := "FAILURE LOG: ESLINT"
	content := "/home/stevan/work/spcom-final/src/pages/og/[...slug].png.ts\n  14:64  error  Promise-return"

	// Find the maximum width
	contentWidth := lipgloss.Width(content)
	titleText := strings.ToUpper(title)
	if lipgloss.Width(titleText)+2 > contentWidth {
		contentWidth = lipgloss.Width(titleText) + 2
	}

	outerBoxStyle := lipgloss.NewStyle().
		Border(lipgloss.RoundedBorder(), true).
		BorderForeground(color).
		Padding(1, 1).
		Margin(1, 0)

	titleStyle := lipgloss.NewStyle().
		Background(color).
		Foreground(lipgloss.Color("#FFFFFF")).
		Padding(0, 1).
		Bold(true).
		Width(contentWidth)

	contentStyle := lipgloss.NewStyle().
		MarginTop(1)

	titleStr := titleStyle.Render(titleText)
	contentStr := contentStyle.Render(content)

	ui := lipgloss.JoinVertical(lipgloss.Left, titleStr, contentStr)
	fmt.Println(outerBoxStyle.Render(ui))
}
