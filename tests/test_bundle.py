from __future__ import annotations

import json

from haoyu_portfolio.bundle import build_bundle
from haoyu_portfolio.utils import dump_yaml, load_yaml


def test_build_bundle_writes_public_json(temp_repo):
    bundle = build_bundle(write=True)
    assert bundle.profile.name == "胡皓宇"
    payload = json.loads((temp_repo / "public" / "data.json").read_text(encoding="utf-8"))
    assert payload["site"]["localeDefault"] == "en"
    assert payload["site"]["runtime"]["chatEnabled"] is False
    assert len(payload["posts"]) >= 2


def test_build_bundle_merges_cached_github_profile_and_projects(temp_repo):
    cache_dir = temp_repo / "content" / "cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    (cache_dir / "github_profile.json").write_text(
        json.dumps(
            {
                "login": "haoyuhu",
                "avatarUrl": "https://example.com/avatar.png",
                "primaryUrl": "https://github.com/haoyuhu",
                "location": "Shanghai",
                "email": "im@huhaoyu.com",
                "stats": {
                    "publicRepos": 88,
                    "followers": 123,
                    "following": 45,
                },
            }
        ),
        encoding="utf-8",
    )
    (cache_dir / "github_repos.json").write_text(
        json.dumps(
            {
                "items": [
                    {
                        "id": "openai--evals",
                        "name": "evals",
                        "nameWithOwner": "openai/evals",
                        "repositoryOwner": "openai",
                        "description": {
                            "zh-CN": "参与贡献的评测仓库",
                            "en": "A contributed evaluation repository.",
                        },
                        "language": "Python",
                        "stars": 1200,
                        "forks": 320,
                        "watchers": 64,
                        "url": "https://github.com/openai/evals",
                        "homepage": None,
                        "topics": ["evaluation", "llm"],
                        "featured": False,
                        "relationship": "contributor",
                        "source": "github-sync",
                        "pushedAt": "2026-03-20T12:00:00Z",
                        "updatedAt": "2026-03-20T12:00:00Z",
                    },
                    {
                        "id": "haoyuhu--dify-client-python",
                        "name": "dify-client-python",
                        "nameWithOwner": "haoyuhu/dify-client-python",
                        "repositoryOwner": "haoyuhu",
                        "description": {
                            "zh-CN": "原始缓存描述",
                            "en": "Original cached description.",
                        },
                        "language": "Python",
                        "stars": 42,
                        "forks": 10,
                        "watchers": 8,
                        "url": "https://github.com/haoyuhu/dify-client-python",
                        "homepage": None,
                        "topics": ["api", "sdk"],
                        "featured": False,
                        "relationship": "owner",
                        "source": "github-sync",
                        "pushedAt": "2026-03-21T08:00:00Z",
                        "updatedAt": "2026-03-21T08:00:00Z",
                    },
                ]
            }
        ),
        encoding="utf-8",
    )

    bundle = build_bundle(write=False)

    assert bundle.profile.avatarUrl == "https://example.com/avatar.png"
    assert bundle.profile.email == "im@huhaoyu.com"
    assert bundle.profile.location["en"] == "Shanghai"
    assert bundle.profile.stats.followers == 123
    assert bundle.profile.socialLinks[0].url == "https://github.com/haoyuhu"

    assert [project.nameWithOwner for project in bundle.projects.items] == [
        "openai/evals",
        "haoyuhu/dify-client-python",
    ]
    assert bundle.projects.items[0].relationship == "contributor"
    assert bundle.projects.items[1].featured is True
    assert bundle.projects.items[1].description["en"].startswith("A Python client for the Dify API")


def test_build_bundle_generates_project_topics_when_missing(temp_repo):
    cache_dir = temp_repo / "content" / "cache"
    cache_dir.mkdir(parents=True, exist_ok=True)

    (cache_dir / "github_repos.json").write_text(
        json.dumps(
            {
                "items": [
                    {
                        "id": "haoyuhu--agent-cli",
                        "name": "agent-cli",
                        "nameWithOwner": "haoyuhu/agent-cli",
                        "repositoryOwner": "haoyuhu",
                        "description": {
                            "zh-CN": "面向智能体工作流的 Python CLI 工具。",
                            "en": "A Python CLI tool for agent workflows.",
                        },
                        "language": "Python",
                        "stars": 5,
                        "forks": 1,
                        "watchers": 1,
                        "url": "https://github.com/haoyuhu/agent-cli",
                        "homepage": None,
                        "topics": [],
                        "featured": False,
                        "relationship": "owner",
                        "source": "github-sync",
                        "pushedAt": "2026-03-21T08:00:00Z",
                        "updatedAt": "2026-03-21T08:00:00Z",
                    }
                ]
            }
        ),
        encoding="utf-8",
    )

    bundle = build_bundle(write=False)

    assert bundle.projects.items[0].topics[:4] == ["python", "agent", "cli", "workflow"]


def test_build_bundle_accepts_localized_resume_display_fields(temp_repo):
    resume_path = temp_repo / "content" / "config" / "resume.yaml"
    resume_payload = load_yaml(resume_path)
    resume = resume_payload["resume"]

    resume["experience"][0]["company"] = {"zh-CN": "杭州今日头条科技有限公司", "en": "Bytedance Inc."}
    resume["experience"][0]["projects"][0]["name"] = {"zh-CN": "Cici Page 全球推全", "en": "Cici Page Global Rollout"}
    resume["experience"][0]["projects"][0]["tech"][0] = {"zh-CN": "召回策略", "en": "Recall Strategy"}
    resume["education"][0]["school"] = {"zh-CN": "清华大学", "en": "Tsinghua University"}
    resume["skillGroups"][1]["items"][0]["name"] = {"zh-CN": "推荐系统", "en": "Recommendation Systems"}

    dump_yaml(resume_path, resume_payload)

    bundle = build_bundle(write=False)

    assert bundle.resume.experience[0].company["en"] == "Bytedance Inc."
    assert bundle.resume.experience[0].projects[0].name["en"] == "Cici Page Global Rollout"
    assert bundle.resume.experience[0].projects[0].tech[0]["en"] == "Recall Strategy"
    assert bundle.resume.education[0].school["en"] == "Tsinghua University"
    assert bundle.resume.skillGroups[1].items[0].name["en"] == "Recommendation Systems"
