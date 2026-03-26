from __future__ import annotations

import os
from pathlib import Path


def repo_root() -> Path:
    override = os.environ.get("PORTFOLIO_REPO_ROOT")
    if override:
        return Path(override).expanduser().resolve()
    return Path(__file__).resolve().parents[1]


def content_dir() -> Path:
    return repo_root() / "content"


def config_dir() -> Path:
    return content_dir() / "config"


def posts_dir() -> Path:
    return content_dir() / "posts"


def cache_dir() -> Path:
    return content_dir() / "cache"


def public_dir() -> Path:
    return repo_root() / "public"


def public_data_path() -> Path:
    return public_dir() / "data.json"


def skill_dir() -> Path:
    return repo_root() / "skills" / "haoyu-portfolio-creator"


IGNORED_SCAN_DIRS = {
    ".git",
    ".github",
    ".pytest_cache",
    ".venv",
    "__pycache__",
    "node_modules",
    "dist",
    "playwright-report",
    "test-results",
    ".playwright-cache",
    ".mypy_cache",
    ".ruff_cache",
    "content/cache",
    "tests",
}
