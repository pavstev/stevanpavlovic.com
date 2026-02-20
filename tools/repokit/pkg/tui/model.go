package tui

import (
	"fmt"
	"repokit/pkg/commands"
	"repokit/pkg/core"
	"repokit/pkg/runner"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	appStyle = lipgloss.NewStyle().Padding(1, 2)

	titleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FFFDF5")).
			Background(lipgloss.Color("#7D56F4")). // Charm purple
			Padding(0, 1)

	inputStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("#7D56F4"))
)

type state int

const (
	stateMenu state = iota
	stateInput
	stateRunning
	stateDone
)

type item struct {
	title       string
	description string
	id          string // Task ID in tasks.yaml
}

func (i item) Title() string       { return i.title }
func (i item) Description() string { return i.description }
func (i item) FilterValue() string { return i.title }

type Model struct {
	currentState state
	list         list.Model
	textInput    textinput.Model
	spinner      spinner.Model
	viewport     viewport.Model
	quitting     bool
	activeTask   string // ID of the selected task
	taskQuery    string // Metadata prompt (e.g. "Directory to pack")
	logCache     []string
}

func NewModel() (*Model, error) {
	config, err := core.GetConfig()
	if err != nil {
		return nil, err
	}

	var items []list.Item
	for id, t := range config.Tasks {
		desc := t.Description
		if desc == "" {
			desc = "Run task: " + id
		}
		items = append(items, item{title: t.Name, description: desc, id: id})
	}

	// Default hardcoded commands that aren't in tasks.yaml
	items = append(items, item{title: "Pack", description: "Bundle directory into Markdown", id: "pack"})
	items = append(items, item{title: "Clean", description: "Clean build artifacts", id: "clean"})

	delegate := list.NewDefaultDelegate()
	delegate.Styles.SelectedTitle = delegate.Styles.SelectedTitle.Foreground(lipgloss.Color("#7D56F4")).BorderLeftForeground(lipgloss.Color("#7D56F4"))
	delegate.Styles.SelectedDesc = delegate.Styles.SelectedDesc.Foreground(lipgloss.Color("#7D56F4")).BorderLeftForeground(lipgloss.Color("#7D56F4"))

	l := list.New(items, delegate, 0, 0)
	l.Title = "Repokit Commands"
	l.Styles.Title = titleStyle

	ti := textinput.New()
	ti.Placeholder = ""
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 40

	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))

	vp := viewport.New(80, 20)
	vp.Style = lipgloss.NewStyle().Padding(1, 2)

	// Set TUI mode so logger writes to buffer
	core.TuiMode = true

	return &Model{
		currentState: stateMenu,
		list:         l,
		textInput:    ti,
		spinner:      s,
		viewport:     vp,
	}, nil
}

func (m Model) Init() tea.Cmd {
	return textinput.Blink
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" {
			m.quitting = true
			return m, tea.Quit
		}

		switch m.currentState {
		case stateMenu:
			if msg.String() == "q" {
				m.quitting = true
				return m, tea.Quit
			}
			if msg.String() == "enter" {
				i, ok := m.list.SelectedItem().(item)
				if ok {
					m.activeTask = i.id

					// Determine if the task needs user input
					switch i.id {
					case "pack":
						m.currentState = stateInput
						m.taskQuery = "Enter directory to pack (leave empty for current):"
						m.textInput.Placeholder = "."
						m.textInput.SetValue("")
						cmds = append(cmds, textinput.Blink)
					case "clean":
						m.currentState = stateInput
						m.taskQuery = "Proceed with deleting untracked files? [y/N]:"
						m.textInput.Placeholder = "y/N"
						m.textInput.SetValue("")
						cmds = append(cmds, textinput.Blink)
					case "generate_readme":
						m.currentState = stateInput
						m.taskQuery = "Enter LLM Provider (openai, gemini, ollama) [default: ollama]:"
						m.textInput.Placeholder = "ollama"
						m.textInput.SetValue("")
						cmds = append(cmds, textinput.Blink)
					case "auto_commit":
						m.currentState = stateInput
						m.taskQuery = "Enter LLM Provider for generation (none to skip) [default: none]:"
						m.textInput.Placeholder = "none"
						m.textInput.SetValue("")
						cmds = append(cmds, textinput.Blink)
					default:
						// Other commands can run directly for now
						m.currentState = stateRunning
						m.logCache = nil
						m.viewport.SetContent("")
						cmds = append(cmds, m.spinner.Tick, runTaskCmd(m.activeTask, ""), tickCmd())
					}
				}
			}
		case stateInput:
			if msg.String() == "esc" {
				m.currentState = stateMenu
			} else if msg.String() == "enter" {
				m.currentState = stateRunning
				m.logCache = nil
				m.viewport.SetContent("")
				val := m.textInput.Value()
				cmds = append(cmds, m.spinner.Tick, runTaskCmd(m.activeTask, val), tickCmd())
			}
		case stateRunning:
			// Allow scrolling viewport
			var cmd tea.Cmd
			m.viewport, cmd = m.viewport.Update(msg)
			cmds = append(cmds, cmd)
		}

	case tea.WindowSizeMsg:
		h, v := appStyle.GetFrameSize()
		m.list.SetSize(msg.Width-h, msg.Height-v)
		m.viewport.Width = msg.Width - h
		m.viewport.Height = msg.Height - v - 4 // Leave room for spinner header

	case tickMsg:
		if m.currentState == stateRunning || m.currentState == stateDone {
			newLogs := core.GetLogLines()
			if len(newLogs) > 0 {
				m.logCache = append(m.logCache, newLogs...)
				m.viewport.SetContent(strings.Join(m.logCache, "\n"))
				m.viewport.GotoBottom()
			}
			if m.currentState == stateRunning {
				cmds = append(cmds, tickCmd())
			}
		}

	case taskDoneMsg:
		m.currentState = stateDone
		// We could exit or prompt to continue
		// For now, let's just stay on the done screen so they can read logs.
		// Wait for them to press ESC or Q to go back to menu.
		cmds = append(cmds, tickCmd()) // One last tick to flush logs
	}

	// Route updates based on state
	switch m.currentState {
	case stateMenu:
		var cmd tea.Cmd
		m.list, cmd = m.list.Update(msg)
		cmds = append(cmds, cmd)
	case stateInput:
		var cmd tea.Cmd
		m.textInput, cmd = m.textInput.Update(msg)
		cmds = append(cmds, cmd)
	case stateRunning:
		var cmd tea.Cmd
		m.spinner, cmd = m.spinner.Update(msg)
		cmds = append(cmds, cmd)
	}

	return m, tea.Batch(cmds...)
}

func (m Model) View() string {
	if m.quitting {
		return "Exiting Repokit...\n"
	}

	var s string
	switch m.currentState {
	case stateMenu:
		s = m.list.View()
	case stateInput:
		s = fmt.Sprintf(
			"%s\n\n%s\n\n(esc to return to menu)",
			inputStyle.Render(m.taskQuery),
			m.textInput.View(),
		)
	case stateRunning:
		header := fmt.Sprintf("  %s Running %s...\n", m.spinner.View(), inputStyle.Render(m.activeTask))
		s = header + "\n" + m.viewport.View()
	case stateDone:
		header := fmt.Sprintf("\n  %s %s finished.\n", core.IconSuccess, inputStyle.Render(m.activeTask))
		s = header + "\n" + m.viewport.View() + "\n  (press esc to return to menu)"
	}

	return appStyle.Render(s)
}

// Tick message for polling logs
type tickMsg time.Time

func tickCmd() tea.Cmd {
	return tea.Tick(time.Millisecond*100, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
}

// taskDoneMsg is sent when a task completes
type taskDoneMsg struct {
	err error
}

// runTaskCmd creates a tea.Cmd that executes the task asynchronously
func runTaskCmd(taskID string, arg string) tea.Cmd {
	return func() tea.Msg {
		switch taskID {
		case "pack":
			commands.RunPack(arg) // Now we need to import commands
		case "clean":
			// If arg is literally 'y' or 'yes', we act as force=true because we already prompted the user
			val := strings.ToLower(strings.TrimSpace(arg))
			force := val == "y" || val == "yes"
			if force || arg == "" {
				commands.RunClean(force)
			} else {
				core.Info("Clean aborted by user.")
			}
		case "generate_readme":
			// We skip the background task for now or invoke it via core/runner
			runner.RunTask(taskID, nil, nil)
		case "auto_commit":
			runner.RunTask(taskID, nil, nil)
		default:
			runner.RunTask(taskID, nil, nil) // Need to import runner
		}
		return taskDoneMsg{err: nil}
	}
}
