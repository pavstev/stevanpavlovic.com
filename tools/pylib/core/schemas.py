import datetime
import time
from dataclasses import dataclass, field
from pathlib import Path

from .common import rel_path


@dataclass
class CleanupStats:
    attrs_removed: int = 0
    groups_removed: int = 0
    comments_removed: int = 0

    @property
    def total(self) -> int:
        return self.attrs_removed + self.groups_removed + self.comments_removed

    def __str__(self) -> str:
        parts = []
        if self.attrs_removed:
            parts.append(f"{self.attrs_removed} attr{'s' if self.attrs_removed != 1 else ''}")
        if self.groups_removed:
            parts.append(
                f"{self.groups_removed} empty group{'s' if self.groups_removed != 1 else ''}"
            )
        if self.comments_removed:
            parts.append(
                f"{self.comments_removed} comment{'s' if self.comments_removed != 1 else ''}"
            )
        return ", ".join(parts) if parts else "nothing"


@dataclass
class FileResult:
    path: str
    orig: int
    new: int
    elapsed: float
    stats: CleanupStats | None = None
    cached: bool = False

    @property
    def saved(self) -> int:
        return max(0, self.orig - self.new)

    @property
    def pct(self) -> float:
        return (self.saved / self.orig * 100) if self.orig > 0 else 0.0


@dataclass
class FileTiming:
    """Tracks pre/post sizes for a single file during batch processing."""

    path: Path
    orig: int
    t0: float = field(default_factory=time.time)

    def to_result(self, stats: CleanupStats | None = None) -> FileResult:
        return FileResult(
            path=rel_path(self.path),
            orig=self.orig,
            new=self.path.stat().st_size,
            elapsed=time.time() - self.t0,
            stats=stats,
        )


@dataclass
class PathIrregularity:
    kind: str  # short label
    detail: str  # human-readable description
    segment_idx: int  # index of the offending segment


@dataclass
class RunRecord:
    timestamp: float  # time.time() at run start
    trigger: str  # human label, e.g. "script updated"
    file_count: int  # SVGs processed
    bytes_saved: int  # total bytes reclaimed (0 on failure)
    irregularity_count: int  # total path issues found
    success: bool

    @property
    def when(self) -> str:
        return datetime.datetime.fromtimestamp(self.timestamp).strftime("%H:%M:%S")

    @property
    def summary(self) -> str:
        if not self.success:
            return "[error]failed[/error]"
        parts = [
            f"{self.file_count} file{'s' if self.file_count != 1 else ''}",
            f"{self.bytes_saved / 1024:+.1f} KB",
        ]
        if self.irregularity_count:
            parts.append(
                f"[warning]{self.irregularity_count} issue"
                f"{'s' if self.irregularity_count != 1 else ''}[/warning]"
            )
        return "  ".join(parts)
