from pathlib import Path
from subprocess import CalledProcessError
from typing import Any

from tools.pylib.core.common import fmt_kb, fmt_savings, fmt_time, rel_path, run_cli
from tools.pylib.core.schemas import FileResult


def test_rel_path() -> None:
    cwd = Path.cwd()
    assert rel_path(cwd / "test.txt") == "test.txt"
    assert rel_path(Path("/external/path/test.txt")) == "/external/path/test.txt"


def test_fmt_kb() -> None:
    assert fmt_kb(1024) == "1.0K"
    assert fmt_kb(2048) == "2.0K"
    assert fmt_kb(512) == "0.5K"


def test_fmt_time() -> None:
    assert fmt_time(0.5) == "500ms"
    assert fmt_time(1.5) == "1.5s"
    assert fmt_time(65) == "1m 05s"
    assert fmt_time(125) == "2m 05s"


def test_fmt_savings() -> None:
    res1 = FileResult(path="test.svg", orig=1000, new=500, elapsed=0.1)
    assert fmt_savings(res1) == "0.5K (50.0%)"

    res2 = FileResult(path="test.svg", orig=100, new=90, elapsed=0.1)
    assert fmt_savings(res2) == "10B"

    res3 = FileResult(path="test.svg", orig=100, new=100, elapsed=0.1)
    assert fmt_savings(res3) == "-"


def test_run_cli_success(mocker: Any) -> None:
    mock_run = mocker.patch("subprocess.run")
    assert run_cli(["ls"]) is True
    mock_run.assert_called_once_with(["ls"], check=True, stdout=-3, stderr=-1)


def test_run_cli_failure(mocker: Any) -> None:
    mock_run = mocker.patch("subprocess.run")
    mock_run.side_effect = CalledProcessError(1, ["ls"], stderr=b"error message")

    # We also need to mock console to avoid actual printing during test
    mocker.patch("tools.pylib.core.common.console.print")

    assert run_cli(["ls"]) is False
