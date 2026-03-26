from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from ..bundle import build_bundle
from ..paths import IGNORED_SCAN_DIRS, repo_root


SECRET_PATTERNS = [
    re.compile(r"ghp_[A-Za-z0-9]{20,}"),
    re.compile(r"sk-[A-Za-z0-9]{20,}"),
    re.compile(r"AIza[0-9A-Za-z\-_]{20,}"),
    re.compile(r"GEMINI_API_KEY\s*=\s*['\"]?[A-Za-z0-9_\-]{10,}"),
]


def _iter_scannable_files(root: Path) -> list[Path]:
    files: list[Path] = []
    for path in root.rglob("*"):
        if not path.is_file():
            continue
        relative = path.relative_to(root)
        if any(part in IGNORED_SCAN_DIRS for part in relative.parts):
            continue
        if str(relative).startswith("content/cache"):
            continue
        files.append(path)
    return files


def run_checks(refresh_github: bool = False) -> dict[str, Any]:
    bundle = build_bundle(write=False, refresh_github=refresh_github)
    invalid_urls: list[str] = []
    for link in bundle.profile.socialLinks:
        if not link.url.startswith(("https://", "http://", "mailto:")):
            invalid_urls.append(link.url)

    secret_findings: list[dict[str, str]] = []
    root = repo_root()
    for path in _iter_scannable_files(root):
        if path.name == ".env.example":
            continue
        if any(part.endswith(".egg-info") for part in path.parts):
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        for pattern in SECRET_PATTERNS:
            match = pattern.search(text)
            if match:
                secret_findings.append(
                    {
                        "file": str(path.relative_to(root)),
                        "match": match.group(0)[:40],
                    }
                )

    return {
        "bundleValid": True,
        "invalidUrls": invalid_urls,
        "secretFindings": secret_findings,
        "postCount": len(bundle.posts),
        "projectCount": len(bundle.projects.items),
        "warnings": bundle.generated.warnings,
    }
