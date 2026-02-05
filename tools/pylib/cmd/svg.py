import dataclasses
import hashlib
import json
import logging
import shutil
import sys
import tempfile
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Annotated

import orjson
import typer

from ..core.common import IS_JSON_MODE, clear_terminal, console, glob_svgs, rel_path
from ..core.config import SVGO_CONFIG
from ..core.optimization import run_optimization_batch
from ..core.schemas import CleanupStats, FileResult
from ..core.ui import print_header, print_results
from ..core.watcher import (
    RunRecord,
    display_watch_dashboard,
)
from ..core.watcher_utils import get_file_hash, watch_events

app = typer.Typer()


CACHE_DIR_NAME = ".cache/svg_cache"
CACHE_ROOT_DIR = Path.cwd() / CACHE_DIR_NAME  # Define global cache root
CACHE_MAX_AGE_DAYS = 30  # Define cache max age


def _get_cached_paths(file_path: Path) -> tuple[Path, Path]:
    """Returns the path for the cached SVG and its metadata file in a global cache."""
    CACHE_ROOT_DIR.mkdir(exist_ok=True)
    # Use a hash of the absolute file path to create a unique name in the global cache
    file_hash = hashlib.md5(str(file_path.resolve()).encode("utf-8")).hexdigest()
    cached_svg_path = CACHE_ROOT_DIR / (file_hash + ".optimized")
    metadata_path = CACHE_ROOT_DIR / (file_hash + ".metadata.json")
    return cached_svg_path, metadata_path


def _cleanup_cache(cache_dir: Path, max_age_days: int) -> None:
    """Cleans up old cache files."""
    if not cache_dir.is_dir():
        return

    cutoff_time = datetime.now() - timedelta(days=max_age_days)

    for item in cache_dir.iterdir():
        try:
            if item.is_file():
                mod_time = datetime.fromtimestamp(item.stat().st_mtime)
                if mod_time < cutoff_time:
                    item.unlink()
            elif (
                item.is_dir()
            ):  # Recursively clean up subdirectories (e.g., individual file caches)
                _cleanup_cache(item, max_age_days)
                # If directory is empty after cleanup, remove it
                if not any(item.iterdir()):
                    item.rmdir()
        except OSError as e:
            logging.error(f"Error cleaning cache item {rel_path(item)}: {e}")


def _get_config_hash() -> str:
    """Computes a hash of the current SVGO_CONFIG."""
    config_str = json.dumps(SVGO_CONFIG, sort_keys=True)
    return hashlib.md5(config_str.encode("utf-8")).hexdigest()


def _read_cache(file_path: Path, no_deep: bool, merge: str, simplify: str) -> FileResult | None:
    """
    Attempts to read a cached FileResult if it's valid.
    Returns FileResult if valid, otherwise None.
    """
    cached_svg_path, metadata_path = _get_cached_paths(file_path)
    logging.debug(f"Checking cache for {rel_path(file_path)}")

    if not cached_svg_path.is_file():
        logging.debug(f"Cache miss: Optimized SVG not found for {rel_path(file_path)}")
        return None
    if not metadata_path.is_file():
        logging.debug(f"Cache miss: Metadata not found for {rel_path(file_path)}")
        return None

    try:
        metadata = json.loads(metadata_path.read_text())
    except json.JSONDecodeError:
        logging.warning(f"Cache invalid: Malformed metadata for {rel_path(file_path)}")
        return None

    current_hash = get_file_hash(file_path)
    if current_hash != metadata.get("original_hash"):
        logging.debug(f"Cache invalid: Hash mismatch for {rel_path(file_path)}")
        return None

    # Check if optimization parameters match
    if (
        metadata.get("no_deep") != no_deep
        or metadata.get("merge") != merge
        or metadata.get("simplify") != simplify
    ):
        logging.debug(f"Cache invalid: Parameter mismatch for {rel_path(file_path)}")
        return None

    # Check if SVGO_CONFIG hash matches
    if _get_config_hash() != metadata.get("svgo_config_hash"):
        logging.debug(f"Cache invalid: SVGO_CONFIG hash mismatch for {rel_path(file_path)}")
        return None

    if not cached_svg_path.exists():
        logging.debug(f"Cache invalid: Cached SVG file missing for {rel_path(file_path)}")
        return None

    new_size = cached_svg_path.stat().st_size
    cached_result = FileResult(
        path=rel_path(file_path),
        orig=metadata.get("original_size"),
        new=new_size,
        elapsed=metadata.get("elapsed", 0.0),
        stats=None,
        cached=True,
    )
    if "stats" in metadata and metadata["stats"] is not None:
        cached_result.stats = CleanupStats(**metadata["stats"])

    logging.debug(f"Cache hit for {rel_path(file_path)}")
    return cached_result


def _write_cache(
    file_path: Path,
    file_result: FileResult,
    no_deep: bool,
    merge: str,
    simplify: str,
) -> None:
    """Writes the optimized SVG and its metadata to the cache."""
    cached_svg_path, metadata_path = _get_cached_paths(file_path)

    try:
        # Ensure the optimized file actually exists before copying
        if not file_path.is_file():
            logging.error(f"Optimized file not found for caching: {file_path}")
            return

        # Copy the optimized file (which is in-place at file_path) to the cache location
        shutil.copy2(file_path, cached_svg_path)

        metadata = {
            "original_hash": get_file_hash(file_path),
            "original_size": file_result.orig,
            "new_size": file_result.new,
            "elapsed": file_result.elapsed,
            "no_deep": no_deep,
            "merge": merge,
            "simplify": simplify,
            "svgo_config_hash": _get_config_hash(),  # Add SVGO_CONFIG hash
            "stats": dataclasses.asdict(file_result.stats) if file_result.stats else None,
        }

        # Write to a temporary file and then atomically rename it for safety
        with tempfile.NamedTemporaryFile(mode="w", delete=False, dir=metadata_path.parent) as tf:
            tf.write(json.dumps(metadata, indent=2))
        shutil.move(tf.name, metadata_path)
    except Exception as e:
        logging.error(f"Error writing cache for {rel_path(file_path)}: {e}")


def run_once(
    files: list[Path],
    no_deep: bool,
    merge: str,
    simplify: str,
) -> None:
    """Run optimization once on the given files."""
    if not files:
        if not IS_JSON_MODE:
            console.print("[yellow]No files matched[/yellow]", style="yellow")
        else:
            print(orjson.dumps([]).decode())
        return

    all_results: list[FileResult] = []
    files_to_optimize: list[Path] = []

    # Try to read from cache for each file
    for f in files:
        cached_result = _read_cache(f, no_deep, merge, simplify)
        if cached_result:
            all_results.append(cached_result)
        else:
            files_to_optimize.append(f)

    # Run optimization only for files not found in cache or invalid
    if files_to_optimize:
        optimized_results = run_optimization_batch(
            files_to_optimize,
            no_deep=no_deep,
            merge=merge,
            simplify=simplify,
            show_progress=not IS_JSON_MODE,
        )
        all_results.extend(optimized_results)

        # Write newly optimized files to cache
        for r in optimized_results:
            # Re-resolve path to ensure it's absolute for _write_cache
            original_file_path = Path(r.path) if Path(r.path).is_absolute() else Path.cwd() / r.path
            _write_cache(original_file_path, r, no_deep, merge, simplify)

    if IS_JSON_MODE:
        data = [dataclasses.asdict(r) for r in all_results]
        print(orjson.dumps(data).decode())
    else:
        print_results(all_results)


def run_watch_mode(
    path_glob: str,
    no_deep: bool,
    merge: str,
    simplify: str,
) -> None:
    """Run in watch mode."""
    # Watch all python files in the package (recursively in pylib/)
    # We are in pylib/cmd/fix_svg.py -> pylib/
    package_dir = Path(__file__).parent.parent.resolve()
    script_paths = list(package_dir.glob("**/*.py"))

    history: list[RunRecord] = []
    hashes: dict[Path, str] = {}
    MAX_HISTORY = 8

    # Initialize hashes
    for p in script_paths:
        if p.exists():
            hashes[p] = get_file_hash(p)

    # Initial Run
    initial_files = glob_svgs(path_glob)
    initial_all_results: list[FileResult] = []
    initial_files_to_optimize: list[Path] = []

    if initial_files:
        for f in initial_files:
            cached_result = _read_cache(f, no_deep, merge, simplify)
            if cached_result:
                initial_all_results.append(cached_result)
            else:
                initial_files_to_optimize.append(f)

        if initial_files_to_optimize:
            initial_optimized_results = run_optimization_batch(
                initial_files_to_optimize,
                no_deep=no_deep,
                merge=merge,
                simplify=simplify,
                show_progress=True,
            )
            initial_all_results.extend(initial_optimized_results)
            for r in initial_optimized_results:
                original_file_path = (
                    Path(r.path) if Path(r.path).is_absolute() else Path.cwd() / r.path
                )
                _write_cache(original_file_path, r, no_deep, merge, simplify)

    # Initialize history
    if initial_all_results:
        # Sum up bytes_saved and irregularity_count from all_initial_results
        total_bytes_saved = sum(r.saved for r in initial_all_results)
        total_irregularity_count = sum(r.stats.total for r in initial_all_results if r.stats)
        rec = RunRecord(
            timestamp=time.time(),
            trigger="initial run",
            file_count=len(initial_all_results),
            bytes_saved=total_bytes_saved,
            irregularity_count=total_irregularity_count,
            success=True,
        )
        history.append(rec)
        for r in initial_all_results:
            p = (Path.cwd() / r.path).resolve()
            if p.exists():
                hashes[p] = get_file_hash(p)

    display_watch_dashboard(initial_all_results, history, path_glob)

    try:
        for event_type, path in watch_events([path_glob], script_paths, hashes):
            t0 = time.time()
            trigger = f"{event_type}: {rel_path(path)}"
            if "script updated" in trigger:
                console.print("[bold cyan]Script updated, restarting...[/bold cyan]")
                sys.exit(3)

            clear_terminal()
            print_header()

            current_files = glob_svgs(path_glob)
            all_results_this_iteration: list[FileResult] = []
            files_to_optimize_this_iteration: list[Path] = []

            for f in current_files:
                cached_result = _read_cache(f, no_deep, merge, simplify)
                if cached_result:
                    all_results_this_iteration.append(cached_result)
                else:
                    files_to_optimize_this_iteration.append(f)

            if not current_files:
                console.print(f"[yellow]No SVG files matched: {path_glob}[/yellow]")
                record = RunRecord(
                    timestamp=t0,
                    trigger=trigger,
                    file_count=0,
                    bytes_saved=0,
                    irregularity_count=0,
                    success=False,
                )
            else:
                if files_to_optimize_this_iteration:
                    optimized_results = run_optimization_batch(
                        files_to_optimize_this_iteration,
                        no_deep=no_deep,
                        merge=merge,
                        simplify=simplify,
                        show_progress=True,
                    )
                    all_results_this_iteration.extend(optimized_results)
                    for r in optimized_results:
                        original_file_path = (
                            Path(r.path) if Path(r.path).is_absolute() else Path.cwd() / r.path
                        )
                        _write_cache(original_file_path, r, no_deep, merge, simplify)

                # Sum up bytes_saved and irregularity_count from all_results_this_iteration
                total_bytes_saved = sum(r.saved for r in all_results_this_iteration)
                total_irregularity_count = sum(
                    r.stats.total for r in all_results_this_iteration if r.stats
                )
                record = RunRecord(
                    timestamp=t0,
                    trigger=trigger,
                    file_count=len(all_results_this_iteration),
                    bytes_saved=total_bytes_saved,
                    irregularity_count=total_irregularity_count,
                    success=True,  # Assuming success if we got results, even if all were cached
                )

                if all_results_this_iteration:
                    for r in all_results_this_iteration:
                        p = (Path.cwd() / r.path).resolve()
                        if p.exists():
                            hashes[p] = get_file_hash(p)

            history.append(record)
            if len(history) > MAX_HISTORY:
                history.pop(0)

            display_watch_dashboard(all_results_this_iteration, history, path_glob)

    except KeyboardInterrupt:
        console.print()
        console.print("[bold]Watch mode stopped.[/bold]")


def main(
    path_glob: Annotated[str, typer.Argument(help="Glob pattern for SVG files")],
    watch: Annotated[bool, typer.Option("--watch", "-w", help="Watch for changes")] = False,
    no_deep: Annotated[bool, typer.Option(help="Skip deep simplification")] = False,
    merge: Annotated[str, typer.Option(help="Merge tolerance")] = "0.1mm",
    simplify: Annotated[str, typer.Option(help="Simplify tolerance")] = "0.05mm",
) -> None:
    """
    Optimize SVG files using the full pipeline (vpype -> svgo -> xml cleanup).
    """
    logging.basicConfig(level=logging.DEBUG, format="%(levelname)s: %(message)s")

    # Call cache cleanup at the start
    _cleanup_cache(CACHE_ROOT_DIR, CACHE_MAX_AGE_DAYS)

    if watch:
        if IS_JSON_MODE:
            console.print("[red]Watch mode not supported with --json[/red]")
            raise typer.Exit(1)
        run_watch_mode(path_glob, no_deep, merge, simplify)
    else:
        files = glob_svgs(path_glob)
        run_once(files, no_deep, merge, simplify)
