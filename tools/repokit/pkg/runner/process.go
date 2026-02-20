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
	"strings"
	"sync"
	"syscall"
	"time"

	"repokit/pkg/log"
	"repokit/pkg/utils"

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
		fmt.Println("\n" + log.Yellow.Render(fmt.Sprintf("⏹️  %s cancelled.", name)))
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

			spinner := log.Spinners[int(time.Now().UnixMilli()/80)%len(log.Spinners)]
			icon := log.Blue.Render(spinner)
			statusText := log.Blue.Bold(true).Render("⏳")
			durStr := fmt.Sprintf("%5.1fs", time.Since(ui.start).Seconds())

			ui.printLine(icon, statusText, durStr)

			if !log.Quiet {
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
	dots := log.Subtle.Render(strings.Repeat(".", padLen))
	nameStr := ui.name + " " + dots
	statStr := lipgloss.NewStyle().Width(4).Render(statusText)

	fmt.Printf(" %s  %s %s %s\n", icon, nameStr, statStr, durStr)
}

func (ui *commandUI) printResult(cmd *exec.Cmd) {
	if cmd.ProcessState != nil && cmd.ProcessState.Success() {
		if !log.Quiet && !ui.firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", ui.lineCount))
			icon := log.Green.Render("•")
			statusText := log.Green.Bold(true).Render("✅")
			durStr := fmt.Sprintf("%5.1fs", time.Since(ui.start).Seconds())
			ui.printLine(icon, statusText, durStr)
		}
		log.Success("%s", ui.name)
	} else {
		if !log.Quiet && !ui.firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", ui.lineCount))
			icon := log.Red.Render("•")
			statusText := log.Red.Bold(true).Render("❌")
			durStr := fmt.Sprintf("%5.1fs", time.Since(ui.start).Seconds())
			ui.printLine(icon, statusText, durStr)
		}
		log.Error("%s", ui.name)
		log.BoxOutput("Failure Log: "+ui.name, ui.outBuf.String(), lipgloss.Color("1"))
		os.Exit(1)
	}
}

func RunInteractive(name, command, cwd string) {
	log.Info("Interactive Session: %s", name)
	cmd := exec.Command("bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		log.Error("%s failed: %v", name, err)
		os.Exit(1)
	}
	log.Success("%s", name)
}

func formatTailLine(line string) string {
	clean := utils.CleanANSI(line)
	if len(clean) > 85 {
		clean = clean[:82] + "..."
	}
	return tailStyle.Render("  │ " + clean)
}
