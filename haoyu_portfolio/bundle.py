from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .paths import config_dir, posts_dir, public_data_path, repo_root
from .schemas import PortfolioBundle
from .services.github_sync import load_cached_github_repos, refresh_github_cache
from .utils import dump_json, load_yaml


def _load_config(name: str, top_level_key: str) -> dict[str, Any]:
    payload = load_yaml(config_dir() / name)
    return payload.get(top_level_key, {})


def _load_post_directories(kind: str) -> list[dict[str, Any]]:
    base = posts_dir() / kind
    if not base.exists():
        return []

    posts: list[dict[str, Any]] = []
    for entry in sorted(base.iterdir()):
        if not entry.is_dir():
            continue
        meta = load_yaml(entry / "meta.yaml")
        body_zh = (entry / "body.zh-CN.md").read_text(encoding="utf-8").strip()
        body_en = (entry / "body.en.md").read_text(encoding="utf-8").strip()
        posts.append(
            {
                "id": meta.get("id") or entry.name,
                "kind": meta.get("kind") or kind[:-1],
                "slug": meta.get("slug") or entry.name,
                "date": meta.get("date"),
                "title": meta.get("title"),
                "summary": meta.get("summary"),
                "tags": meta.get("tags") or [],
                "body": {"zh-CN": body_zh, "en": body_en},
                "media": meta.get("media"),
                "sourcePath": str(entry.relative_to(repo_root())),
            }
        )
    return posts


def _merge_projects(curated: list[dict[str, Any]], cached: list[dict[str, Any]]) -> list[dict[str, Any]]:
    cache_by_name = {item["name"]: item for item in cached}
    merged: list[dict[str, Any]] = []
    for project in curated:
        cached_item = cache_by_name.get(project["name"], {})
        merged.append(
            {
                **cached_item,
                **project,
                "topics": project.get("topics") or cached_item.get("topics") or [],
                "stars": project.get("stars", cached_item.get("stars", 0)),
                "forks": project.get("forks", cached_item.get("forks", 0)),
                "url": project.get("url") or cached_item.get("url") or "",
                "homepage": project.get("homepage") or cached_item.get("homepage"),
                "updatedAt": project.get("updatedAt") or cached_item.get("updatedAt"),
            }
        )
    return merged


def build_bundle(write: bool = True, refresh_github: bool = False) -> PortfolioBundle:
    site = _load_config("site.yaml", "site")
    profile = _load_config("profile.yaml", "profile")
    resume = _load_config("resume.yaml", "resume")
    projects = _load_config("projects.yaml", "projects")
    assistant = _load_config("assistant.yaml", "assistant")

    github_settings = projects.get("github", {})
    cached_repos: list[dict[str, Any]] = []
    if refresh_github and github_settings.get("username"):
        try:
            cached_repos = refresh_github_cache(
                username=github_settings["username"],
                cache_file=github_settings.get("cacheFile"),
            )
        except Exception:
            cached_repos = load_cached_github_repos(github_settings.get("cacheFile"))
    elif github_settings.get("includeCachedRepos"):
        cached_repos = load_cached_github_repos(github_settings.get("cacheFile"))

    bundle_payload = {
        "site": site,
        "profile": profile,
        "resume": resume,
        "projects": {
            "github": github_settings,
            "items": _merge_projects(projects.get("items", []), cached_repos),
        },
        "posts": _load_post_directories("garden") + _load_post_directories("articles"),
        "assistant": assistant,
        "generated": {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "source": "content/config + content/posts",
            "bundleVersion": "3.0.0",
            "warnings": [],
        },
    }
    bundle = PortfolioBundle.model_validate(bundle_payload)
    if write:
        dump_json(public_data_path(), bundle.model_dump(mode="json", exclude_none=True, by_alias=True))
    return bundle
