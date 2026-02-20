package main

import (
"fmt"
"io"
"strings"

"github.com/charmbracelet/bubbles/list"
tea "github.com/charmbracelet/bubbletea"
"github.com/charmbracelet/lipgloss"
)

type item struct {
	title string
	id    string
}
func (i item) Title() string       { return i.title }
func (i item) Description() string { return "" }
func (i item) FilterValue() string { return i.title }

type itemDelegate struct{}

func (d itemDelegate) Height() int                             { return 1 }
func (d itemDelegate) Spacing() int                            { return 0 }
func (d itemDelegate) Update(msg tea.Msg, m *list.Model) tea.Cmd { return nil }
func (d itemDelegate) Render(w io.Writer, m list.Model, index int, listItem list.Item) {
	i, ok := listItem.(item)
	if !ok {
		return
	}

	str := fmt.Sprintf("%s %s", i.title, lipgloss.NewStyle().Foreground(lipgloss.Color("8")).Render("("+i.id+")"))

	fn := lipgloss.NewStyle().PaddingLeft(2).Render
	if index == m.Index() {
		fn = func(s string) string {
			return lipgloss.NewStyle().
				Border(lipgloss.NormalBorder(), false, false, false, true).
				BorderForeground(lipgloss.Color("#7D56F4")).
				Foreground(lipgloss.Color("#7D56F4")).
				PaddingLeft(1).
				Render(s)
		}
	}

	fmt.Fprint(w, fn(str))
}

func main() {
	items := []list.Item{
		item{title: "Pack", id: "pack"},
		item{title: "Clean", id: "clean"},
	}
	l := list.New(items, itemDelegate{}, 20, 10)
	fmt.Println(l.View())
}
