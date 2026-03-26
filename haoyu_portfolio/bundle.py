from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .paths import config_dir, posts_dir, public_data_path, repo_root
from .schemas import PortfolioBundle
from .services.github_sync import (
    load_cached_github_profile,
    load_cached_github_repos,
    refresh_github_caches,
)
from .utils import deep_merge, dump_json, load_yaml


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


def _normalize_project_overrides(raw_overrides: Any) -> dict[str, dict[str, Any]]:
    if isinstance(raw_overrides, dict):
        return {str(key): value for key, value in raw_overrides.items() if isinstance(value, dict)}
    if isinstance(raw_overrides, list):
        normalized: dict[str, dict[str, Any]] = {}
        for item in raw_overrides:
            if not isinstance(item, dict):
                continue
            key = item.get("nameWithOwner") or item.get("name")
            if not key:
                continue
            normalized[str(key)] = item
        return normalized
    return {}


def _merge_profile(profile: dict[str, Any], cached_profile: dict[str, Any]) -> dict[str, Any]:
    merged = {**profile}
    if not cached_profile:
        merged["socialLinks"] = [link for link in merged.get("socialLinks", []) if link.get("id") != "linkedin"]
        return merged

    merged["avatarUrl"] = cached_profile.get("avatarUrl") or merged.get("avatarUrl")
    merged["primaryUrl"] = cached_profile.get("primaryUrl") or merged.get("primaryUrl")

    stats = {
        **(merged.get("stats") or {}),
        **(cached_profile.get("stats") or {}),
    }
    merged["stats"] = stats

    if cached_profile.get("email"):
        merged["email"] = cached_profile["email"]

    raw_location = (cached_profile.get("location") or "").strip()
    if raw_location:
        localized_location = merged.get("location") or {}
        merged["location"] = {
            "zh-CN": localized_location.get("zh-CN") or raw_location,
            "en": raw_location,
        }

    social_links = [link for link in merged.get("socialLinks", []) if link.get("id") != "linkedin"]
    for link in social_links:
        if link.get("id") == "github" and merged.get("primaryUrl"):
            link["url"] = merged["primaryUrl"]
    merged["socialLinks"] = social_links
    return merged


def _sort_timestamp(raw: str | None) -> int:
    if not raw:
        return 0
    try:
        normalized = raw.replace("Z", "+00:00")
        return int(datetime.fromisoformat(normalized).timestamp())
    except ValueError:
        return 0


def _sort_projects(items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(
        items,
        key=lambda item: (
            -(item.get("stars") or 0),
            -_sort_timestamp(item.get("pushedAt")),
            -(item.get("forks") or 0),
            -(item.get("watchers") or 0),
            str(item.get("nameWithOwner") or item.get("name") or "").lower(),
        ),
    )


def _merge_projects(projects: dict[str, Any], cached: list[dict[str, Any]]) -> list[dict[str, Any]]:
    github_settings = projects.get("github", {})
    include_contribution_repos = github_settings.get("includeContributionRepos", True)
    excluded = set(github_settings.get("excludeRepos") or [])
    overrides = _normalize_project_overrides(projects.get("overrides") or projects.get("items"))

    merged: list[dict[str, Any]] = []
    for cached_item in cached:
        if not include_contribution_repos and cached_item.get("relationship") == "contributor":
            continue
        full_name = cached_item.get("nameWithOwner") or cached_item.get("name")
        short_name = cached_item.get("name")
        if full_name in excluded or short_name in excluded:
            continue

        override = overrides.get(full_name) or overrides.get(short_name) or {}
        merged_item = deep_merge(cached_item, override)
        merged_item["topics"] = override.get("topics") or cached_item.get("topics") or []
        merged_item["url"] = override.get("url") or cached_item.get("url") or ""
        merged_item["homepage"] = override.get("homepage") or cached_item.get("homepage")
        merged_item["nameWithOwner"] = full_name
        merged_item["name"] = merged_item.get("name") or short_name
        merged_item["repositoryOwner"] = merged_item.get("repositoryOwner") or str(full_name).split("/", 1)[0]
        merged_item["id"] = merged_item.get("id") or str(full_name).replace("/", "--").lower()
        merged.append(merged_item)
    return _sort_projects(merged)


def build_bundle(write: bool = True, refresh_github: bool = False) -> PortfolioBundle:
    site = _load_config("site.yaml", "site")
    profile = _load_config("profile.yaml", "profile")
    resume = _load_config("resume.yaml", "resume")
    projects = _load_config("projects.yaml", "projects")
    assistant = _load_config("assistant.yaml", "assistant")

    github_settings = projects.get("github", {})
    cached_profile: dict[str, Any] = {}
    cached_repos: list[dict[str, Any]] = []
    if refresh_github and github_settings.get("username"):
        try:
            snapshot = refresh_github_caches(
                username=github_settings["username"],
                cache_file=github_settings.get("cacheFile"),
                profile_cache_file=github_settings.get("profileCacheFile"),
            )
            cached_profile = snapshot["profile"]
            cached_repos = snapshot["repos"]
        except Exception:
            cached_repos = load_cached_github_repos(github_settings.get("cacheFile"))
            cached_profile = load_cached_github_profile(github_settings.get("profileCacheFile"))
    elif github_settings.get("includeCachedRepos"):
        cached_repos = load_cached_github_repos(github_settings.get("cacheFile"))
        cached_profile = load_cached_github_profile(github_settings.get("profileCacheFile"))

    bundle_payload = {
        "site": site,
        "profile": _merge_profile(profile, cached_profile),
        "resume": resume,
        "projects": {
            "github": github_settings,
            "items": _merge_projects(projects, cached_repos),
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
