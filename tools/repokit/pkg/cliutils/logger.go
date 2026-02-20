package cliutils

import (
	"fmt"
	"os"

	"github.com/charmbracelet/lipgloss"
)

var (
	cyan   = lipgloss.NewStyle().Foreground(lipgloss.Color("6"))
	green  = lipgloss.NewStyle().Foreground(lipgloss.Color("2"))
	yellow = lipgloss.NewStyle().Foreground(lipgloss.Color("3"))
	red    = lipgloss.NewStyle().Foreground(lipgloss.Color("1"))
	blue   = lipgloss.NewStyle().Foreground(lipgloss.Color("4")).Bold(true)
	bold   = lipgloss.NewStyle().Bold(true)
	osExit = os.Exit
	Quiet  = false
)

func Info(msg string) {
	fmt.Println(cyan.Render("ℹ️  " + msg))
}

func Success(msg string) {
	fmt.Println(green.Render("✅ " + msg))
}

func Warning(msg string) {
	fmt.Println(yellow.Render("⚠️  " + msg))
}

func Error(msg string) {
	if !Quiet {
		fmt.Fprintln(os.Stderr, red.Render("❌ "+msg))
	}
}

func Step(msg string) {
	fmt.Println("\n" + blue.Render("▶ "+msg))
}

func Fatal(msg string) {
	if !Quiet {
		Error(msg)
	}
	osExit(1)
}
