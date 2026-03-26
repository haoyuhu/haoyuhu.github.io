from __future__ import annotations

import shutil
from pathlib import Path

import pytest


REPO_ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture
def temp_repo(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Path:
    shutil.copytree(REPO_ROOT / "content", tmp_path / "content")
    (tmp_path / "public").mkdir(parents=True, exist_ok=True)
    monkeypatch.setenv("PORTFOLIO_REPO_ROOT", str(tmp_path))
    return tmp_path
