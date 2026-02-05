from rich.theme import Theme

THEME: Theme = Theme(
    {
        "info": "cyan",
        "warning": "yellow",
        "error": "bold red",
        "success": "bold green",
        "step": "blue",
        "path": "dim white",
        "brand": "bold magenta",
    }
)

SVG_NS: str = "http://www.w3.org/2000/svg"

SVGO_CONFIG: dict = {
    "plugins": [
        "preset-default",
        "mergePaths",
        "convertPathData",
        "removeUselessStrokeAndFill",
        "moveElemsAttrsToGroup",
        "convertStyleToAttrs",
        {"name": "cleanupNumericValues", "params": {"floatPrecision": 2}},
    ]
}

STRIP_TAGS: frozenset[str] = frozenset(
    {
        f"{{{SVG_NS}}}metadata",
        f"{{{SVG_NS}}}title",
        f"{{{SVG_NS}}}desc",
        "{http://purl.org/dc/elements/1.1/}",
        "{http://creativecommons.org/ns#}",
        "{http://www.w3.org/1999/02/22-rdf-syntax-ns#}RDF",
    }
)

# Attributes that are SVG presentation defaults - keeping them is just noise.
REDUNDANT_ATTRS: frozenset[str] = frozenset(
    {
        # visibility / display
        "display",
        "visibility",
        "overflow",
        # stroke defaults
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-dasharray",
        "stroke-dashoffset",
        "stroke-opacity",
        # fill defaults already handled by set_fill_currentcolor
        "fill-rule",
        "fill-opacity",
        # misc
        "color",
        "image-rendering",
        "shape-rendering",
        "text-rendering",
        "vector-effect",
        "pointer-events",
        # editor junk
        "data-name",
        "data-v",
    }
)

# Attribute value pairs that are definitively no-ops in SVG.
NOOP_ATTR_VALUES: dict[str, set[str]] = {
    "display": {"inline"},
    "visibility": {"visible"},
    "overflow": {"visible"},
    "stroke": {"none"},
    "stroke-opacity": {"1", "1.0"},
    "fill-opacity": {"1", "1.0"},
    "fill-rule": {"nonzero"},
    "stroke-dasharray": {"none"},
    "stroke-dashoffset": {"0"},
    "stroke-miterlimit": {"4", "10"},
    "pointer-events": {"visiblePainted", "all"},
    "image-rendering": {"auto"},
    "shape-rendering": {"auto"},
    "text-rendering": {"auto"},
    "vector-effect": {"none"},
    "color": {"inherit"},
}

# Namespace prefixes emitted by design tools that add zero semantic value.
JUNK_NS_PREFIXES: tuple[str, ...] = (
    "http://www.inkscape.org/namespaces/inkscape",
    "http://sodipodi.sourceforge.net/DTD/sodipodi-0.0.dtd",
    "http://www.w3.org/1999/xlink",  # superseded by href
    "http://ns.adobe.com/",
    "http://www.sketch.com/ns/svg/1",
    "http://www.bohemiancoding.com/sketch/ns",
    "http://www.figma.com/",
)
