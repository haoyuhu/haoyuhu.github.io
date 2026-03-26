from __future__ import annotations

import json
import subprocess

import haoyu_portfolio.services.github_sync as github_sync


def test_refresh_github_caches_writes_profile_and_repo_cache(temp_repo, monkeypatch):
    fake_graphql_payload = {
        "data": {
            "user": {
                "repositories": {
                    "totalCount": 30,
                    "nodes": [
                        {
                            "name": "haoyuhu.github.io",
                            "nameWithOwner": "haoyuhu/haoyuhu.github.io",
                            "url": "https://github.com/haoyuhu/haoyuhu.github.io",
                            "description": "Portfolio source repository",
                            "stargazerCount": 12,
                            "forkCount": 2,
                            "watchers": {"totalCount": 3},
                            "pushedAt": "2026-03-25T08:00:00Z",
                            "updatedAt": "2026-03-25T08:00:00Z",
                            "homepageUrl": "https://haoyuhu.github.io",
                            "primaryLanguage": {"name": "TypeScript"},
                            "repositoryTopics": {
                                "nodes": [{"topic": {"name": "portfolio"}}],
                            },
                        }
                    ],
                },
                "repositoriesContributedTo": {
                    "nodes": [
                        {
                            "name": "evals",
                            "nameWithOwner": "openai/evals",
                            "url": "https://github.com/openai/evals",
                            "description": "Contributed evaluation repo",
                            "stargazerCount": 99,
                            "forkCount": 11,
                            "watchers": {"totalCount": 8},
                            "pushedAt": "2026-03-24T07:00:00Z",
                            "updatedAt": "2026-03-24T07:00:00Z",
                            "homepageUrl": None,
                            "primaryLanguage": {"name": "Python"},
                            "repositoryTopics": {
                                "nodes": [{"topic": {"name": "llm"}}],
                            },
                        }
                    ]
                },
                "pinnedItems": {
                    "nodes": [
                        {
                            "name": "haoyuhu.github.io",
                            "nameWithOwner": "haoyuhu/haoyuhu.github.io",
                            "url": "https://github.com/haoyuhu/haoyuhu.github.io",
                            "description": "Portfolio source repository",
                            "stargazerCount": 12,
                            "forkCount": 2,
                            "watchers": {"totalCount": 3},
                            "pushedAt": "2026-03-25T08:00:00Z",
                            "updatedAt": "2026-03-25T08:00:00Z",
                            "homepageUrl": "https://haoyuhu.github.io",
                            "owner": {"login": "haoyuhu"},
                            "primaryLanguage": {"name": "TypeScript"},
                            "repositoryTopics": {
                                "nodes": [{"topic": {"name": "portfolio"}}],
                            },
                        },
                        {
                            "name": "cluster-analysis",
                            "nameWithOwner": "haoyuhu/cluster-analysis",
                            "url": "https://github.com/haoyuhu/cluster-analysis",
                            "description": "Pinned clustering repository",
                            "stargazerCount": 30,
                            "forkCount": 4,
                            "watchers": {"totalCount": 4},
                            "pushedAt": "2026-03-22T07:00:00Z",
                            "updatedAt": "2026-03-22T07:00:00Z",
                            "homepageUrl": None,
                            "owner": {"login": "haoyuhu"},
                            "primaryLanguage": {"name": "Python"},
                            "repositoryTopics": {
                                "nodes": [{"topic": {"name": "clustering"}}],
                            },
                        },
                    ]
                },
            }
        }
    }
    fake_rest_payload = {
        "login": "haoyuhu",
        "avatar_url": "https://example.com/avatar.png",
        "html_url": "https://github.com/haoyuhu",
        "location": "Shanghai",
        "email": "im@huhaoyu.com",
        "public_repos": 30,
        "followers": 46,
        "following": 17,
    }

    def fake_run(command, capture_output, text, check):
        assert capture_output is True
        assert text is True
        assert check is True
        if command[:3] == ["gh", "api", "graphql"]:
            return subprocess.CompletedProcess(command, 0, stdout=json.dumps(fake_graphql_payload), stderr="")
        if command[:2] == ["gh", "api"] and command[2] == "users/haoyuhu":
            return subprocess.CompletedProcess(command, 0, stdout=json.dumps(fake_rest_payload), stderr="")
        raise AssertionError(f"Unexpected gh command: {command}")

    monkeypatch.setattr(github_sync.subprocess, "run", fake_run)

    snapshot = github_sync.refresh_github_caches(username="haoyuhu")

    assert snapshot["profile"]["stats"]["followers"] == 46
    assert len(snapshot["repos"]) == 3
    assert {repo["relationship"] for repo in snapshot["repos"]} == {"owner", "contributor"}
    repos_by_name = {repo["nameWithOwner"]: repo for repo in snapshot["repos"]}
    assert repos_by_name["haoyuhu/haoyuhu.github.io"]["pinned"] is True
    assert repos_by_name["haoyuhu/haoyuhu.github.io"]["featured"] is True
    assert repos_by_name["haoyuhu/cluster-analysis"]["pinned"] is True
    assert repos_by_name["haoyuhu/cluster-analysis"]["relationship"] == "owner"

    cached_profile = github_sync.load_cached_github_profile()
    cached_repos = github_sync.load_cached_github_repos()

    assert cached_profile["email"] == "im@huhaoyu.com"
    assert cached_repos[0]["nameWithOwner"] == "haoyuhu/haoyuhu.github.io"
    assert cached_repos[1]["nameWithOwner"] == "openai/evals"
    assert cached_repos[2]["nameWithOwner"] == "haoyuhu/cluster-analysis"
