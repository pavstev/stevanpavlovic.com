import glob
import shutil
import subprocess
import sys
from pathlib import Path
from typing import TYPE_CHECKING

from rich.console import Console

from .config import THEME

if TYPE_CHECKING:
    from .schemas import FileResult

# Global console instance
# We default to stderr=False, but in the CLI if --json is passed, we might want to suppress this.
# For now, we use the standard configured theme.
console: Console = Console(theme=THEME)

IS_JSON_MODE = False


def set_json_mode(enabled: bool) -> None:
    global IS_JSON_MODE
    IS_JSON_MODE = enabled
    if enabled:
        console.quiet = True


def rel_path(path: Path) -> str:
    try:
        return str(path.relative_to(Path.cwd()))
    except ValueError:
        return str(path)


def fmt_kb(n: int) -> str:
    return f"{n / 1024:.1f}K"


def fmt_time(seconds: float) -> str:
    if seconds < 1:
        return f"{seconds * 1000:.0f}ms"
    if seconds < 60:
        return f"{seconds:.1f}s"
    m, s = divmod(int(seconds), 60)
    return f"{m}m {s:02d}s"


def fmt_savings(result: "FileResult") -> str:
    if result.saved <= 0:
        return "-"
    if result.saved < 102:
        return f"{result.saved}B"
    return f"{fmt_kb(result.saved)} ({result.pct:.1f}%)"


def run_cli(cmd: list[str]) -> bool:
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        return True
    except subprocess.CalledProcessError as e:
        err = e.stderr.decode().strip()
        console.print(f"\n[error]Failure in {cmd[0]}:[/error] [dim]{err}[/dim]")
        return False


def require_vpype() -> None:
    if not shutil.which("vpype"):
        console.print("[error]Critical: 'vpype' not found.[/error]")
        sys.exit(1)


def glob_svgs(pattern: str) -> list[Path]:
    return [Path(f) for f in glob.glob(pattern, recursive=True) if f.lower().endswith(".svg")]


def clear_terminal() -> None:
    """Clear the terminal screen and scrollback buffer."""
    # \033[3J clears scrollback buffer (xterm extension)
    # \033[2J clears entire screen
    # \033[H moves cursor to home
    print("\033[3J\033[2J\033[H", end="", flush=True)
    console.clear()


def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    import re

    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = text.strip("-")
    return text
