from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from ..paths import cache_dir, repo_root
from ..utils import dump_json


GITHUB_SYNC_QUERY = """
fragment RepoFields on Repository {
  name
  nameWithOwner
  url
  description
  stargazerCount
  forkCount
  watchers {
    totalCount
  }
  pushedAt
  updatedAt
  homepageUrl
  owner {
    login
  }
  primaryLanguage {
    name
  }
  repositoryTopics(first: 10) {
    nodes {
      topic {
        name
      }
    }
  }
}

query {
  user(login: "__USERNAME__") {
    repositories(
      first: 100
      privacy: PUBLIC
      ownerAffiliations: OWNER
      isFork: false
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      totalCount
      nodes {
        ...RepoFields
      }
    }
    repositoriesContributedTo(
      first: 50
      contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, PULL_REQUEST_REVIEW, REPOSITORY]
      includeUserRepositories: false
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      nodes {
        ...RepoFields
      }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          ...RepoFields
        }
      }
    }
  }
}
""".strip()


def github_cache_path(explicit: str | None = None) -> Path:
    if explicit:
        path = Path(explicit)
        if not path.is_absolute():
            path = repo_root() / path
        return path
    return cache_dir() / "github_repos.json"


def github_profile_cache_path(explicit: str | None = None) -> Path:
    if explicit:
        path = Path(explicit)
        if not path.is_absolute():
            path = repo_root() / path
        return path
    return cache_dir() / "github_profile.json"


def _run_gh_json(command: list[str], error_message: str) -> dict[str, Any]:
    try:
        result = subprocess.run(command, capture_output=True, text=True, check=True)
    except FileNotFoundError as exc:  # pragma: no cover - depends on local tooling
        raise RuntimeError("GitHub sync requires the `gh` CLI to be installed and authenticated.") from exc
    except subprocess.CalledProcessError as exc:
        stderr = (exc.stderr or "").strip()
        raise RuntimeError(stderr or error_message) from exc
    return json.loads(result.stdout)


def _run_gh_graphql(query: str) -> dict[str, Any]:
    return _run_gh_json(
        ["gh", "api", "graphql", "-f", f"query={query}"],
        "GitHub sync failed while calling `gh api graphql`.",
    )


def _run_gh_rest(endpoint: str) -> dict[str, Any]:
    return _run_gh_json(
        ["gh", "api", endpoint],
        f"GitHub sync failed while calling `gh api {endpoint}`.",
    )


def _localized_description(raw: str | None) -> dict[str, str]:
    description = (raw or "").strip()
    if not description:
        return {
            "zh-CN": "待补充项目描述",
            "en": "Project description pending.",
        }
    return {
        "zh-CN": description,
        "en": description,
    }


def _normalize_repo(
    node: dict[str, Any],
    relationship: str,
    *,
    featured: bool = False,
    pinned: bool = False,
) -> dict[str, Any]:
    name_with_owner = node["nameWithOwner"]
    owner, name = name_with_owner.split("/", 1)
    return {
        "id": name_with_owner.replace("/", "--").lower(),
        "name": name,
        "nameWithOwner": name_with_owner,
        "repositoryOwner": owner,
        "description": _localized_description(node.get("description")),
        "language": ((node.get("primaryLanguage") or {}).get("name") or "Unknown"),
        "stars": node.get("stargazerCount") or 0,
        "forks": node.get("forkCount") or 0,
        "watchers": ((node.get("watchers") or {}).get("totalCount") or 0),
        "url": node.get("url") or "",
        "homepage": node.get("homepageUrl"),
        "topics": [
            topic_node["topic"]["name"]
            for topic_node in (node.get("repositoryTopics") or {}).get("nodes", [])
            if topic_node.get("topic", {}).get("name")
        ],
        "featured": featured,
        "pinned": pinned,
        "relationship": relationship,
        "source": "github-sync",
        "pushedAt": node.get("pushedAt"),
        "updatedAt": node.get("updatedAt"),
    }


def fetch_github_snapshot(username: str) -> dict[str, Any]:
    payload = _run_gh_graphql(GITHUB_SYNC_QUERY.replace("__USERNAME__", username))
    profile_payload = _run_gh_rest(f"users/{username}")
    user = (payload.get("data") or {}).get("user")
    if not user:
        raise RuntimeError(f"GitHub user `{username}` not found or inaccessible via `gh`.")

    owned_nodes = (user.get("repositories") or {}).get("nodes", [])
    contributed_nodes = (user.get("repositoriesContributedTo") or {}).get("nodes", [])
    pinned_nodes = (user.get("pinnedItems") or {}).get("nodes", [])

    repos_by_full_name: dict[str, dict[str, Any]] = {}
    for node in owned_nodes:
        if not node.get("url"):
            continue
        repo = _normalize_repo(node, relationship="owner")
        repos_by_full_name[repo["nameWithOwner"]] = repo
    for node in contributed_nodes:
        if not node.get("url"):
            continue
        repo = _normalize_repo(node, relationship="contributor")
        repos_by_full_name.setdefault(repo["nameWithOwner"], repo)
    for node in pinned_nodes:
        if not isinstance(node, dict) or not node.get("url"):
            continue
        owner_login = ((node.get("owner") or {}).get("login") or "").strip().lower()
        relationship = "owner" if owner_login == username.strip().lower() else "contributor"
        repo = _normalize_repo(node, relationship=relationship, featured=True, pinned=True)
        existing = repos_by_full_name.get(repo["nameWithOwner"])
        if existing:
            existing["featured"] = True
            existing["pinned"] = True
            existing["homepage"] = existing.get("homepage") or repo.get("homepage")
            existing["topics"] = existing.get("topics") or repo.get("topics") or []
            continue
        repos_by_full_name[repo["nameWithOwner"]] = repo

    return {
        "profile": {
            "login": profile_payload.get("login") or username,
            "avatarUrl": profile_payload.get("avatar_url") or "",
            "primaryUrl": profile_payload.get("html_url") or "",
            "location": (profile_payload.get("location") or "").strip(),
            "email": (profile_payload.get("email") or "").strip(),
            "stats": {
                "publicRepos": profile_payload.get("public_repos") or (user.get("repositories") or {}).get("totalCount") or 0,
                "followers": profile_payload.get("followers") or 0,
                "following": profile_payload.get("following") or 0,
            },
        },
        "repos": list(repos_by_full_name.values()),
    }


def refresh_github_caches(
    username: str,
    cache_file: str | None = None,
    profile_cache_file: str | None = None,
) -> dict[str, Any]:
    snapshot = fetch_github_snapshot(username=username)
    dump_json(github_cache_path(cache_file), {"items": snapshot["repos"]})
    dump_json(github_profile_cache_path(profile_cache_file), snapshot["profile"])
    return snapshot


def load_cached_github_repos(cache_file: str | None = None) -> list[dict[str, Any]]:
    path = github_cache_path(cache_file)
    if not path.exists():
        return []
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, dict):
        return payload.get("items", [])
    return payload


def load_cached_github_profile(profile_cache_file: str | None = None) -> dict[str, Any]:
    path = github_profile_cache_path(profile_cache_file)
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))
