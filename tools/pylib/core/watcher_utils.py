import hashlib
import time
from collections.abc import Iterator
from pathlib import Path

from .common import glob_svgs


def get_file_hash(path: Path) -> str:
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    with open(path, "rb") as f:
        # Read and update hash string value in blocks of 4K
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()


def watch_events(
    patterns: list[str],
    paths: list[Path],
    hashes: dict[Path, str],
    interval: float = 1.0,
) -> Iterator[tuple[str, Path]]:
    """
    Monitor both explicit *paths* and any files matching *patterns* for content changes.
    Yields (label, changing_path).
    """

    def get_all_paths() -> list[Path]:
        all_p = list(paths)
        for pat in patterns:
            all_p.extend(glob_svgs(pat))
        return list(set(all_p))

    # Initial snapshot if empty
    if not hashes:
        for p in get_all_paths():
            if p.exists():
                hashes[p.resolve()] = get_file_hash(p.resolve())

    while True:
        time.sleep(interval)
        current_paths = get_all_paths()
        for p in current_paths:
            if not p.exists():
                continue
            p_res = p.resolve()

            # Check modification time first as a cheap pre-filter
            # But relying solely on mtime causes loop issues if we modify files ourselves
            # So we use hash to verify actual content change.

            try:
                current_hash = get_file_hash(p_res)
            except OSError:
                continue

            if p_res not in hashes:
                hashes[p_res] = current_hash
                yield "file created", p_res
            elif current_hash != hashes[p_res]:
                hashes[p_res] = current_hash
                label = "script updated" if p.suffix == ".py" else "file changed"
                yield label, p_res
