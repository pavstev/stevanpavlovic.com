package tui

import (
	"repokit/pkg/core"

	"github.com/charmbracelet/bubbles/list"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

var (
	appStyle = lipgloss.NewStyle().Padding(1, 2)

	titleStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("#FFFDF5")).
			Background(lipgloss.Color("#7D56F4")). // Charm purple
			Padding(0, 1)
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
	list     list.Model
	quitting bool
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

	return &Model{list: l}, nil
}

func (m Model) Init() tea.Cmd {
	return nil
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" || msg.String() == "q" {
			m.quitting = true
			return m, tea.Quit
		}
		if msg.String() == "enter" {
			i, ok := m.list.SelectedItem().(item)
			if ok {
				// We'll handle running the task later
				_ = i
			}
		}
	case tea.WindowSizeMsg:
		h, v := appStyle.GetFrameSize()
		m.list.SetSize(msg.Width-h, msg.Height-v)
	}

	var cmd tea.Cmd
	m.list, cmd = m.list.Update(msg)
	return m, cmd
}

func (m Model) View() string {
	if m.quitting {
		return "Exiting Repokit...\n"
	}
	return appStyle.Render(m.list.View())
}
