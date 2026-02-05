from pathlib import Path
from typing import Any

from tools.pylib.cmd.svg import run_once
from tools.pylib.core.schemas import FileResult


def test_run_once_no_files(mocker: Any) -> None:
    mock_console = mocker.patch("tools.pylib.cmd.svg.console")
    run_once([], no_deep=False, merge="0.1mm", simplify="0.05mm")
    mock_console.print.assert_called_once_with("[yellow]No files matched[/yellow]", style="yellow")


def test_run_once_with_files(mocker: Any) -> None:
    mock_optimize = mocker.patch("tools.pylib.cmd.svg.run_optimization_batch")
    mock_print_results = mocker.patch("tools.pylib.cmd.svg.print_results")

    files = [Path("test1.svg"), Path("test2.svg")]
    mock_results = [
        FileResult(path="test1.svg", orig=100, new=80, elapsed=0.1),
        FileResult(path="test2.svg", orig=200, new=150, elapsed=0.2),
    ]
    mock_optimize.return_value = mock_results

    run_once(files, no_deep=False, merge="0.1mm", simplify="0.05mm")

    mock_optimize.assert_called_once_with(
        files, no_deep=False, merge="0.1mm", simplify="0.05mm", show_progress=True
    )
    mock_print_results.assert_called_once_with(mock_results)


def test_run_once_json_mode(mocker: Any) -> None:
    # Set JSON mode
    mocker.patch("tools.pylib.cmd.svg.IS_JSON_MODE", True)
    mock_optimize = mocker.patch("tools.pylib.cmd.svg.run_optimization_batch")
    mock_print = mocker.patch("tools.pylib.cmd.svg.print")

    files = [Path("test1.svg")]
    mock_results = [FileResult(path="test1.svg", orig=100, new=80, elapsed=0.1)]
    mock_optimize.return_value = mock_results

    run_once(files, no_deep=False, merge="0.1mm", simplify="0.05mm")

    # Check if print was called with JSON
    args, _ = mock_print.call_args
    assert "test1.svg" in args[0]
    assert "80" in args[0]
