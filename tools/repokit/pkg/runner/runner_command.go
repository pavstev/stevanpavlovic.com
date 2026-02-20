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

func runCommand(name, command, cwd string) {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	cmd := createCmd(ctx, command, cwd)
	var outBuf bytes.Buffer
	var mu sync.Mutex
	var tail []string

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	go func() {
		scanner := bufio.NewScanner(io.MultiReader(stdout, stderr))
		for scanner.Scan() {
			line := scanner.Text()
			mu.Lock()
			outBuf.WriteString(line + "\n")
			tail = append(tail, line)
			if len(tail) > 5 {
				tail = tail[1:]
			}
			mu.Unlock()
		}
	}()

	ticker := time.NewTicker(80 * time.Millisecond)
	defer ticker.Stop()
	start, done := time.Now(), make(chan struct{})
	lineCount, firstRender := 0, true

	go func() {
		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				mu.Lock()
				currentTail := append([]string(nil), tail...)
				mu.Unlock()

				if !firstRender {
					fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
				}
				firstRender, lineCount = false, 1

				// UI rendering with the new theme
				spinner := Spinners[int(time.Now().UnixMilli()/80)%len(Spinners)]
				icon := Blue.Render(spinner)
				statusText := Blue.Bold(true).Render("⏳")
				durStr := fmt.Sprintf("%5.1fs", time.Since(start).Seconds())

				nameStr := lipgloss.NewStyle().Width(35).Render(name)
				statStr := lipgloss.NewStyle().Width(12).Render(statusText)

				fmt.Printf(" %s  %s %s %s\n", icon, nameStr, statStr, durStr)

				if !Quiet {
					for _, l := range currentTail {
						fmt.Println(formatTailLine(l))
						lineCount++
					}
				}
			}
		}
	}()

	err := cmd.Run()
	close(done)

	if err != nil && ctx.Err() != nil {
		fmt.Println("\n" + Yellow.Render(fmt.Sprintf("⏹️  %s cancelled.", name)))
		os.Exit(1)
	}

	if cmd.ProcessState != nil && cmd.ProcessState.Success() {
		if !Quiet && !firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
			nameStr := lipgloss.NewStyle().Width(35).Render(name)
			statStr := lipgloss.NewStyle().Width(12).Render(Green.Bold(true).Render("✅"))
			durStr := fmt.Sprintf("%5.1fs", time.Since(start).Seconds())
			fmt.Printf(" %s  %s %s %s\n", Green.Render("✓"), nameStr, statStr, durStr)
		}
		Success("%s", name)
	} else {
		if !Quiet && !firstRender {
			fmt.Print(strings.Repeat("\033[A\033[2K", lineCount))
			nameStr := lipgloss.NewStyle().Width(35).Render(name)
			statStr := lipgloss.NewStyle().Width(12).Render(Red.Bold(true).Render("❌"))
			durStr := fmt.Sprintf("%5.1fs", time.Since(start).Seconds())
			fmt.Printf(" %s  %s %s %s\n", Red.Render("✗"), nameStr, statStr, durStr)
		}
		Error("%s", name)
		BoxOutput("Failure Log: "+name, outBuf.String(), lipgloss.Color("1"))
		os.Exit(1)
	}
}

func RunInteractive(name, command, cwd string) {
	Info("Interactive Session: %s", name)
	cmd := exec.Command("bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		Error("%s failed: %v", name, err)
		os.Exit(1)
	}
	Success("%s", name)
}

func formatTailLine(line string) string {
	clean := utils.CleanANSI(line)
	if len(clean) > 85 {
		clean = clean[:82] + "..."
	}
	return tailStyle.Render("  │ " + clean)
}
