from __future__ import annotations

import os
from pathlib import Path
from typing import Any

import requests

from ..paths import cache_dir
from ..utils import dump_json


def github_cache_path(explicit: str | None = None) -> Path:
    if explicit:
        return Path(explicit)
    return cache_dir() / "github_repos.json"


def fetch_github_repos(username: str, token: str | None = None) -> list[dict[str, Any]]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "haoyu-portfolio-builder",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    response = requests.get(
        f"https://api.github.com/users/{username}/repos",
        params={"type": "owner", "sort": "updated", "per_page": 100},
        headers=headers,
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    repos: list[dict[str, Any]] = []
    for repo in payload:
        if repo.get("fork"):
            continue
        repos.append(
            {
                "id": repo["name"],
                "name": repo["name"],
                "description": {
                    "zh-CN": repo.get("description") or "待补充项目描述",
                    "en": repo.get("description") or "Project description pending.",
                },
                "language": repo.get("language") or "Unknown",
                "stars": repo.get("stargazers_count") or 0,
                "forks": repo.get("forks_count") or 0,
                "url": repo.get("html_url") or "",
                "homepage": repo.get("homepage"),
                "topics": repo.get("topics") or [],
                "featured": False,
                "source": "github-cache",
                "updatedAt": repo.get("updated_at"),
            }
        )
    return repos


def refresh_github_cache(username: str, cache_file: str | None = None) -> list[dict[str, Any]]:
    token = os.environ.get("GITHUB_TOKEN")
    repos = fetch_github_repos(username=username, token=token)
    dump_json(github_cache_path(cache_file), repos)
    return repos


def load_cached_github_repos(cache_file: str | None = None) -> list[dict[str, Any]]:
    path = github_cache_path(cache_file)
    if not path.exists():
        return []
    import json

    return json.loads(path.read_text(encoding="utf-8"))
