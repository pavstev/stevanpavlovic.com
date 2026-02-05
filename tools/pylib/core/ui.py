from rich.progress import (
    BarColumn,
    Progress,
    SpinnerColumn,
    TaskProgressColumn,
    TextColumn,
)
from rich.table import Table

from .common import console, fmt_kb, fmt_savings, fmt_time
from .schemas import FileResult


def make_progress() -> Progress:
    return Progress(
        SpinnerColumn(spinner_name="dots", style="brand"),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(bar_width=None, pulse_style="brand"),
        TaskProgressColumn(),
        console=console,
        transient=True,
    )


def print_header() -> None:
    console.print("[brand]SVG OPTIMIZER PRO[/brand] [dim]• Geometric Healing[/dim]")


def build_table(results: list[FileResult]) -> Table:
    table = Table(
        header_style="brand",
        box=None,
        padding=(0, 2),
        show_footer=True,
        pad_edge=False,
    )
    table.add_column("File", style="path", footer="[bold]Total Summary[/bold]")
    table.add_column("Original", justify="right")
    table.add_column("Optimized", justify="right")
    table.add_column("Savings", justify="right", style="success")
    table.add_column("Cleanup", justify="left", style="info")
    table.add_column("Time", justify="right", style="dim")

    t_orig = t_new = t_cleaned = 0
    t_time = 0.0
    for r in results:
        t_orig += r.orig
        t_new += r.new
        t_time += r.elapsed
        cleanup_str = str(r.stats) if r.stats else "nothing"
        t_cleaned += r.stats.total if r.stats else 0
        table.add_row(
            r.path,
            fmt_kb(r.orig),
            fmt_kb(r.new),
            fmt_savings(r),
            cleanup_str,
            fmt_time(r.elapsed),
        )

    total_saved = max(0, t_orig - t_new)
    total_pct = (total_saved / t_orig * 100) if t_orig > 0 else 0
    table.columns[1].footer = f"[bold]{fmt_kb(t_orig)}[/bold]"
    table.columns[2].footer = f"[bold]{fmt_kb(t_new)}[/bold]"

    if total_saved >= 102:
        savings_footer = f"{fmt_kb(total_saved)} ({total_pct:.1f}%)"
    elif total_saved > 0:
        savings_footer = f"{total_saved}B"
    else:
        savings_footer = "-"

    table.columns[3].footer = f"[bold success]{savings_footer}[/bold success]"
    if t_cleaned > 0:
        table.columns[4].footer = f"[bold info]{t_cleaned} items[/bold info]"
    table.columns[5].footer = f"[dim bold]{fmt_time(t_time)}[/dim bold]"
    return table


def print_results(results: list[FileResult]) -> None:
    if not results:
        console.print("[error]Optimization failed for all files.[/error]")
        return
    total_saved = sum(r.saved for r in results)
    console.print(build_table(results))
    saved_str = f"{total_saved / 1024:.2f} KB" if total_saved >= 102 else f"{total_saved} B"
    console.print(
        f"  [success]✔ Optimization Complete![/success] Total storage reclaimed: "
        f"[bold]{saved_str}[/bold]"
    )
