import typer

from .cmd import svg
from .core.common import set_json_mode

app = typer.Typer(
    help="Spartan Commando Python CLI",
    add_completion=False,
    no_args_is_help=True,
)


def json_callback(value: bool) -> bool:
    if value:
        set_json_mode(True)
    return value


@app.callback()
def main_callback(
    json: bool = typer.Option(
        False,
        "--json",
        help="Output results as JSON. Suppresses standard output.",
        callback=json_callback,
        is_eager=True,
    ),
) -> None:
    """
    Core Python utilities for the project.
    """
    pass


# Register commands
app.command(name="svg")(svg.main)

if __name__ == "__main__":
    app()
