import time
from dataclasses import dataclass
from pathlib import Path

from rich.table import Table

from .common import clear_terminal, console
from .filesystem import analyze_path_irregularities
from .schemas import FileResult
from .ui import print_header, print_results


@dataclass
class RunRecord:
    timestamp: float
    trigger: str
    file_count: int
    bytes_saved: int
    irregularity_count: int
    success: bool

    @property
    def when(self) -> str:
        dt = time.time() - self.timestamp
        if dt < 60:
            return f"{int(dt)}s ago"
        return f"{int(dt / 60)}m ago"

    @property
    def summary(self) -> str:
        if not self.success:
            return "[red]Failed[/red]"

        parts = []
        if self.bytes_saved >= 102:
            saved_str = f"{self.bytes_saved / 1024:.1f}KB"
            parts.append(f"[green]{saved_str} saved[/green]")
        elif self.bytes_saved > 0:
            parts.append(f"[green]{self.bytes_saved}B saved[/green]")
        else:
            parts.append("[dim]no savings[/dim]")

        if self.irregularity_count > 0:
            parts.append(f"[yellow]{self.irregularity_count} issues[/yellow]")

        if not parts:
            return "[dim]No changes[/dim]"

        return ", ".join(parts)


def record_from_results(results: list[FileResult], trigger: str, t0: float) -> RunRecord:
    """Create a RunRecord from a completed batch of results."""
    success = bool(results)
    files = [Path(r.path) for r in results]
    bytes_saved = sum(r.saved for r in results) if results else 0

    irregularities = 0
    if success:
        for f in files:
            # Resolve relative paths back to absolute to check them
            # FileResult.path is usually relative to project root or similar.
            # Best effort resolution against CWD.
            p = Path.cwd() / f
            findings = analyze_path_irregularities(p)
            irregularities += sum(len(issues) for _, issues in findings)

    return RunRecord(
        timestamp=t0,
        trigger=trigger,
        file_count=len(results),
        bytes_saved=bytes_saved,
        irregularity_count=irregularities,
        success=success,
    )


def print_run_history(history: list[RunRecord]) -> None:
    """Print a compact table of the last few watch-mode runs."""
    if not history:
        return
    table = Table(box=None, padding=(0, 2), show_header=True, pad_edge=False)
    table.add_column("Time", style="dim", no_wrap=True)
    table.add_column("Trigger", style="dim", no_wrap=True)
    table.add_column("Result", no_wrap=True)
    for r in reversed(history):
        table.add_row(r.when, r.trigger, r.summary)
    console.print(table)


def print_watching(glob_pattern: str) -> None:
    console.print(
        f"  [dim]Watching [path]{glob_pattern}[/path] - press [bold]Ctrl+C[/bold] to stop[/dim]"
    )


def display_watch_dashboard(
    results: list[FileResult], history: list[RunRecord], glob_pattern: str
) -> None:
    """Clear screen and print the full dashboard (Header, Last Result, History, Footer)."""
    clear_terminal()

    print_header()
    if results:
        print_results(results)
    else:
        pass

    console.print()
    print_run_history(history)
    print_watching(glob_pattern)
