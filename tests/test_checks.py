from __future__ import annotations

from haoyu_portfolio.services.checks import run_checks


def test_run_checks_passes_without_secrets(temp_repo):
    result = run_checks()
    assert result["bundleValid"] is True
    assert result["invalidUrls"] == []


def test_run_checks_detects_secret_like_string(temp_repo):
    fake_secret_file = temp_repo / "content" / "config" / "unsafe.txt"
    fake_secret_file.write_text("ghp_123456789012345678901234567890123456", encoding="utf-8")
    result = run_checks()
    assert result["secretFindings"]
