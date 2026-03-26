from __future__ import annotations

import argparse
import json
from pathlib import Path

from haoyu_portfolio.paths import config_dir
from haoyu_portfolio.utils import dump_yaml


def migrate_legacy_bundle(source: Path) -> None:
    payload = json.loads(source.read_text(encoding="utf-8"))
    profile = payload.get("profile", {})
    experience = payload.get("experience", [])
    education = payload.get("education", [])
    skills = payload.get("skills", [])
    repos = payload.get("repos", [])

    dump_yaml(
        config_dir() / "profile.yaml",
        {
            "profile": {
                "name": profile.get("name", "Haoyu Hu"),
                "avatarUrl": profile.get("avatar_url", ""),
                "primaryUrl": profile.get("blog") or profile.get("html_url") or "",
                "title": {
                    "zh-CN": profile.get("title", "待补充标题"),
                    "en": profile.get("title", "Title pending"),
                },
                "heroExtends": {
                    "zh-CN": "AgentOrchestrator, AIInfraArchitect",
                    "en": "AgentOrchestrator, AIInfraArchitect",
                },
                "biography": {
                    "zh-CN": profile.get("summary") or profile.get("bio") or "",
                    "en": profile.get("summary") or profile.get("bio") or "",
                },
                "location": {
                    "zh-CN": profile.get("location", ""),
                    "en": profile.get("location", ""),
                },
                "email": profile.get("email"),
                "socialLinks": [],
                "stats": {
                    "publicRepos": profile.get("public_repos", 0),
                    "followers": profile.get("followers", 0),
                    "following": profile.get("following", 0),
                },
                "systemIdentity": [],
                "techStack": [],
                "aiTools": [],
                "careerStartYear": 2018,
            }
        },
    )
    dump_yaml(
        config_dir() / "resume.yaml",
        {
            "resume": {
                "summary": {"zh-CN": profile.get("summary", ""), "en": profile.get("summary", "")},
                "experience": experience,
                "education": education,
                "skillGroups": [
                    {
                        "id": "legacy-import",
                        "label": {"zh-CN": "Legacy Skills", "en": "Legacy Skills"},
                        "items": [{"name": skill, "level": "Imported"} for skill in skills],
                    }
                ],
            }
        },
    )
    dump_yaml(
        config_dir() / "projects.yaml",
        {
            "projects": {
                "github": {
                    "username": "haoyuhu",
                    "cacheFile": "content/cache/github_repos.json",
                    "includeCachedRepos": True,
                },
                "items": repos,
            }
        },
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate a legacy public/data.json bundle into the new content/config layout.")
    parser.add_argument("source", help="Path to the legacy JSON bundle.")
    args = parser.parse_args()
    migrate_legacy_bundle(Path(args.source).expanduser().resolve())


if __name__ == "__main__":
    main()
