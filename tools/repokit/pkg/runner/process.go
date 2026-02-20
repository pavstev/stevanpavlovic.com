package runner

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"os/signal"
	"repokit/pkg/core"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/charmbracelet/lipgloss"
)

func createCmd(ctx context.Context, command, cwd string) *exec.Cmd {
	cmd := exec.CommandContext(ctx, "bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error {
		if cmd.Process == nil {
			return nil
		}
		pgid, err := syscall.Getpgid(cmd.Process.Pid)
		if err == nil {
			_ = syscall.Kill(-pgid, syscall.SIGTERM)
			time.AfterFunc(2*time.Second, func() { _ = syscall.Kill(-pgid, syscall.SIGKILL) })
			return nil
		}
		return cmd.Process.Kill()
	}
	return cmd
}

type commandUI struct {
	name        string
	mu          sync.Mutex
	outBuf      bytes.Buffer
	tail        []string
	start       time.Time
	lineCount   int
	firstRender bool
}

func runCommand(name, command, cwd string) {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cmd := createCmd(ctx, command, cwd)
	ui := &commandUI{
		name:        name,
		start:       time.Now(),
		firstRender: true,
	}

	ui.capture(cmd)

	done := make(chan struct{})
	go ui.renderLoop(done)

	err := cmd.Run()
	close(done)

	if err != nil && ctx.Err() != nil {
		fmt.Println("\n" + core.Yellow.Render(fmt.Sprintf("⏹️  %s cancelled.", name)))
		os.Exit(1)
	}

	ui.printResult(cmd)
}

func (ui *commandUI) capture(cmd *exec.Cmd) {
	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	go func() {
		scanner := bufio.NewScanner(io.MultiReader(stdout, stderr))
		for scanner.Scan() {
			line := scanner.Text()
			ui.mu.Lock()
			ui.outBuf.WriteString(line + "\n")
			ui.tail = append(ui.tail, line)
			if len(ui.tail) > 5 {
				ui.tail = ui.tail[1:]
			}
			ui.mu.Unlock()
		}
	}()
}

func (ui *commandUI) renderLoop(done <-chan struct{}) {
	ticker := time.NewTicker(80 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			ui.mu.Lock()
			currentTail := append([]string(nil), ui.tail...)
			ui.mu.Unlock()

			if !ui.firstRender {
				fmt.Print(strings.Repeat("\033[A\033[2K", ui.lineCount))
			}
			ui.firstRender = false
			ui.lineCount = 1

			spinner := core.Spinners[int(time.Now().UnixMilli()/80)%len(core.Spinners)]
			icon := core.Blue.Render(spinner)
			statusText := core.Blue.Bold(true).Render(core.IconPending)
			durStr := fmt.Sprintf("%5.1fs", time.Since(ui.start).Seconds())

			ui.printLine(icon, statusText, durStr)

			if !core.Quiet {
				for _, l := range currentTail {
					fmt.Println(formatTailLine(l))
					ui.lineCount++
				}
			}
		}
	}
}

func (ui *commandUI) printLine(icon, statusText, durStr string) {
	padLen := 38 - lipgloss.Width(ui.name)
	if padLen < 2 {
		padLen = 2
	}
	dots := core.Subtle.Render(strings.Repeat(".", padLen))
	nameStr := ui.name + " " + dots
	statStr := lipgloss.NewStyle().Width(4).Render(statusText)

	fmt.Printf(" %s  %s %s %s\n", icon, nameStr, statStr, durStr)
}

func (ui *commandUI) printResult(cmd *exec.Cmd) {
	if cmd.ProcessState != nil && cmd.ProcessState.Success() {
		if !core.Quiet && !ui.firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", ui.lineCount))
			icon := core.Green.Render("•")
			statusText := core.Green.Bold(true).Render(core.IconSuccess)
			durStr := fmt.Sprintf("%5.1fs", time.Since(ui.start).Seconds())
			ui.printLine(icon, statusText, durStr)
		}
	} else {
		if !core.Quiet && !ui.firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", ui.lineCount))
			icon := core.Red.Render("•")
			statusText := core.Red.Bold(true).Render(core.IconError)
			durStr := fmt.Sprintf("%5.1fs", time.Since(ui.start).Seconds())
			ui.printLine(icon, statusText, durStr)
		}
		core.BoxOutput("Failure Log: "+ui.name, ui.outBuf.String(), lipgloss.Color("1"))
		os.Exit(1)
	}
}

func RunInteractive(name, command, cwd string) {
	isNested := os.Getenv("REPOKIT_NESTED") == "1"
	if !isNested {
		core.Info("Interactive Session: %s", name)
	}

	cmd := exec.Command("bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		core.Error("%s failed: %v", name, err)
		os.Exit(1)
	}
}

func formatTailLine(line string) string {
	clean := core.CleanANSI(line)
	if len(clean) > 85 {
		clean = clean[:82] + "..."
	}
	return tailStyle.Render("  │ " + clean)
}
