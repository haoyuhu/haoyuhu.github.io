from __future__ import annotations

from typer.testing import CliRunner

from haoyu_portfolio.cli import app


runner = CliRunner()


def test_cli_build_and_check_commands(temp_repo):
    build_result = runner.invoke(app, ["build"])
    assert build_result.exit_code == 0

    check_result = runner.invoke(app, ["check"])
    assert check_result.exit_code == 0


def test_cli_content_note_command(temp_repo):
    result = runner.invoke(app, ["content", "note", "--text", "CLI generated note", "--title", "CLI Note"])
    assert result.exit_code == 0
    assert "generated at" in result.stdout
