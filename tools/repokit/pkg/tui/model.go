package tui

import (
	"fmt"
	"io"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/list"
	"github.com/charmbracelet/bubbles/spinner"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"repokit/pkg/commands"
	"repokit/pkg/core"
	"repokit/pkg/runner"
)

var (
	appStyle = lipgloss.NewStyle().Padding(1, 2)
	titleStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("#FFFDF5")).Background(lipgloss.Color("#7D56F4")).Padding(0, 1)
	inputStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("#7D56F4"))

	taskStylePending = lipgloss.NewStyle().Foreground(core.BlueColor).Bold(true)
	taskStyleSuccess = lipgloss.NewStyle().Foreground(core.Primary.GetForeground()).Bold(true)
	taskStyleError   = lipgloss.NewStyle().Foreground(core.Red.GetForeground()).Bold(true)
	logStyle         = lipgloss.NewStyle().Foreground(lipgloss.Color("8"))

	// Layout Styles
	leftPaneStyle  = lipgloss.NewStyle().Width(35).PaddingRight(1).Border(lipgloss.NormalBorder(), false, true, false, false).BorderForeground(lipgloss.Color("8"))
	rightPaneStyle = lipgloss.NewStyle().Padding(1, 2).MarginLeft(1).MarginRight(1).Border(lipgloss.RoundedBorder()).BorderForeground(lipgloss.Color("8"))

	// Tab Styles
	tabStyle = lipgloss.NewStyle().Padding(0, 2).Border(lipgloss.NormalBorder(), false, false, true, false).BorderForeground(lipgloss.Color("8"))
	activeTabStyle = lipgloss.NewStyle().Padding(0, 2).Foreground(lipgloss.Color("#7D56F4")).Border(lipgloss.NormalBorder(), false, false, true, false).BorderForeground(lipgloss.Color("#7D56F4")).Bold(true)
	tabWindowStyle = lipgloss.NewStyle().Padding(1, 1).Border(lipgloss.NormalBorder(), true, false, false, false).BorderForeground(lipgloss.Color("8"))
)

type state int

const (
	stateMenu state = iota
	stateInput
	stateRunning
	stateDone
)

type tab int

const (
	tabCommands tab = iota
	tabOutput
	tabHistory
)

type runRecord struct {
	ID        string
	StartTime time.Time
	Duration  time.Duration
	Status    string
	Error     string
}

type item struct {
	title       string
	description string
	id          string
}

func (i item) Title() string       { return i.title }
func (i item) Description() string { return i.description }
func (i item) FilterValue() string { return i.title + " " + i.id }

type itemDelegate struct{}

func (d itemDelegate) Height() int                               { return 1 }
func (d itemDelegate) Spacing() int                              { return 0 }
func (d itemDelegate) Update(msg tea.Msg, m *list.Model) tea.Cmd { return nil }
func (d itemDelegate) Render(w io.Writer, m list.Model, index int, listItem list.Item) {
	i, ok := listItem.(item)
	if !ok {
		return
	}

	str := fmt.Sprintf("%s %s", i.title, lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Render("("+i.id+")"))

	fn := lipgloss.NewStyle().PaddingLeft(2).Render
	if index == m.Index() {
		fn = func(s ...string) string {
			return lipgloss.NewStyle().
				Border(lipgloss.NormalBorder(), false, false, false, true).
				BorderForeground(lipgloss.Color("#7D56F4")).
				Foreground(lipgloss.Color("#7D56F4")).
				PaddingLeft(1).
				Render(strings.Join(s, " "))
		}
	}

	fmt.Fprint(w, fn(str))
}

type taskState struct {
	name      string
	status    string // "running", "done", "error"
	errorMsg  string
	start     time.Time
	elapsed   time.Duration
	logs      []string
}

type Model struct {
	currentState state
	list         list.Model
	textInput    textinput.Model
	spinner      spinner.Model
	viewport     viewport.Model
	quitting     bool

	width  int
	height int

	activeMenuItem string
	taskQuery      string

	// Engine state
	tasks map[string]*taskState
	taskIds []string
	fullLog []string

	// Tab state
	activeTab tab
	history   []runRecord
}

func NewAppModel(initialTask string) (*Model, error) {
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
	items = append(items, item{title: "Pack", description: "Bundle the project", id: "pack"})
	items = append(items, item{title: "Clean", description: "Clean untracked files", id: "clean"})
	items = append(items, item{title: "Optimize SVGs", description: "Minify SVG assets", id: "optimize_svg"})
	items = append(items, item{title: "Export Schema", description: "Export JSON schema", id: "export_schema"})
	items = append(items, item{title: "Generate README", description: "AI README generation", id: "generate_readme"})
	items = append(items, item{title: "Auto Commit", description: "AI-assisted commits", id: "auto_commit"})
	items = append(items, item{title: "Help", description: "Show help information", id: "help"})

	// Setup compact list
	delegate := itemDelegate{}

	l := list.New(items, delegate, 0, 0)
	l.Title = "Repokit"
	l.Styles.Title = titleStyle
	l.SetShowHelp(false)
	l.SetShowStatusBar(false)
	l.SetShowPagination(true)

	ti := textinput.New()
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 40

	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(lipgloss.Color("205"))

	vp := viewport.New(100, 20)
	vp.Style = lipgloss.NewStyle().Padding(0, 0)

	core.TuiMode = true
	core.OSExit = func(code int) {
		panic(fmt.Errorf("task exited with code %d", code))
	}

	m := &Model{
		currentState: stateMenu,
		list:         l,
		textInput:    ti,
		spinner:      s,
		viewport:     vp,
		tasks:        make(map[string]*taskState),
		activeTab:    tabCommands,
	}

	if initialTask != "" {
		m.currentState = stateRunning
		m.activeMenuItem = initialTask
	}

	return m, nil
}

func (m Model) Init() tea.Cmd {
	var cmds []tea.Cmd
	cmds = append(cmds, textinput.Blink, listenForEvents(), m.spinner.Tick)
	if m.currentState == stateRunning {
		cmds = append(cmds, runBgTaskCmd(m.activeMenuItem, ""))
	}
	return tea.Batch(cmds...)
}

func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	var cmds []tea.Cmd

	switch msg := msg.(type) {
	case tea.KeyMsg:
		if msg.String() == "ctrl+c" {
			m.quitting = true
			return m, tea.Quit
		}

		// Tab switching (available everywhere except when inputting)
		if m.currentState != stateInput {
			switch msg.String() {
			case "tab":
				m.activeTab = (m.activeTab + 1) % 3
				return m, nil
			case "shift+tab":
				m.activeTab = (m.activeTab + 2) % 3
				return m, nil
			case "1":
				m.activeTab = tabCommands
				return m, nil
			case "2":
				m.activeTab = tabOutput
				return m, nil
			case "3":
				m.activeTab = tabHistory
				return m, nil
			}
		}

		switch m.currentState {
		case stateMenu:
			if msg.String() == "esc" && m.list.FilterState() == list.Filtering {
				// handled by list
			} else if msg.String() == "q" && m.list.FilterState() != list.Filtering {
				m.quitting = true
				return m, tea.Quit
			} else if msg.String() == "enter" {
				if m.list.FilterState() == list.Filtering {
					// Apply filter enter logic gracefully
					var cmd tea.Cmd
					m.list, cmd = m.list.Update(msg)
					return m, cmd
				}

				if i, ok := m.list.SelectedItem().(item); ok {
					m.activeMenuItem = i.id
					switch i.id {
					case "pack":
						m.currentState = stateInput
						m.taskQuery = "Enter directory to pack:"
						m.textInput.Placeholder = "."
						m.textInput.SetValue("")
					case "clean":
						m.currentState = stateInput
						m.taskQuery = "Proceed deleting untracked? [y/N]:"
						m.textInput.Placeholder = "y/N"
						m.textInput.SetValue("")
					case "generate_readme":
						m.currentState = stateInput
						m.taskQuery = "LLM Provider (openai/gemini/ollama):"
						m.textInput.Placeholder = "ollama"
						m.textInput.SetValue("")
					case "auto_commit":
						m.currentState = stateInput
						m.taskQuery = "LLM Provider (none to skip):"
						m.textInput.Placeholder = "none"
						m.textInput.SetValue("")
					default:
						m.currentState = stateRunning
						m.tasks = make(map[string]*taskState)
						m.taskIds = nil
						m.fullLog = nil
						m.viewport.SetContent("")
						m.activeTab = tabOutput
						cmds = append(cmds, runBgTaskCmd(m.activeMenuItem, ""))
					}
					if m.currentState == stateInput {
						m.textInput.Focus()
						cmds = append(cmds, textinput.Blink)
					}
				}
			} else if msg.String() != "up" && msg.String() != "down" && m.list.FilterState() != list.Filtering {
				// We want any typing to implicitly start filtering
				if m.list.FilterInput.Focused() {
				    var cmd tea.Cmd
				    m.list, cmd = m.list.Update(msg)
				    cmds = append(cmds, cmd)
				} else {
					// Fallback: emulate pressing '/'
					m.list.FilterInput.Focus()
					var cmd tea.Cmd
					m.list, cmd = m.list.Update(msg)
					cmds = append(cmds, cmd)
				}
			}

		case stateInput:
			if msg.String() == "esc" {
				m.currentState = stateMenu
			} else if msg.String() == "enter" {
				m.currentState = stateRunning
				m.tasks = make(map[string]*taskState)
				m.taskIds = nil
				m.fullLog = nil
				m.viewport.SetContent("")
				m.activeTab = tabOutput
				val := m.textInput.Value()
				cmds = append(cmds, runBgTaskCmd(m.activeMenuItem, val))
			}
		case stateRunning, stateDone:
			if m.currentState == stateDone {
				if msg.String() == "q" {
					m.quitting = true
					return m, tea.Quit
				} else if msg.String() == "esc" || msg.String() == "enter" {
					m.currentState = stateMenu
					m.list.ResetFilter()
					// We need to fetch cmds here incase resetting filter triggers something, but returning batch is safer
					cmds = append(cmds, textinput.Blink)
					return m, tea.Batch(cmds...)
				}
			}
			if msg.String() == "up" || msg.String() == "down" || msg.String() == "pgup" || msg.String() == "pgdown" {
				var cmd tea.Cmd
				m.viewport, cmd = m.viewport.Update(msg)
				cmds = append(cmds, cmd)
			}
		}

	case tea.WindowSizeMsg:
		m.width, m.height = msg.Width, msg.Height
		h, v := appStyle.GetFrameSize()
		innerWidth := m.width - h
		innerHeight := m.height - v

		// Left menu width is fixed at 35
		m.list.SetSize(30, innerHeight-4) // -4 for tabs and padding

		m.viewport.Width = innerWidth - 4
		m.viewport.Height = innerHeight - 10 // Account for tabs and task summary

	case spinner.TickMsg:
		var cmd tea.Cmd
		m.spinner, cmd = m.spinner.Update(msg)
		cmds = append(cmds, cmd)

	case core.Event:
		// Process Event
		if _, ok := m.tasks[msg.TaskID]; !ok && msg.TaskID != "" && msg.TaskID != "pipeline" {
			m.taskIds = append(m.taskIds, msg.TaskID)
			m.tasks[msg.TaskID] = &taskState{
				name:   msg.TaskID,
				status: "running",
				start:  msg.Time,
			}
		}

		switch msg.Type {
		case core.EventTaskStart:
			if t, ok := m.tasks[msg.TaskID]; ok {
				t.status = "running"
				if msg.Data != "" {
					t.name = msg.Data
				}
			}
		case core.EventTaskLog:
			if t, ok := m.tasks[msg.TaskID]; ok {
				clean := core.CleanANSI(msg.Data)
				t.logs = append(t.logs, clean)
				if len(t.logs) > 5 {
					t.logs = t.logs[1:]
				}
			}
			newLog := core.CleanANSI(msg.Data)
			if newLog != "" {
				m.fullLog = append(m.fullLog, logStyle.Render(fmt.Sprintf("[%s] %s", msg.TaskID, newLog)))
				if len(m.fullLog) > 500 {
					m.fullLog = m.fullLog[len(m.fullLog)-500:]
				}
				m.viewport.SetContent(strings.Join(m.fullLog, "\n"))
				m.viewport.GotoBottom()
			}
		case core.EventTaskDone:
			if t, ok := m.tasks[msg.TaskID]; ok {
				t.status = "done"
				t.elapsed = msg.Time.Sub(t.start)
			}
		case core.EventTaskError:
			if t, ok := m.tasks[msg.TaskID]; ok {
				t.status = "error"
				t.errorMsg = msg.Data
				t.elapsed = msg.Time.Sub(t.start)
			}
		case core.EventPipelineDone:
			m.currentState = stateDone
			// Add to history
			status := "done"
			for _, t := range m.tasks {
				if t.status == "error" {
					status = "error"
					break
				}
			}
			m.history = append(m.history, runRecord{
				ID:        m.activeMenuItem,
				StartTime: time.Now(), // rough estimate or track properly
				Status:    status,
			})
			if len(m.history) > 20 {
				m.history = m.history[1:]
			}
		}

		// Wait for next event
		cmds = append(cmds, listenForEvents())

	case taskResultMsg:
		m.currentState = stateDone
	}

	// Always route standard messages nicely if inside menu or input
	if m.currentState == stateMenu {
		var cmd tea.Cmd
		m.list, cmd = m.list.Update(msg)
		cmds = append(cmds, cmd)
	} else if m.currentState == stateInput {
		var cmd tea.Cmd
		m.textInput, cmd = m.textInput.Update(msg)
		cmds = append(cmds, cmd)
	}

	return m, tea.Batch(cmds...)
}

func (m Model) renderTabs() string {
	var tabs []string
	titles := []string{"1: Commands", "2: Output", "3: History"}
	for i, t := range titles {
		if tab(i) == m.activeTab {
			tabs = append(tabs, activeTabStyle.Render(t))
		} else {
			tabs = append(tabs, tabStyle.Render(t))
		}
	}
	return lipgloss.JoinHorizontal(lipgloss.Top, tabs...)
}

func (m Model) View() string {
	if m.quitting {
		return ""
	}

	header := m.renderTabs()
	var content string

	switch m.activeTab {
	case tabCommands:
		h, _ := appStyle.GetFrameSize()
		innerWidth := m.width - h
		leftWidth := 35
		rightWidth := innerWidth - leftWidth

		left := leftPaneStyle.Width(leftWidth - 2).Render(m.list.View()) // -2 for padding/border
		var right string
		switch m.currentState {
		case stateMenu:
			logo := lipgloss.NewStyle().Foreground(lipgloss.Color("#7D56F4")).Bold(true).Render("Repokit v1.0")
			desc := "Select a command from the left to execute.\n\n" +
				"Use Tab / Shift-Tab to switch views.\n" +
				"Use 1, 2, 3 for direct navigation."
			right = fmt.Sprintf("\n%s\n\n%s\n", logo, desc)
		case stateInput:
			right = fmt.Sprintf(
				"%s\n\n%s\n\n(esc to cancel)",
				inputStyle.Render(m.taskQuery),
				m.textInput.View(),
			)
		case stateRunning, stateDone:
			right = lipgloss.NewStyle().Foreground(core.Subtle.GetForeground()).Italic(true).Render("Task is running...\n\nSwitch to Output tab (2) to see details.")
		}

		// Ensure right pane fills remaining width
		rpStyled := rightPaneStyle.Width(rightWidth - 6).Render(right) // -6 for padding (2+2) and margins (1+1)
		content = lipgloss.JoinHorizontal(lipgloss.Top, left, rpStyled)

	case tabOutput:
		var sb strings.Builder
		if len(m.taskIds) == 0 {
			sb.WriteString(fmt.Sprintf("\n  %s Waiting for task execution...\n", m.spinner.View()))
		} else {
			sb.WriteString(fmt.Sprintf(" Pipeline: %s\n\n", inputStyle.Render(m.activeMenuItem)))

			// Show task summaries in a compact way
			for _, id := range m.taskIds {
				t := m.tasks[id]
				var icon, statText string
				durStr := core.Subtle.Render(fmt.Sprintf("%5.1fs", time.Since(t.start).Seconds()))
				if t.status == "done" || t.status == "error" {
					durStr = core.Subtle.Render(fmt.Sprintf("%5.1fs", t.elapsed.Seconds()))
				}

				switch t.status {
				case "done":
					icon = taskStyleSuccess.Render("✓")
					statText = taskStyleSuccess.Render("DONE")
				case "error":
					icon = taskStyleError.Render("✕")
					statText = taskStyleError.Render("FAIL")
				case "running":
					icon = taskStylePending.Render(m.spinner.View())
					statText = taskStylePending.Render("RUN ")
				default:
					icon = core.Subtle.Render("○")
					statText = core.Subtle.Render("WAIT")
					durStr = core.Subtle.Render("  --.-s")
				}
				sb.WriteString(fmt.Sprintf(" %s %-25.25s %s %s\n", icon, t.name, statText, durStr))
			}
		}

		sb.WriteString("\n" + tabWindowStyle.Width(m.viewport.Width+2).Render(m.viewport.View()))

		if m.currentState == stateDone {
			sb.WriteString("\n" + core.Subtle.Render("(Press enter/esc to return to menu)"))
		}
		content = sb.String()

	case tabHistory:
		var sb strings.Builder
		sb.WriteString(lipgloss.NewStyle().Bold(true).PaddingLeft(1).Render("Recent Runs") + "\n\n")
		if len(m.history) == 0 {
			sb.WriteString("  " + core.Subtle.Render("No history yet."))
		} else {
			for i := len(m.history) - 1; i >= 0; i-- {
				h := m.history[i]
				status := taskStyleSuccess.Render("DONE")
				if h.Status == "error" {
					status = taskStyleError.Render("FAIL")
				}
				sb.WriteString(fmt.Sprintf("  %-25s %s %s\n", h.ID, core.Subtle.Render(h.StartTime.Format("15:04:05")), status))
			}
		}
		content = sb.String()
	}

	return appStyle.Render(lipgloss.JoinVertical(lipgloss.Left, header, content))
}

// ─── TUI Event Loop and Executor ─────────────────────────────────────────────

func listenForEvents() tea.Cmd {
	return func() tea.Msg {
		return <-core.EventBus
	}
}

type taskResultMsg struct {
	err error
}

func runBgTaskCmd(taskID string, arg string) tea.Cmd {
	return func() tea.Msg {
		var runErr error
		defer func() {
			if r := recover(); r != nil {
				runErr = fmt.Errorf("task panic: %v", r)
			}
			core.PublishEvent(core.EventPipelineDone, "pipeline", "")
		}()

		switch taskID {
		case "pack":
			commands.RunPack(arg)
		case "clean":
			val := strings.ToLower(strings.TrimSpace(arg))
			force := val == "y" || val == "yes"
			if force || arg == "" {
				commands.RunClean(force)
			} else {
				core.PublishEvent(core.EventTaskLog, "clean", "Aborted by user.")
			}
		case "generate_readme":
			runner.RunTask(taskID, nil, nil)
		case "auto_commit":
			runner.RunTask(taskID, nil, nil)
		default:
			runner.RunTask(taskID, nil, nil)
		}

		time.Sleep(100 * time.Millisecond) // Let events flush
		return taskResultMsg{err: runErr}
	}
}
