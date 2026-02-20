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
	// Colors from global.css (approximate hex values)
	colorBG      = lipgloss.Color("#09090b")
	colorFG      = lipgloss.Color("#fafafa")
	colorBorder  = lipgloss.Color("#27272a") // hsl(240 3.7% 15.9%)
	colorMuted   = lipgloss.Color("#71717a") // hsl(240 5% 64.9%)
	colorPrimary = lipgloss.Color("#fafafa")
	colorAccent  = lipgloss.Color("#3b82f6") // Standard blue for flow

	appStyle = lipgloss.NewStyle().Padding(0, 1).Background(colorBG).Foreground(colorFG)

	logoStyle = lipgloss.NewStyle().
		Foreground(lipgloss.Color("#000000")).
		Background(lipgloss.Color("#ffffff")).
		Padding(0, 1).
		Bold(true).
		MarginRight(2)

	taskStylePending = lipgloss.NewStyle().Foreground(lipgloss.Color("#3b82f6")).Bold(true)
	taskStyleSuccess = lipgloss.NewStyle().Foreground(lipgloss.Color("#10b981")).Bold(true)
	taskStyleError   = lipgloss.NewStyle().Foreground(lipgloss.Color("#ef4444")).Bold(true)
	logStyle         = lipgloss.NewStyle().Foreground(colorMuted)

	// Layout Styles
	headerStyle    = lipgloss.NewStyle().
		Height(1).
		Padding(0, 1).
		Border(lipgloss.NormalBorder(), false, false, true, false).
		BorderForeground(colorBorder).
		MarginBottom(1)

	leftPaneStyle  = lipgloss.NewStyle().Width(35).PaddingRight(1).Border(lipgloss.NormalBorder(), false, true, false, false).BorderForeground(colorBorder)
	rightPaneStyle = lipgloss.NewStyle().Padding(0, 2)

	// Tab Styles
	tabStyle = lipgloss.NewStyle().
		Padding(0, 1).
		Foreground(colorMuted)

	activeTabStyle = lipgloss.NewStyle().
		Padding(0, 1).
		Foreground(colorPrimary).
		Bold(true).
		Underline(true)

	tabWindowStyle = lipgloss.NewStyle().
		Padding(0).
		Border(lipgloss.NormalBorder(), true, false, false, false).
		BorderForeground(colorBorder)

	// Navigation Styles
	helpStyle = lipgloss.NewStyle().Foreground(colorMuted)
	keyStyle  = lipgloss.NewStyle().Foreground(colorAccent).Bold(true)
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

	str := i.title + "\n" + lipgloss.NewStyle().Foreground(colorMuted).PaddingLeft(2).Render("("+i.id+")")

	fn := func(s ...string) string {
		return lipgloss.NewStyle().PaddingLeft(2).Render(strings.Join(s, " "))
	}
	if index == m.Index() {
		fn = func(s ...string) string {
			return lipgloss.NewStyle().
				Border(lipgloss.NormalBorder(), false, false, false, true).
				BorderForeground(colorAccent).
				Foreground(colorAccent).
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

	// Navigation State
	selectedTaskIndex int  // -1 for All
	focusOutputList  bool // true: task list, false: viewport
	sidebarCollapsed bool
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
	l.Styles.Title = logoStyle
	l.SetShowHelp(false)
	l.SetShowStatusBar(false)
	l.SetShowPagination(true)
	l.Styles.PaginationStyle = lipgloss.NewStyle().PaddingLeft(2).Foreground(colorMuted)

	ti := textinput.New()
	ti.Focus()
	ti.CharLimit = 156
	ti.Width = 40

	s := spinner.New()
	s.Spinner = spinner.Dot
	s.Style = lipgloss.NewStyle().Foreground(colorAccent)

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
		selectedTaskIndex: -1,
		focusOutputList:  true,
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
				if m.activeTab == tabOutput && m.focusOutputList {
					if msg.String() == "up" {
						if m.selectedTaskIndex > -1 {
							m.selectedTaskIndex--
						}
					} else if msg.String() == "down" {
						if m.selectedTaskIndex < len(m.taskIds)-1 {
							m.selectedTaskIndex++
						}
					}
					m.updateViewportContent()
					return m, nil
				}
				var cmd tea.Cmd
				m.viewport, cmd = m.viewport.Update(msg)
				cmds = append(cmds, cmd)
			}
			if msg.String() == "b" {
				m.sidebarCollapsed = !m.sidebarCollapsed
				return m, nil
			}
			if msg.String() == "enter" && m.activeTab == tabOutput {
				m.focusOutputList = !m.focusOutputList
				return m, nil
			}
		}

	case tea.MouseMsg:
		if msg.Type == tea.MouseLeftRelease {
			// Tab switching
			if msg.Y == 0 { // Clicked in top row
				// logo is roughly 9 chars " REPOKIT "
				x := msg.X
				if x > 10 {
					tabX := x - 10
					// tabs are roughly "1:Commands ", "2:Output ", "3:History "
					if tabX < 12 {
						m.activeTab = tabCommands
					} else if tabX < 21 {
						m.activeTab = tabOutput
					} else if tabX < 31 {
						m.activeTab = tabHistory
					}
					return m, nil
				}
			}

			// Sidebar click
			if !m.sidebarCollapsed && msg.X < 35 && msg.Y > 1 {
				// Rough index calculation - delegate height is 1
				// Header is line 0, border is line 1 + margin
				idx := msg.Y - 2
				if idx >= 0 && idx < len(m.list.Items()) {
					m.list.Select(idx)
					// Trigger action if in menu
					if m.currentState == stateMenu {
						// Logic duplicated from enter key for now or just select
					}
					return m, nil
				}
			}
		}

		if msg.Type == tea.MouseWheelUp {
			if !m.sidebarCollapsed && msg.X < 35 {
				m.list.CursorUp()
			} else {
				m.viewport.LineUp(3)
			}
			return m, nil
		}
		if msg.Type == tea.MouseWheelDown {
			if !m.sidebarCollapsed && msg.X < 35 {
				m.list.CursorDown()
			} else {
				m.viewport.LineDown(3)
			}
			return m, nil
		}

	case tea.WindowSizeMsg:
		m.width, m.height = msg.Width, msg.Height
		h, v := appStyle.GetFrameSize()
		innerWidth := m.width - h
		innerHeight := m.height - v

		// Left menu width calculation
		leftWidth := 35
		if m.sidebarCollapsed {
			leftWidth = 0
		}

		m.list.SetSize(30, innerHeight-6)

		m.viewport.Width = innerWidth - leftWidth - 1
		m.viewport.Height = innerHeight - 12

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
				formatted := colorizeLog(fmt.Sprintf("[%s] %s", msg.TaskID, newLog))
				m.fullLog = append(m.fullLog, formatted)
				if len(m.fullLog) > 500 {
					m.fullLog = m.fullLog[len(m.fullLog)-500:]
				}
				m.updateViewportContent()
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

func (m Model) renderHeader() string {
	logo := logoStyle.Render("REPOKIT")

	var tabs []string
	titles := []string{"Commands", "Output", "History"}
	for i, t := range titles {
		label := fmt.Sprintf("%d:%s", i+1, t)
		if tab(i) == m.activeTab {
			tabs = append(tabs, activeTabStyle.Render(label))
		} else {
			tabs = append(tabs, tabStyle.Render(label))
		}
	}

	tabRow := lipgloss.JoinHorizontal(lipgloss.Top, tabs...)

	sidebarHint := lipgloss.NewStyle().Foreground(colorMuted).Render(" [b: toggle sidebar]")
	if m.sidebarCollapsed {
		sidebarHint = lipgloss.NewStyle().Foreground(colorAccent).Render(" [b: show sidebar]")
	}

	headerContent := lipgloss.JoinHorizontal(lipgloss.Left, logo, tabRow, sidebarHint)
	return headerStyle.Width(m.width - 2).Render(headerContent)
}

func (m Model) View() string {
	if m.quitting {
		return ""
	}

	header := m.renderHeader()
	var content string

	switch m.activeTab {
	case tabCommands:
		h, _ := appStyle.GetFrameSize()
		innerWidth := m.width - h

		var left string
		rightWidth := innerWidth

		if !m.sidebarCollapsed {
			leftWidth := 35
			rightWidth = innerWidth - leftWidth
			left = leftPaneStyle.Width(leftWidth - 2).Render(m.list.View())
		}

		var right string
		switch m.currentState {
		case stateMenu:
			desc := lipgloss.NewStyle().Foreground(colorMuted).Render("Select a command from the left to execute.\n\n" +
				"Use Tab / Shift-Tab to switch views.\n" +
				"Use 1, 2, 3 for direct navigation.")
			right = fmt.Sprintf("\n%s\n", desc)
		case stateInput:
			right = fmt.Sprintf(
				"%s\n\n%s\n\n(esc to cancel)",
				lipgloss.NewStyle().Foreground(colorAccent).Render(m.taskQuery),
				m.textInput.View(),
			)
		case stateRunning, stateDone:
			right = lipgloss.NewStyle().Foreground(colorMuted).Italic(true).Render("Task is running...\n\nSwitch to Output tab (2) to see details.")
		}

		rpStyled := rightPaneStyle.Width(rightWidth - 4).Render(right)
		if m.sidebarCollapsed {
			content = rpStyled
		} else {
			content = lipgloss.JoinHorizontal(lipgloss.Top, left, rpStyled)
		}

	case tabOutput:
		var sb strings.Builder
		if len(m.taskIds) == 0 {
			sb.WriteString(fmt.Sprintf("\n  %s Waiting for task execution...\n", m.spinner.View()))
		} else {
			sb.WriteString(fmt.Sprintf(" Pipeline: %s\n", lipgloss.NewStyle().Foreground(colorAccent).Render(m.activeMenuItem)))

			// Summary line
			allSelected := m.selectedTaskIndex == -1
			allIcon := lipgloss.NewStyle().Foreground(colorMuted).Render("○")
			if allSelected {
				allIcon = taskStyleSuccess.Render("●")
			}
			allText := "ALL TASKS"
			if allSelected && m.focusOutputList {
				allText = lipgloss.NewStyle().Background(colorAccent).Foreground(lipgloss.Color("#FFFFFF")).Render(" ALL TASKS ")
			}
			sb.WriteString(fmt.Sprintf(" %s %s\n", allIcon, allText))

			// Show task summaries in a compact way
			for idx, id := range m.taskIds {
				t := m.tasks[id]
				selected := m.selectedTaskIndex == idx

				var icon, statText string
				durStr := lipgloss.NewStyle().Foreground(colorMuted).Render(fmt.Sprintf("%5.1fs", time.Since(t.start).Seconds()))
				if t.status == "done" || t.status == "error" {
					durStr = lipgloss.NewStyle().Foreground(colorMuted).Render(fmt.Sprintf("%5.1fs", t.elapsed.Seconds()))
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
					icon = lipgloss.NewStyle().Foreground(colorMuted).Render("○")
					statText = lipgloss.NewStyle().Foreground(colorMuted).Render("WAIT")
					durStr = lipgloss.NewStyle().Foreground(colorMuted).Render("  --.-s")
				}


				taskName := t.name
				if selected && m.focusOutputList {
					taskName = lipgloss.NewStyle().Background(colorAccent).Foreground(lipgloss.Color("#FFFFFF")).Render(" " + t.name + " ")
				} else if selected {
					taskName = lipgloss.NewStyle().Foreground(colorAccent).Underline(true).Render(t.name)
				}

				sb.WriteString(fmt.Sprintf(" %s %-25.25s %s %s\n", icon, taskName, statText, durStr))
			}
		}

		viewportStyle := tabWindowStyle.Width(m.width - 4)
		if !m.focusOutputList {
			viewportStyle = viewportStyle.BorderForeground(colorAccent)
		}
		sb.WriteString("\n" + viewportStyle.Render(m.viewport.View()))

		// Navigation Bar
		sb.WriteString("\n\n")
		var help []string
		help = append(help, keyStyle.Render("↑/↓")+" navigate tasks")
		help = append(help, keyStyle.Render("Enter")+" toggle scroll")
		help = append(help, keyStyle.Render("1,2,3")+" switch tabs")
		if m.currentState == stateDone {
			help = append(help, keyStyle.Render("Esc")+" back to menu")
		}
		sb.WriteString("  " + helpStyle.Render(strings.Join(help, " • ")))

		if m.currentState == stateDone {
			// sb.WriteString("\n" + core.Subtle.Render("(Press enter/esc to return to menu)"))
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

func (m *Model) updateViewportContent() {
	var logs []string
	if m.selectedTaskIndex == -1 {
		logs = m.fullLog
	} else {
		taskID := m.taskIds[m.selectedTaskIndex]
		for _, line := range m.fullLog {
			if strings.Contains(line, "["+taskID+"]") {
				logs = append(logs, line)
			}
		}
	}
	m.viewport.SetContent(strings.Join(logs, "\n"))
	m.viewport.GotoBottom()
}

func colorizeLog(line string) string {
	// Simple keyword coloring
	line = strings.ReplaceAll(line, "DONE", taskStyleSuccess.Render("DONE"))
	line = strings.ReplaceAll(line, "SUCCESS", taskStyleSuccess.Render("SUCCESS"))
	line = strings.ReplaceAll(line, "FAIL", taskStyleError.Render("FAIL"))
	line = strings.ReplaceAll(line, "ERROR", taskStyleError.Render("ERROR"))
	line = strings.ReplaceAll(line, "WARN", core.Yellow.Render("WARN"))
	line = strings.ReplaceAll(line, "STEP", core.Cyan.Render("STEP"))

	// Color task IDs in brackets [task-id]
	if strings.HasPrefix(line, "[") {
		end := strings.Index(line, "]")
		if end > 0 {
			taskID := line[1:end]
			color := getTaskColor(taskID)
			line = lipgloss.NewStyle().Foreground(color).Render("["+taskID+"]") + line[end+1:]
		}
	}

	return line
}

func getTaskColor(id string) lipgloss.Color {
	// Generate a stable color based on task ID
	hash := 0
	for _, c := range id {
		hash = 31*hash + int(c)
	}
	colors := []string{"#3b82f6", "#06b6d4", "#10b981", "#fbbf24", "#e11d48", "#a855f7"}
	return lipgloss.Color(colors[uint(hash)%uint(len(colors))])
}
