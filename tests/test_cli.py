from __future__ import annotations

from typer.testing import CliRunner

import haoyu_portfolio.cli as cli_module
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


def test_cli_sync_github_command_uses_configured_username(temp_repo, monkeypatch):
    captured: dict[str, str] = {}

    def fake_refresh_github_caches(username: str, cache_file: str | None = None, profile_cache_file: str | None = None):
        captured["username"] = username
        captured["cache_file"] = cache_file or ""
        captured["profile_cache_file"] = profile_cache_file or ""
        return {
            "profile": {"login": username},
            "repos": [{"nameWithOwner": "haoyuhu/haoyuhu.github.io"}],
        }

    monkeypatch.setattr(cli_module, "refresh_github_caches", fake_refresh_github_caches)

    result = runner.invoke(app, ["sync", "github"])

    assert result.exit_code == 0
    assert captured["username"] == "haoyuhu"
    assert captured["cache_file"].endswith("content/cache/github_repos.json")
    assert captured["profile_cache_file"].endswith("content/cache/github_profile.json")
    assert "GitHub profile synced: haoyuhu" in result.stdout
