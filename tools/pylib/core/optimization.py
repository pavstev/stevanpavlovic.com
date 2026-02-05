import json
import shutil
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from .common import run_cli
from .config import SVGO_CONFIG
from .filesystem import log_irregularities, postprocess_xml
from .schemas import FileResult, FileTiming
from .ui import make_progress


def _vpype_file_block(file_path: Path, no_deep: bool, merge: str, simplify: str) -> list[str]:
    """Return the vpype sub-commands for a single file (read … write)."""
    tokens: list[str] = ["read", str(file_path)]
    if not no_deep:
        tokens += ["splitall", "snap", merge, "reloop"]
    simplify_val = simplify if no_deep else "0.01mm"
    tokens += [
        "linemerge",
        "-t",
        merge,
        "occult",
        "linesimplify",
        "-t",
        simplify_val,
        "linesort",
        "write",
        str(file_path),
    ]
    return tokens


def run_vpype_batch(
    files: list[Path], no_deep: bool = False, merge: str = "0.1mm", simplify: str = "0.05mm"
) -> bool:
    """Run vpype once for all files, paying startup cost only once."""
    cmd = ["vpype"]
    for f in files:
        cmd += _vpype_file_block(f, no_deep, merge, simplify)
    return run_cli(cmd)


def run_svgo_batch(files: list[Path]) -> None:
    """Run svgo once for all files."""
    svgo = shutil.which("svgo")
    if not svgo:
        return
    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as tf:
        json.dump(SVGO_CONFIG, tf)
        config_path = tf.name
    try:
        run_cli([svgo, *[str(f) for f in files], "--multipass", "--config", config_path])
    finally:
        Path(config_path).unlink(missing_ok=True)


def _postprocess_all(timings: list[FileTiming]) -> list[FileResult]:
    """Run XML postprocessing in parallel and collect results."""

    def process(t: FileTiming) -> FileResult:
        stats = postprocess_xml(t.path)
        return t.to_result(stats=stats)

    if len(timings) > 1:
        with ThreadPoolExecutor() as ex:
            return list(ex.map(process, timings))
    return [process(t) for t in timings]


def run_optimization_batch(
    files: list[Path],
    no_deep: bool = False,
    merge: str = "0.1mm",
    simplify: str = "0.05mm",
    show_progress: bool = True,
) -> list[FileResult]:
    """
    Three-step pipeline, each step fires exactly ONE subprocess regardless of
    how many files are in the batch:
      1. vpype  - geometry healing (one call, all files)
      2. svgo   - XML minification  (one call, all files)
      3. Python - metadata strip + fill (parallel threads, no subprocess)
    """
    # Snapshot sizes and start times before any tool touches the files
    timings = [FileTiming(path=f, orig=f.stat().st_size) for f in files if f.exists()]

    if show_progress:
        with make_progress() as progress:
            task = progress.add_task("[white]Optimizing…", total=3)

            progress.update(task, description="[white]vpype - geometry healing...")
            if not run_vpype_batch(files, no_deep, merge, simplify):
                return []
            progress.advance(task)

            progress.update(task, description="[white]svgo - minifying...")
            run_svgo_batch(files)
            progress.advance(task)

            progress.update(task, description="[white]xml - postprocessing...")
            results = _postprocess_all(timings)
            progress.advance(task)
    else:
        # No progress bar (for JSON output or non-interactive)
        if not run_vpype_batch(files, no_deep, merge, simplify):
            return []
        run_svgo_batch(files)
        results = _postprocess_all(timings)

    # Run irregularity analysis after all tools have finished
    for ft in timings:
        log_irregularities(ft.path)

    return results
