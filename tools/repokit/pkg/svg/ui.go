package svg

import (
	"fmt"
	"repokit/pkg/core"
	"strings"
	"sync/atomic"
	"time"
)

func (o *optimizer) renderUI(start time.Time, done <-chan struct{}) {
	ticker := time.NewTicker(uiTickRate)
	defer ticker.Stop()
	lines, first, tick := 0, true, 0
	for {
		select {
		case <-done:
			return
		case <-ticker.C:
			if !first {
				core.Info("%s", strings.Repeat("\033[A\033[2K", lines))
			}
			first, lines = false, o.drawFrame(start, tick)
			tick++
		}
	}
}

func (o *optimizer) drawFrame(start time.Time, tick int) int {
	o.mu.Lock()
	defer o.mu.Unlock()
	p := atomic.LoadInt32(&o.processed)
	spinner := core.Spinners[tick%len(core.Spinners)]
	core.Info("  %s SVG Intelligence %s [%d/%d] (%.1fs)", blueStyle.Render(spinner), goldStyle.Render("🧠 GEOMETER"), p, len(o.files), time.Since(start).Seconds())
	for _, s := range o.workerStates {
		if !s.active {
			core.Info("%s", formatProgressLine(tailStyle.Render("•"), "idle", ""))
		} else {
			icon := blueStyle.Render(spinner)
			core.Info("%s", formatProgressLine(icon, s.path, fmt.Sprintf("%.1fs", time.Since(s.startTime).Seconds())))
		}
	}
	return len(o.workerStates) + 1
}

func (o *optimizer) report() error {
	failed, tBefore, tAfter := atomic.LoadInt32(&o.failedCount), 0, 0
	for _, r := range o.results {
		tBefore += r.NodesBefore
		tAfter += r.NodesAfter
	}

	if failed == 0 {
		reduction := 0.0
		if tBefore > 0 {
			reduction = 100 * (1 - float64(tAfter)/float64(tBefore))
		}
		core.Success("Intelligence Pass: %d -> %d nodes (%.1f%% geometric density reduction)", tBefore, tAfter, reduction)
		return nil
	}
	return fmt.Errorf("failed to process %d files", failed)
}

func formatProgressLine(icon, path, suffix string) string {
	clean := core.CleanANSI(path)
	if len([]rune(clean)) > pathMaxLen {
		path = "..." + string([]rune(clean)[len([]rune(clean))-(pathMaxLen-3):])
	}
	return fmt.Sprintf("  %s %-60s %s", icon, path, tailStyle.Render(suffix))
}
