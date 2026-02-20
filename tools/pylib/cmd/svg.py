import glob
import hashlib
import json
import subprocess
import time
from pathlib import Path

import typer

app = typer.Typer(help="SVG Optimization Tool")

CACHE_FILE = Path(".svgcache.json")


def get_file_hash(path: Path) -> str:
    """Returns the MD5 hash of a file's contents to detect changes."""
    content = path.read_bytes()
    return hashlib.md5(content).hexdigest()


def _read_cache(file_path: Path, no_deep: bool, merge: bool, simplify: bool) -> bool:
    """
    Checks if the SVG file has already been optimized with these exact settings.
    Returns True if it's cached and unchanged, False if it needs optimization.
    """
    if not CACHE_FILE.exists():
        return False

    try:
        with open(CACHE_FILE) as f:
            cache = json.load(f)
    except (OSError, json.JSONDecodeError):
        # If cache is corrupted or empty, safely ignore it
        return False

    file_hash = get_file_hash(file_path)
    cache_key = f"{file_path}::{no_deep}::{merge}::{simplify}"

    return cache.get(cache_key) == file_hash


def _write_cache(file_path: Path, no_deep: bool, merge: bool, simplify: bool):
    """Saves the file hash to the cache after successful optimization."""
    cache = {}
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE) as f:
                cache = json.load(f)
        except (OSError, json.JSONDecodeError):
            pass  # Start fresh if corrupted

    file_hash = get_file_hash(file_path)
    cache_key = f"{file_path}::{no_deep}::{merge}::{simplify}"
    cache[cache_key] = file_hash

    with open(CACHE_FILE, "w") as f:
        json.dump(cache, f, indent=2)


def optimize_svg(file_path: Path, no_deep: bool, merge: bool, simplify: bool) -> bool:
    """Runs SVGO via pnpm to optimize the SVG file. Returns True on success."""
    cmd = ["pnpm", "exec", "svgo", str(file_path)]

    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        _write_cache(file_path, no_deep, merge, simplify)
        typer.secho(f"  ✓ Optimized: {file_path}", fg=typer.colors.GREEN)
        return True
    except subprocess.CalledProcessError as e:
        # SVGO often prints errors to stdout instead of stderr
        err_msg = (e.stderr or "").strip()
        if not err_msg:
            err_msg = (e.stdout or "").strip()
        if not err_msg:
            err_msg = f"Unknown error (exit code {e.returncode})"

        typer.secho(f"  ✗ Failed to optimize {file_path}:\n    {err_msg}", fg=typer.colors.RED)
        return False


def glob_svgs(path_glob: str) -> list[Path]:
    """Finds all SVGs matching the glob pattern."""
    matched = glob.glob(path_glob, recursive=True)
    return [Path(p) for p in matched if Path(p).is_file()]


def run_once(files: list[Path], no_deep: bool, merge: bool, simplify: bool):
    """Processes a list of files once, respecting the cache."""
    processed = 0
    failed = 0

    for f in files:
        if not f.exists():
            continue

        # If the file hasn't changed since last run, skip it!
        if _read_cache(f, no_deep, merge, simplify):
            continue

        success = optimize_svg(f, no_deep, merge, simplify)
        if success:
            processed += 1
        else:
            failed += 1

    if failed > 0:
        typer.secho(
            f"\n❌ Finished with errors! Optimized {processed}, Failed {failed}.",
            fg=typer.colors.RED,
        )
        raise typer.Exit(code=1)
    elif processed == 0:
        typer.secho("✨ All SVGs are already optimized (cached).", fg=typer.colors.BLUE)
    else:
        typer.secho(f"✅ Finished! Optimized {processed} SVG files.", fg=typer.colors.GREEN)


def run_watch_mode(path_glob: str, no_deep: bool, merge: bool, simplify: bool):
    """Continuously polls for SVG changes (simple watch mode)."""
    typer.secho(f"👀 Watching for SVG changes in: {path_glob}", fg=typer.colors.MAGENTA)
    try:
        while True:
            files = glob_svgs(path_glob)
            run_once(files, no_deep, merge, simplify)
            time.sleep(2)  # Poll every 2 seconds
    except KeyboardInterrupt:
        typer.secho("\nStopped watching.", fg=typer.colors.YELLOW)


@app.command()
def main(
    path_glob: str = typer.Argument(..., help="Glob pattern for SVGs (e.g., 'src/**/*.svg')"),
    watch: bool = typer.Option(False, "--watch", "-w", help="Watch files for changes"),
    no_deep: bool = typer.Option(False, "--no-deep", help="Disable deep optimization"),
    merge: bool = typer.Option(True, "--merge/--no-merge", help="Merge SVG paths"),
    simplify: bool = typer.Option(True, "--simplify/--no-simplify", help="Simplify SVG"),
):
    """
    Optimizes SVG files efficiently by skipping unchanged files using a JSON cache.
    """
    if watch:
        run_watch_mode(path_glob, no_deep, merge, simplify)
    else:
        files = glob_svgs(path_glob)
        if not files:
            typer.secho(f"⚠️ No SVG files found matching: {path_glob}", fg=typer.colors.YELLOW)
            return

        run_once(files, no_deep, merge, simplify)
