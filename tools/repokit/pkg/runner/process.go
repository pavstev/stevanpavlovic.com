package runner

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os"
	"os/exec"
	"os/signal"
	"syscall"
	"time"

	"repokit/pkg/core"
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

	core.PublishEvent(core.EventTaskStart, name, command)

	cmd := createCmd(ctx, command, cwd)

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	go func() {
		scanner := bufio.NewScanner(io.MultiReader(stdout, stderr))
		for scanner.Scan() {
			line := scanner.Text()
			core.PublishEvent(core.EventTaskLog, name, line)
			if !core.TuiMode && !core.Quiet {
				clean := core.CleanANSI(line)
				if len(clean) > 85 {
					clean = clean[:82] + "..."
				}
				fmt.Printf("  │ %s\n", clean)
			}
		}
	}()

	err := cmd.Run()

	if err != nil {
		if ctx.Err() != nil {
			core.PublishEvent(core.EventTaskError, name, "cancelled")
			if !core.TuiMode {
				fmt.Println("\n" + core.Yellow.Render(fmt.Sprintf("⏹️  %s cancelled.", name)))
				os.Exit(1)
			}
			panic(fmt.Sprintf("%s cancelled", name))
		}
		core.PublishEvent(core.EventTaskError, name, err.Error())
		if !core.TuiMode {
			core.Error("%s failed: %v", name, err)
			os.Exit(1)
		}
		panic(fmt.Sprintf("%s failed: %v", name, err))
	}

	core.PublishEvent(core.EventTaskDone, name, "")
	if !core.TuiMode && !core.Quiet {
		fmt.Printf(" %s  %s\n", core.Green.Render("•"), name)
	}
}

func RunInteractive(name, command, cwd string) {
	isNested := os.Getenv("REPOKIT_NESTED") == "1"
	if !isNested && !core.TuiMode {
		core.Info("Interactive Session: %s", name)
	}

	cmd := exec.Command("bash", "-c", command)
	if cwd != "" && cwd != "." {
		cmd.Dir = cwd
	}
	cmd.Stdin, cmd.Stdout, cmd.Stderr = os.Stdin, os.Stdout, os.Stderr
	if err := cmd.Run(); err != nil {
		if !core.TuiMode {
			core.Error("%s failed: %v", name, err)
			os.Exit(1)
		}
		panic(fmt.Sprintf("%s failed: %v", name, err))
	}
}
