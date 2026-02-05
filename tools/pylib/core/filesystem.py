import math
import re
import xml.etree.ElementTree as ET
from pathlib import Path

from rich.panel import Panel

from .common import console, rel_path
from .config import (
    JUNK_NS_PREFIXES,
    NOOP_ATTR_VALUES,
    REDUNDANT_ATTRS,
    STRIP_TAGS,
    SVG_NS,
)
from .schemas import CleanupStats, PathIrregularity

# --------------------------------------------------------------------------- #
# XML Cleaning Tools
# --------------------------------------------------------------------------- #


def parent_map(root: ET.Element) -> dict[ET.Element, ET.Element]:
    return {child: parent for parent in root.iter() for child in parent}


def strip_metadata(root: ET.Element) -> None:
    parents = parent_map(root)
    for tag in STRIP_TAGS:
        for el in root.findall(f".//{tag}"):
            if (p := parents.get(el)) is not None:
                p.remove(el)


def set_color_variables(root: ET.Element) -> None:
    """Set fill and stroke to use CSS variables with currentColor fallback."""
    tags = [
        "path",
        "polygon",
        "g",
        f"{{{SVG_NS}}}path",
        f"{{{SVG_NS}}}polygon",
        f"{{{SVG_NS}}}g",
    ]
    for tag in tags:
        for el in root.iter(tag):
            # Fill: set if not explicitly 'none' and doesn't already have a variable
            fill = el.get("fill")
            if tag not in ["g", f"{{{SVG_NS}}}g"]:
                if fill != "none" and not (fill and fill.startswith("var(")):
                    el.set("fill", "var(--logo-fill, currentColor)")
            else:
                # For groups, only set if it already had a fill (to avoid breaking things)
                if fill and fill != "none" and not fill.startswith("var("):
                    el.set("fill", "var(--logo-fill, currentColor)")

            # Stroke: only set if it already exists and doesn't have a variable
            stroke = el.get("stroke")
            if stroke and not stroke.startswith("var("):
                el.set("stroke", "var(--logo-stroke, currentColor)")


def _attr_is_junk(name: str, value: str) -> bool:
    """Return True if the attribute can be safely removed."""
    # Strip namespace-qualified editor attributes (inkscape:*, sodipodi:*, etc.)
    for junk_ns in JUNK_NS_PREFIXES:
        if name.startswith("{") and junk_ns in name:
            return True
    # Plain-name editor attributes
    local = name.split("}")[-1] if "}" in name else name
    if local in REDUNDANT_ATTRS:
        # Only remove if it carries a known no-op value (or is always redundant).
        noop_values = NOOP_ATTR_VALUES.get(local)
        return noop_values is None or value.strip() in noop_values
    return False


def _is_empty_group(el: ET.Element) -> bool:
    """Return True for <g> / <svg:g> elements with no children."""
    local = el.tag.split("}")[-1] if "}" in el.tag else el.tag
    return local == "g" and len(el) == 0


def _is_transparent_group(el: ET.Element) -> bool:
    """Return True for <g> with opacity=0 or display=none - invisible anyway."""
    opacity = el.get("opacity", "1")
    display = el.get("display", "inline")
    try:
        return float(opacity) == 0
    except ValueError:
        pass
    return display == "none"


def clean_attrs(root: ET.Element) -> int:
    """Remove junk attributes from every element. Returns count removed."""
    removed = 0
    for el in root.iter():
        junk_keys = [k for k, v in el.attrib.items() if _attr_is_junk(k, v)]
        for k in junk_keys:
            del el.attrib[k]
            removed += 1
    return removed


def collapse_empty_groups(root: ET.Element) -> int:
    """Remove empty <g> elements and invisible groups. Returns count removed."""
    removed = 0
    changed = True
    while changed:
        changed = False
        parents = parent_map(root)
        for el in list(root.iter()):
            if _is_empty_group(el) or _is_transparent_group(el):
                p = parents.get(el)
                if p is not None:
                    p.remove(el)
                    removed += 1
                    changed = True
    return removed


def strip_xml_comments(file_path: Path) -> int:
    """Remove XML comments from *file_path* via regex (ET doesn't expose them)."""
    text = file_path.read_text(encoding="utf-8")
    cleaned, n = re.subn(r"<!--.*?-->", "", text, flags=re.DOTALL)
    if n:
        file_path.write_text(cleaned, encoding="utf-8")
    return n


def canonicalise_svg_root(root: ET.Element) -> None:
    """
    Ensure the SVG root has exactly the attributes it needs and nothing more.
    Removes xmlns:xlink, version, baseProfile, enable-background, xml:space.
    """
    obsolete_root_attrs = {
        "version",
        "baseProfile",
        "enable-background",
        "{http://www.w3.org/XML/1998/namespace}space",
        "xml:space",
        "style",  # root-level style is rarely needed and often leftover
    }
    for attr in list(root.attrib):
        if attr in obsolete_root_attrs or attr.startswith("{http://www.w3.org/2000/xmlns/}xlink"):
            del root.attrib[attr]


def postprocess_xml(file_path: Path) -> CleanupStats:
    ET.register_namespace("", SVG_NS)
    stats = CleanupStats()

    # Pass 1: strip XML comments (ET can't see them, do it via regex first)
    stats.comments_removed = strip_xml_comments(file_path)

    # Pass 2: parse and mutate tree
    try:
        tree = ET.parse(str(file_path))
    except ET.ParseError:
        return stats
    root = tree.getroot()

    strip_metadata(root)
    canonicalise_svg_root(root)
    stats.attrs_removed = clean_attrs(root)
    stats.groups_removed = collapse_empty_groups(root)
    set_color_variables(root)

    tree.write(str(file_path), xml_declaration=False, encoding="unicode")
    return stats


# --------------------------------------------------------------------------- #
# Path Analysis Tools
# --------------------------------------------------------------------------- #

# Tokenise a path `d` attribute into (command, [args]) pairs.
_PATH_TOKEN_RE = re.compile(r"([MmZzLlHhVvCcSsQqTtAa])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)")


def _tokenise_path(d: str) -> list[tuple[str, list[float]]]:
    """Parse a path `d` string into a list of (cmd, args) pairs."""
    tokens = _PATH_TOKEN_RE.findall(d)
    segments: list[tuple[str, list[float]]] = []
    current_cmd: str | None = None
    current_args: list[float] = []

    # Number of arguments each command consumes per repetition
    cmd_arity = {
        "M": 2,
        "m": 2,
        "L": 2,
        "l": 2,
        "H": 1,
        "h": 1,
        "V": 1,
        "v": 1,
        "C": 6,
        "c": 6,
        "S": 4,
        "s": 4,
        "Q": 4,
        "q": 4,
        "T": 2,
        "t": 2,
        "A": 7,
        "a": 7,
        "Z": 0,
        "z": 0,
    }

    def flush() -> None:
        if current_cmd is None:
            return
        arity = cmd_arity.get(current_cmd, 0)
        if arity == 0:
            segments.append((current_cmd, []))
            return
        args = current_args[:]
        while len(args) >= arity:
            segments.append((current_cmd, args[:arity]))
            args = args[arity:]

    for cmd_tok, num_tok in tokens:
        if cmd_tok:
            flush()
            current_cmd = cmd_tok
            current_args = []
        elif num_tok:
            current_args.append(float(num_tok))
    flush()
    return segments


def _dist(ax: float, ay: float, bx: float, by: float) -> float:
    return math.hypot(bx - ax, by - ay)


def _check_path(d: str) -> list[PathIrregularity]:
    """Run all irregularity checks on a single path d-string."""
    segments = _tokenise_path(d)
    issues: list[PathIrregularity] = []

    # Reconstruct absolute endpoint positions so we can compare segment lengths
    # and directions. We track cursor (cx, cy).
    cx, cy = 0.0, 0.0  # current point
    sx, sy = 0.0, 0.0  # most recent M / m (for Z)
    endpoints: list[tuple[float, float]] = []  # absolute end of each segment

    for seg_idx, (cmd, args) in enumerate(segments):
        # ------------------------------------------------------------------ #
        # Resolve absolute endpoint for this segment                          #
        # ------------------------------------------------------------------ #
        nx, ny = cx, cy  # default: segment doesn't move

        if cmd in ("M", "L", "T"):
            nx, ny = args[0], args[1]
        elif cmd in ("m", "l", "t"):
            nx, ny = cx + args[0], cy + args[1]
        elif cmd == "H":
            nx = args[0]
        elif cmd == "h":
            nx = cx + args[0]
        elif cmd == "V":
            ny = args[0]
        elif cmd == "v":
            ny = cy + args[0]
        elif cmd == "C":
            nx, ny = args[4], args[5]
        elif cmd == "c":
            nx, ny = cx + args[4], cy + args[5]
        elif cmd == "S":
            nx, ny = args[2], args[3]
        elif cmd == "s":
            nx, ny = cx + args[2], cy + args[3]
        elif cmd == "Q":
            nx, ny = args[2], args[3]
        elif cmd == "q":
            nx, ny = cx + args[2], cy + args[3]
        elif cmd == "A":
            nx, ny = args[5], args[6]
        elif cmd == "a":
            nx, ny = cx + args[5], cy + args[6]
        elif cmd in ("Z", "z"):
            nx, ny = sx, sy

        # ------------------------------------------------------------------ #
        # Check 1 - Zero-length segment                                       #
        # ------------------------------------------------------------------ #
        seg_len = _dist(cx, cy, nx, ny)
        if seg_len < 1e-6 and cmd not in ("Z", "z", "M", "m"):
            issues.append(
                PathIrregularity(
                    kind="zero-length",
                    detail=f"segment #{seg_idx} ({cmd}) has length ≈0 at ({cx:.2f},{cy:.2f})",
                    segment_idx=seg_idx,
                )
            )

        # ------------------------------------------------------------------ #
        # Check 2 - Degenerate bezier control points                          #
        # ------------------------------------------------------------------ #
        if cmd in ("C", "S", "Q") or cmd in ("c", "s", "q"):
            if cmd in ("C", "c"):
                cp1x = cx + args[0] if cmd == "c" else args[0]
                cp1y = cy + args[1] if cmd == "c" else args[1]
                cp2x = cx + args[2] if cmd == "c" else args[2]
                cp2y = cy + args[3] if cmd == "c" else args[3]
                d1 = _dist(cx, cy, cp1x, cp1y)
                d2 = _dist(nx, ny, cp2x, cp2y)
                if seg_len > 1e-3 and (d1 / seg_len < 0.01 or d2 / seg_len < 0.01):
                    issues.append(
                        PathIrregularity(
                            kind="degenerate-bezier",
                            detail=(
                                f"segment #{seg_idx} ({cmd}) has control point(s) collapsed "
                                f"onto anchor (cp1_dist={d1:.3f}, cp2_dist={d2:.3f}, "
                                f"seg={seg_len:.3f})"
                            ),
                            segment_idx=seg_idx,
                        )
                    )
            elif cmd in ("Q", "q"):
                cpx = cx + args[0] if cmd == "q" else args[0]
                cpy = cy + args[1] if cmd == "q" else args[1]
                dc = _dist(cx, cy, cpx, cpy)
                if seg_len > 1e-3 and dc / seg_len < 0.01:
                    issues.append(
                        PathIrregularity(
                            kind="degenerate-bezier",
                            detail=(
                                f"segment #{seg_idx} ({cmd}) quadratic control point collapsed "
                                f"(cp_dist={dc:.3f}, seg={seg_len:.3f})"
                            ),
                            segment_idx=seg_idx,
                        )
                    )

        # Advance cursor
        if cmd in ("M", "m"):
            sx, sy = nx, ny
        cx, cy = nx, ny
        endpoints.append((nx, ny))

    # ------------------------------------------------------------------ #
    # Check 3 - Sharp direction reversal between consecutive segments      #
    # ------------------------------------------------------------------ #
    # Build direction vectors from the reconstructed endpoint list
    # (index into segments list, parallel to endpoints)
    vectors: list[tuple[float, float] | None] = []
    prev_x, prev_y = 0.0, 0.0
    for ep_x, ep_y in endpoints:
        dx, dy = ep_x - prev_x, ep_y - prev_y
        vectors.append((dx, dy) if (dx != 0 or dy != 0) else None)
        prev_x, prev_y = ep_x, ep_y

    reversal_threshold_deg = 150.0
    for i in range(1, len(vectors)):
        v_prev = vectors[i - 1]
        v_curr = vectors[i]
        if v_prev is None or v_curr is None:
            continue
        dot = v_prev[0] * v_curr[0] + v_prev[1] * v_curr[1]
        mag = math.hypot(*v_prev) * math.hypot(*v_curr)
        if mag < 1e-9:
            continue
        cos_angle = max(-1.0, min(1.0, dot / mag))
        angle_deg = math.degrees(math.acos(cos_angle))
        if angle_deg >= reversal_threshold_deg:
            issues.append(
                PathIrregularity(
                    kind="direction-reversal",
                    detail=(
                        f"segment #{i} ({segments[i][0]}) reverses direction by "
                        f"{angle_deg:.1f}° relative to previous segment"
                    ),
                    segment_idx=i,
                )
            )

    # ------------------------------------------------------------------ #
    # Check 4 - Extreme length discontinuity                              #
    # ------------------------------------------------------------------ #
    seg_lengths: list[float] = []
    prev_x2, prev_y2 = 0.0, 0.0
    for ep_x, ep_y in endpoints:
        seg_lengths.append(_dist(prev_x2, prev_y2, ep_x, ep_y))
        prev_x2, prev_y2 = ep_x, ep_y

    length_jump_ratio = 10.0
    for i in range(1, len(seg_lengths) - 1):
        if seg_lengths[i - 1] < 1e-6 or seg_lengths[i + 1] < 1e-6:
            continue
        avg_neighbor = (seg_lengths[i - 1] + seg_lengths[i + 1]) / 2
        # Use lowercase variable
        if avg_neighbor > 0 and seg_lengths[i] / avg_neighbor > length_jump_ratio:
            issues.append(
                PathIrregularity(
                    kind="length-jump",
                    detail=(
                        f"segment #{i} ({segments[i][0]}) is {seg_lengths[i] / avg_neighbor:.1f}x "
                        f"longer than its neighbors (len={seg_lengths[i]:.2f})"
                    ),
                    segment_idx=i,
                )
            )

    return issues


def analyze_path_irregularities(
    file_path: Path,
) -> list[tuple[str, list[PathIrregularity]]]:
    """
    Parse all <path d="…"> elements in *file_path* and return a list of
    (path_id_or_index, [irregularities]) for every path that has at least one
    anomaly.
    """
    ET.register_namespace("", SVG_NS)
    try:
        tree = ET.parse(str(file_path))
    except ET.ParseError:
        return []

    root = tree.getroot()
    findings: list[tuple[str, list[PathIrregularity]]] = []

    # Collect from both namespaced and plain <path> elements
    path_els = list(root.iter(f"{{{SVG_NS}}}path")) + list(root.iter("path"))

    for idx, el in enumerate(path_els):
        d = el.get("d", "").strip()
        if not d:
            continue
        label = el.get("id") or el.get("class") or f"path[{idx}]"
        issues = _check_path(d)
        if issues:
            findings.append((label, issues))

    return findings


def log_irregularities(file_path: Path) -> None:
    """Analyse *file_path* for path irregularities and print any findings."""
    findings = analyze_path_irregularities(file_path)
    if not findings:
        return

    file_label = rel_path(file_path)
    lines: list[str] = []
    for path_label, issues in findings:
        lines.append(f"  [bold]{path_label}[/bold]")
        for issue in issues:
            kind_color = {
                "zero-length": "yellow",
                "degenerate-bezier": "orange1",
                "direction-reversal": "red",
                "length-jump": "magenta",
            }.get(issue.kind, "white")
            lines.append(
                f"    [{kind_color}]⚠ {issue.kind}[/{kind_color}]: [dim]{issue.detail}[/dim]"
            )

    console.print(
        Panel(
            "\n".join(lines),
            title=f"[warning]Path irregularities detected in [path]{file_label}[/path][/warning]",
            border_style="yellow",
            expand=False,
        )
    )
