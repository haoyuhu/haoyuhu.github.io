from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

import requests
import yaml

from haoyu_portfolio.utils import dedupe_preserve_order, dump_yaml, parse_json_text, slugify, summarize_text


REPO_ROOT = Path(__file__).resolve().parents[1]
OLD_POSTS_DIR = REPO_ROOT / ".tmp_oldsite" / "source" / "_posts"
CLUSTER_REPO = REPO_ROOT / ".tmp_clustering_playbook"
FLOMO_ALL_PATH = REPO_ROOT / ".tmp_flomo_all.json"
PUBLIC_LEGACY_DIR = REPO_ROOT / "public" / "legacy"
POSTS_DIR = REPO_ROOT / "content" / "posts"
MODEL_CACHE_DIR = REPO_ROOT / ".tmp_model_cache"
MIGRATION_MANIFEST_PATH = REPO_ROOT / ".tmp_migration_manifest.json"

MODEL_ENDPOINT = os.environ.get("PORTFOLIO_MIGRATION_ENDPOINT", "https://models.github.ai/inference/chat/completions")
MODEL_NAME = os.environ.get("PORTFOLIO_MIGRATION_MODEL", "openai/gpt-4.1-mini")
OPENAI_BASE_URL = os.environ.get("PORTFOLIO_OPENAI_BASE_URL", "").rstrip("/")
OPENAI_API_KEY = os.environ.get("PORTFOLIO_OPENAI_API_KEY", "")
MAX_MODEL_WORKERS = 5

TIMEZONE_SUFFIX = "+08:00"

LEGACY_ARTICLES = {
    "a-star",
    "aho-corasick-automaton",
    "android-studio-usage",
    "binary-tree",
    "cluster",
    "git-commit",
    "git-deployment",
    "github-page",
    "greedy-snake",
    "jekyii",
    "leftist-heap",
    "loading-data-from-multiple-sources-with-rxjava",
    "multiply-strings",
    "opencv",
    "prisoners-dilemma",
    "pseudo-random",
    "tsinghua-lib-app",
}

LEGACY_SLUG_OVERRIDES = {
    "cluster": "clustering-algorithms-overview",
    "jekyii": "using-jekyll-with-pages",
}

LEGACY_KIND_OVERRIDES = {
    "crc": "note",
    "git-merge-commit": "note",
    "heap": "note",
}

FLOMO_KEEP_SLUGS = [
    "MTA2MTY0NzQ1",
    "MTA2MjczMDQ3",
    "MTA2Mjk5Mjc2",
    "MTA2NDM4NjI5",
    "MTA2NjAxMjgy",
    "MTA2NjAyMzcx",
    "MTA2NjAwNDMw",
    "MTA3MjQyNDYx",
    "MTA3NDIzODg2",
    "MTA3NDYwOTkz",
    "MTA3NTI2NDUz",
    "MTA3NTYzMzU0",
    "MTA2ODk3OTEz",
    "MTA4NzY2MDcy",
    "MTA4NDYyMzMx",
    "MTA4MDcwNDAy",
    "MTA2MTA1MzYy",
    "MTEwNDA0NjUy",
    "MjE3NDE1MTA4",
    "MjE4MDI4MjAw",
    "MjE4MDI4NDUw",
    "MjE4ODQ0MTk1",
    "MjE5NjE4Nzk0",
    "MjIwMTYzNTM0",
    "MjIwMTczOTU1",
    "MjIwMjE5NDM2",
    "MjIwMjIwNjYy",
    "MjIyMTIwNzU3",
    "MjIyMTIxOTgz",
    "MjIzMTY0MDYx",
    "MjIzODYwNzE4",
    "MjI1NzQyNDQ1",
    "MjI1NDg3MTM3",
    "MjI2MzkxODg1",
    "MjI3MjcxNzU5",
    "MjI3MjA3NzIx",
]


LEGACY_ARTICLE_PROMPT = """
You are a world-class bilingual technical editor rewriting a legacy post for a modern personal knowledge garden.

Goals:
- Preserve the original topic and technical substance.
- Default to a first-class English version while also producing an equally strong Simplified Chinese version.
- Use rich Markdown when it genuinely improves clarity: headings, quotes, tables, fenced code blocks, Mermaid diagrams, bold text, and occasional <u>underline</u>.
- Fix broken Markdown, outdated formatting, obvious code bugs, naming issues, and low-signal repetition.
- Keep the writing sharp, tasteful, technical, and product-aware. Avoid fluff, generic textbook tone, and shallow paraphrase.
- Preserve the original publication era and topic instead of pretending it was written today.

Output JSON only, with this exact shape:
{
  "title": {"en": "...", "zh-CN": "..."},
  "summary": {"en": "...", "zh-CN": "..."},
  "body": {"en": "...", "zh-CN": "..."},
  "tags": ["..."]
}

Rules:
- Do not include front matter fences.
- Do not mention being an AI or the editing process.
- Use the provided asset paths if images are helpful.
- For articles, include at least one compact table or one Mermaid diagram whenever the topic has process, comparison, architecture, or algorithm flow.
- Prefer an editorial structure such as: thesis, system model, key mechanisms, trade-offs, practical pattern or algorithm, and a compact checklist or decision table.
- Make the article feel like the result of system-level thinking. Add clear judgments such as when to use, when to avoid, and what usually goes wrong.
- When discussing algorithms, deployments, or system design, actively use tables, quotes, and Mermaid to make the piece feel authored rather than merely translated.
- Keep each language version compact and intentional. Aim for roughly 5 to 7 sections and avoid sprawling textbook coverage.
- Keep each language body roughly within 450 to 700 words. Prefer density over coverage.
""".strip()


LEGACY_NOTE_PROMPT = """
You are a world-class bilingual technical editor rewriting a legacy short note for a modern technical garden.

Goals:
- Preserve the original topic and technical substance.
- Default to a first-class English version while also producing an equally strong Simplified Chinese version.
- Keep formatting intentionally light: short headings only if needed, lists, bold text, and occasional <u>underline</u>.
- Fix broken Markdown, outdated formatting, obvious code bugs, naming issues, and low-signal repetition.
- Keep the writing sharp, concise, and high-density. Garden notes should feel distilled, not bloated.
- The note should read like an experienced builder's private heuristic upgraded into a publishable insight.

Output JSON only, with this exact shape:
{
  "title": {"en": "...", "zh-CN": "..."},
  "summary": {"en": "...", "zh-CN": "..."},
  "body": {"en": "...", "zh-CN": "..."},
  "tags": ["..."]
}

Rules:
- Do not include front matter fences.
- Do not mention being an AI or the editing process.
- Use the provided asset paths if images are genuinely needed, but avoid heavy layout.
- Avoid tables, Mermaid diagrams, and long blockquotes unless absolutely essential.
- Keep each language body roughly within 220 to 380 words. Prefer 3 to 5 compact sections or list blocks.
""".strip()


FLOMO_PROMPT = """
You are turning a raw private memo into a publishable bilingual garden note.

Goals:
- Keep the theme, the human voice, and the original intuition.
- Sharpen it into a compact, high-signal technical note with strong product and engineering taste.
- Default to a first-class English version while also producing a strong Simplified Chinese version.
- Keep formatting intentionally light: short headings only if needed, lists, bold text, occasional <u>underline</u>, compact links, and code blocks only when truly useful.
- Keep it concise. Expand the idea, but do not become verbose.
- Preserve a human, memo-like cadence while making the reasoning tighter and more useful.

Output JSON only, with this exact shape:
{
  "title": {"en": "...", "zh-CN": "..."},
  "summary": {"en": "...", "zh-CN": "..."},
  "body": {"en": "...", "zh-CN": "..."},
  "tags": ["..."]
}

Rules:
- Do not mention flomo.
- Avoid shallow link dumps.
- If there are references, turn them into a compact references section.
- If there are images, weave them in naturally using the provided local asset paths.
- Keep each language body roughly within 220 to 380 words. Stay sharp and memo-like.
""".strip()


REPAIR_PROMPT = """
You repair malformed bilingual article JSON.
Return JSON only with this exact shape:
{
  "title": {"en": "...", "zh-CN": "..."},
  "summary": {"en": "...", "zh-CN": "..."},
  "body": {"en": "...", "zh-CN": "..."},
  "tags": ["..."]
}

Rules:
- Ensure title, summary, and body each contain both `en` and `zh-CN`.
- If one language variant is missing, translate or complete it while preserving the original intent and structure.
- Keep existing Markdown intact where possible.
""".strip()


def load_manifest() -> dict[str, Any]:
    if not MIGRATION_MANIFEST_PATH.exists():
        return {}
    return json.loads(MIGRATION_MANIFEST_PATH.read_text(encoding="utf-8"))


def save_manifest(manifest: dict[str, Any]) -> None:
    MIGRATION_MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def model_token() -> str:
    return subprocess.check_output(["gh", "auth", "token"], text=True).strip()


def coerce_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, (int, float, bool)):
        return str(value).strip()
    if isinstance(value, list):
        parts = [coerce_text(item) for item in value]
        return "\n".join(part for part in parts if part).strip()
    return str(value).strip()


def coerce_localized_block(payload: dict[str, Any], key: str) -> dict[str, str]:
    if not isinstance(payload, dict):
        payload = {}
    block = payload.get(key) or {}
    if isinstance(block, str):
        block = {"en": block, "zh-CN": block}
    elif not isinstance(block, dict):
        block = {}
    normalized = {
        "en": coerce_text(block.get("en") or block.get("en-US") or block.get("english")),
        "zh-CN": coerce_text(
            block.get("zh-CN")
            or block.get("zh_CN")
            or block.get("zh")
            or block.get("cn")
            or block.get("chinese")
        ),
    }
    if not normalized["en"] and normalized["zh-CN"]:
        normalized["en"] = normalized["zh-CN"]
    if not normalized["zh-CN"] and normalized["en"]:
        normalized["zh-CN"] = normalized["en"]
    return normalized


def coerce_tags(payload: dict[str, Any]) -> list[str]:
    if not isinstance(payload, dict):
        return []
    raw_tags = payload.get("tags") or []
    if isinstance(raw_tags, str):
        raw_tags = re.split(r"[,\n/]+", raw_tags)
    return [coerce_text(tag) for tag in raw_tags if coerce_text(tag)]


def generated_payload_is_complete(payload: dict[str, Any]) -> bool:
    return all(
        coerce_localized_block(payload, key)["en"] and coerce_localized_block(payload, key)["zh-CN"]
        for key in ("title", "summary", "body")
    )


def normalize_generated_payload(payload: dict[str, Any] | None, fallback: dict[str, Any] | None = None) -> dict[str, Any]:
    payload = payload if isinstance(payload, dict) else {}
    fallback = fallback if isinstance(fallback, dict) else {}
    normalized = {
        "title": coerce_localized_block(payload, "title"),
        "summary": coerce_localized_block(payload, "summary"),
        "body": coerce_localized_block(payload, "body"),
        "tags": coerce_tags(payload),
    }
    fallback_normalized = {
        "title": coerce_localized_block(fallback, "title"),
        "summary": coerce_localized_block(fallback, "summary"),
        "body": coerce_localized_block(fallback, "body"),
        "tags": coerce_tags(fallback),
    }
    for key in ("title", "summary", "body"):
        for locale in ("en", "zh-CN"):
            if not normalized[key][locale]:
                normalized[key][locale] = fallback_normalized[key][locale]
        if not normalized[key]["en"] and normalized[key]["zh-CN"]:
            normalized[key]["en"] = normalized[key]["zh-CN"]
        if not normalized[key]["zh-CN"] and normalized[key]["en"]:
            normalized[key]["zh-CN"] = normalized[key]["en"]
    if not normalized["summary"]["en"]:
        normalized["summary"]["en"] = normalized["title"]["en"]
    if not normalized["summary"]["zh-CN"]:
        normalized["summary"]["zh-CN"] = normalized["title"]["zh-CN"]
    if not normalized["body"]["en"]:
        normalized["body"]["en"] = normalized["summary"]["en"]
    if not normalized["body"]["zh-CN"]:
        normalized["body"]["zh-CN"] = normalized["summary"]["zh-CN"]
    if not normalized["tags"]:
        normalized["tags"] = fallback_normalized["tags"]
    return normalized


def load_cached_json(cache_path: Path) -> dict[str, Any] | None:
    if not cache_path.exists():
        return None
    try:
        return json.loads(cache_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None


def request_openai_compatible_curl(url: str, messages: list[dict[str, str]]) -> dict[str, Any]:
    response = subprocess.run(
        [
            "curl",
            "-sS",
            "--fail-with-body",
            "--max-time",
            "180",
            url,
            "-H",
            "Content-Type: application/json",
            "-H",
            f"Authorization: Bearer {OPENAI_API_KEY}",
            "-d",
            json.dumps(
                {
                    "model": MODEL_NAME,
                    "messages": messages,
                    "response_format": {"type": "json_object"},
                },
                ensure_ascii=False,
            ),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    payload = json.loads(response.stdout)
    return parse_json_text(payload["choices"][0]["message"]["content"])


def request_model_json(messages: list[dict[str, str]]) -> dict[str, Any]:
    use_openai_compatible = bool(OPENAI_BASE_URL and OPENAI_API_KEY)
    if use_openai_compatible:
        url = f"{OPENAI_BASE_URL}/chat/completions"
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
    else:
        url = MODEL_ENDPOINT
        headers = {
            "Authorization": f"Bearer {model_token()}",
            "Content-Type": "application/json",
        }

    if use_openai_compatible:
        last_error: Exception | None = None
        for attempt in range(6):
            try:
                return request_openai_compatible_curl(url, messages)
            except Exception as error:  # pragma: no cover - network bound
                last_error = error
                time.sleep(8 * (attempt + 1))
        raise RuntimeError(f"Model request failed: {last_error}")

    base_payload = {
        "model": MODEL_NAME,
        "messages": messages,
    }
    payload_variants = [
        {**base_payload, "response_format": {"type": "json_object"}},
        base_payload,
    ]

    last_error: Exception | None = None
    for payload in payload_variants:
        for attempt in range(6):
            try:
                response = requests.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=(30, 90),
                )
                response.raise_for_status()
                content = response.json()["choices"][0]["message"]["content"]
                return parse_json_text(content)
            except Exception as error:  # pragma: no cover - network bound
                last_error = error
                if isinstance(error, requests.HTTPError) and error.response is not None:
                    status_code = error.response.status_code
                    if payload.get("response_format") and status_code in {400, 404, 415, 422}:
                        break
                    retry_after = error.response.headers.get("Retry-After")
                    sleep_seconds = 8 * (attempt + 1)
                    if retry_after and retry_after.isdigit():
                        sleep_seconds = max(sleep_seconds, int(retry_after))
                else:
                    sleep_seconds = 8 * (attempt + 1)
                time.sleep(sleep_seconds)
        else:
            continue
    raise RuntimeError(f"Model request failed: {last_error}")


def call_model(
    cache_key: str,
    prompt: str,
    payload: dict[str, Any],
    *,
    fallback: dict[str, Any] | None = None,
    force: bool = False,
) -> dict[str, Any]:
    cache_path = MODEL_CACHE_DIR / f"{cache_key}.json"
    MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)
    messages = [
        {"role": "system", "content": prompt},
        {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
    ]
    cached = None if force else load_cached_json(cache_path)
    normalized = normalize_generated_payload(cached, fallback=fallback) if cached is not None else None
    if normalized is None or not generated_payload_is_complete(normalized):
        print(f"[model] generating {cache_key}", flush=True)
        generated = request_model_json(messages) if cached is None or force else cached
        normalized = normalize_generated_payload(generated, fallback=fallback)
    if not generated_payload_is_complete(normalized):
        repair_cache_path = MODEL_CACHE_DIR / f"{cache_key}_repair.json"
        repaired_cached = None if force else load_cached_json(repair_cache_path)
        repair_fallback = normalize_generated_payload(normalized, fallback=fallback)
        repaired = repaired_cached
        if repaired is None:
            print(f"[model] repairing {cache_key}", flush=True)
            repaired = request_model_json(
                [
                    {"role": "system", "content": REPAIR_PROMPT},
                    {
                        "role": "user",
                        "content": json.dumps(
                            {"broken_payload": normalized, "fallback_payload": repair_fallback},
                            ensure_ascii=False,
                        ),
                    },
                ]
            )
        normalized = normalize_generated_payload(repaired, fallback=repair_fallback)
        repair_cache_path.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
    cache_path.write_text(json.dumps(normalized, ensure_ascii=False, indent=2), encoding="utf-8")
    return normalized


def iso_date_parts(raw: str) -> tuple[str, str]:
    normalized = raw.strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", normalized):
        date = normalized
        return date, f"{date}T00:00:00{TIMEZONE_SUFFIX}"

    dt = datetime.strptime(normalized, "%Y-%m-%d %H:%M:%S")
    date = dt.strftime("%Y-%m-%d")
    published_at = dt.strftime("%Y-%m-%dT%H:%M:%S") + TIMEZONE_SUFFIX
    return date, published_at


def extract_urls(text: str) -> list[str]:
    return dedupe_preserve_order(re.findall(r"https?://[^\s)]+", text))


def read_legacy_post(stem: str) -> tuple[dict[str, Any], str]:
    source_path = OLD_POSTS_DIR / f"{stem}.md"
    raw = source_path.read_text(encoding="utf-8", errors="replace")
    match = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.S)
    if not match:
        return {}, raw
    front_matter = yaml.safe_load(match.group(1)) or {}
    body = match.group(2)
    return front_matter, body


def replace_legacy_asset_paths(body: str, public_slug: str) -> str:
    cleaned = body.replace("<!--more-->", "").replace("\u00a0", " ")
    return re.sub(
        r"/\d{4}/\d{2}/\d{2}/([A-Za-z0-9\-]+)/",
        lambda _: f"/legacy/{public_slug}/",
        cleaned,
    )


def shrink_markdown_for_model(body: str, *, limit: int = 9000) -> str:
    if len(body) <= limit:
        return body

    def trim_code_block(match: re.Match[str]) -> str:
        language = (match.group(1) or "").strip()
        code = match.group(2).strip().splitlines()
        preview = "\n".join(code[:32])
        return f"```{language}\n{preview}\n# ... trimmed for editing context ...\n```"

    condensed = re.sub(r"```([\w+-]*)\n(.*?)```", trim_code_block, body, flags=re.S)
    if len(condensed) <= limit:
        return condensed

    sections: list[str] = []
    current: list[str] = []
    for line in condensed.splitlines():
        if line.startswith("#") and current:
            sections.append("\n".join(current).strip())
            current = [line]
        else:
            current.append(line)
    if current:
        sections.append("\n".join(current).strip())

    rebuilt: list[str] = []
    current_length = 0
    for section in sections:
        clipped = section[: min(len(section), 1400)]
        if current_length + len(clipped) > limit:
            break
        rebuilt.append(clipped)
        current_length += len(clipped)

    if rebuilt:
        return "\n\n".join(rebuilt)
    return condensed[:limit]


def copy_legacy_assets(stem: str, public_slug: str) -> list[str]:
    asset_dir = OLD_POSTS_DIR / stem
    if not asset_dir.exists():
        return []

    destination = PUBLIC_LEGACY_DIR / public_slug
    destination.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    for file_path in sorted(asset_dir.iterdir()):
        if not file_path.is_file():
            continue
        target = destination / file_path.name
        shutil.copy2(file_path, target)
        urls.append(f"/legacy/{public_slug}/{file_path.name}")
    return urls


def copy_cluster_assets(public_slug: str) -> list[str]:
    destination = PUBLIC_LEGACY_DIR / public_slug
    destination.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    for file_path in sorted(CLUSTER_REPO.glob("*.png")):
        target = destination / file_path.name
        shutil.copy2(file_path, target)
        urls.append(f"/legacy/{public_slug}/{file_path.name}")
    return urls


def build_cluster_payload() -> dict[str, Any]:
    readme_en = (CLUSTER_REPO / "README.md").read_text(encoding="utf-8")
    readme_zh = (CLUSTER_REPO / "README.zh-CN.md").read_text(encoding="utf-8")
    front_matter, old_body = read_legacy_post("cluster")
    public_slug = LEGACY_SLUG_OVERRIDES["cluster"]
    asset_urls = copy_cluster_assets(public_slug)
    return {
        "title_hint": front_matter.get("title"),
        "legacy_body": shrink_markdown_for_model(replace_legacy_asset_paths(old_body, public_slug), limit=3200),
        "modern_source_en": shrink_markdown_for_model(readme_en, limit=3600),
        "modern_source_zh": shrink_markdown_for_model(readme_zh, limit=3600),
        "kind": "article",
        "asset_urls": asset_urls,
        "special_instruction": "Treat the clustering-playbook repository as the new canonical version. Upgrade the old article into a modern playbook that reflects the refreshed repository.",
    }


def legacy_kind(stem: str) -> str:
    if stem in LEGACY_KIND_OVERRIDES:
        return LEGACY_KIND_OVERRIDES[stem]
    if stem.startswith("leetcode-") or stem.startswith("lintcode-"):
        return "note"
    return "article" if stem in LEGACY_ARTICLES else "note"


def ensure_slug(manifest: dict[str, Any], source_key: str, title_en: str, fallback_slug: str | None = None) -> str:
    if source_key in manifest and manifest[source_key].get("slug"):
        return manifest[source_key]["slug"]
    slug = fallback_slug or slugify(title_en)
    manifest[source_key] = {**manifest.get(source_key, {}), "slug": slug}
    return slug


def build_fallback_payload(*, title_hint: str, body_en: str, body_zh: str | None = None, tags: list[str] | None = None) -> dict[str, Any]:
    localized_title = coerce_text(title_hint)
    fallback_body_en = coerce_text(body_en)
    fallback_body_zh = coerce_text(body_zh) or fallback_body_en
    return {
        "title": {
            "en": localized_title,
            "zh-CN": localized_title,
        },
        "summary": {
            "en": summarize_text(fallback_body_en, limit=180) if fallback_body_en else localized_title,
            "zh-CN": summarize_text(fallback_body_zh, limit=90) if fallback_body_zh else localized_title,
        },
        "body": {
            "en": fallback_body_en,
            "zh-CN": fallback_body_zh,
        },
        "tags": tags or [],
    }


def write_post(*, kind: str, slug: str, date: str, published_at: str, title: dict[str, str], summary: dict[str, str], body: dict[str, str], tags: list[str]) -> None:
    directory = POSTS_DIR / ("articles" if kind == "article" else "garden") / slug
    directory.mkdir(parents=True, exist_ok=True)

    opposite_directory = POSTS_DIR / ("garden" if kind == "article" else "articles") / slug
    if opposite_directory.exists():
        shutil.rmtree(opposite_directory)

    dump_yaml(
        directory / "meta.yaml",
        {
            "id": f"{kind}-{slug}",
            "kind": kind,
            "slug": slug,
            "date": date,
            "publishedAt": published_at,
            "title": {"zh-CN": title["zh-CN"], "en": title["en"]},
            "summary": {"zh-CN": summary["zh-CN"], "en": summary["en"]},
            "tags": tags,
        },
    )
    (directory / "body.en.md").write_text(body["en"].strip() + "\n", encoding="utf-8")
    (directory / "body.zh-CN.md").write_text(body["zh-CN"].strip() + "\n", encoding="utf-8")


def migrate_legacy_posts(
    *,
    manifest: dict[str, Any],
    force: bool = False,
    limit: int | None = None,
    workers: int = 2,
    stems: list[str] | None = None,
) -> None:
    stems = stems or [path.stem for path in sorted(OLD_POSTS_DIR.glob("*.md"))]
    if limit is not None:
        stems = stems[:limit]

    def prepare_legacy(stem: str) -> dict[str, Any]:
        front_matter, raw_body = read_legacy_post(stem)
        date, published_at = iso_date_parts(str(front_matter.get("date")))
        kind = legacy_kind(stem)
        public_slug = LEGACY_SLUG_OVERRIDES.get(stem, stem)
        asset_urls = copy_legacy_assets(stem, public_slug)
        payload = {
            "title_hint": front_matter.get("title"),
            "kind": kind,
            "tags": front_matter.get("tags") or [],
            "categories": front_matter.get("categories") or [],
            "asset_urls": asset_urls,
            "source_markdown": shrink_markdown_for_model(replace_legacy_asset_paths(raw_body, public_slug)),
            "special_instruction": "Preserve the original publication theme, but rewrite it into a sharper modern portfolio entry.",
        }
        fallback = build_fallback_payload(
            title_hint=str(front_matter.get("title") or public_slug),
            body_en=payload["source_markdown"],
            body_zh=payload["source_markdown"],
            tags=[str(tag) for tag in (front_matter.get("tags") or [])],
        )
        prompt = LEGACY_ARTICLE_PROMPT if kind == "article" else LEGACY_NOTE_PROMPT
        generated = call_model(f"legacy_{stem}", prompt, payload, fallback=fallback, force=force)
        return {
            "stem": stem,
            "front_matter": front_matter,
            "date": date,
            "publishedAt": published_at,
            "kind": kind,
            "publicSlug": public_slug,
            "generated": generated,
        }

    with ThreadPoolExecutor(max_workers=workers) as executor:
        for index, item in enumerate(executor.map(prepare_legacy, stems), start=1):
            stem = item["stem"]
            print(f"[legacy {index}/{len(stems)}] {stem}")
            source_key = f"legacy:{stem}"
            generated = item["generated"]
            title_en = generated["title"]["en"].strip()
            slug = ensure_slug(manifest, source_key, title_en, fallback_slug=item["publicSlug"])
            tags = dedupe_preserve_order(
                [str(tag) for tag in (generated.get("tags") or item["front_matter"].get("tags") or [])]
            )
            write_post(
                kind=item["kind"],
                slug=slug,
                date=item["date"],
                published_at=item["publishedAt"],
                title={"en": title_en, "zh-CN": generated["title"]["zh-CN"].strip()},
                summary={
                    "en": generated["summary"]["en"].strip(),
                    "zh-CN": generated["summary"]["zh-CN"].strip(),
                },
                body={
                    "en": generated["body"]["en"].strip(),
                    "zh-CN": generated["body"]["zh-CN"].strip(),
                },
                tags=tags,
            )
            manifest[source_key] = {
                "slug": slug,
                "kind": item["kind"],
                "date": item["date"],
                "publishedAt": item["publishedAt"],
            }
            save_manifest(manifest)


def download_flomo_assets(memo_slug: str, files: list[dict[str, Any]]) -> list[str]:
    if not files:
        return []
    destination = PUBLIC_LEGACY_DIR / "flomo" / memo_slug.lower()
    destination.mkdir(parents=True, exist_ok=True)
    urls: list[str] = []
    for index, file_info in enumerate(files, start=1):
        source_url = file_info.get("url")
        if not source_url:
            continue
        parsed = urlparse(source_url)
        suffix = Path(file_info.get("name") or parsed.path).suffix or ".bin"
        file_name = slugify(Path(file_info.get("name") or f"asset-{index}").stem) + suffix
        target = destination / file_name
        if not target.exists():
            response = requests.get(source_url, timeout=120)
            response.raise_for_status()
            target.write_bytes(response.content)
        urls.append(f"/legacy/flomo/{memo_slug.lower()}/{file_name}")
    return urls


def migrate_flomo_notes(
    *,
    manifest: dict[str, Any],
    force: bool = False,
    limit: int | None = None,
    workers: int = 2,
    selected_slugs: list[str] | None = None,
) -> None:
    payload = json.loads(FLOMO_ALL_PATH.read_text(encoding="utf-8"))
    memo_map = {memo["slug"]: memo for memo in payload["data"]}
    slugs = selected_slugs or list(FLOMO_KEEP_SLUGS)
    slugs = [slug for slug in slugs if slug in memo_map]
    if limit is not None:
        slugs = slugs[:limit]

    def prepare_flomo(memo_slug: str) -> dict[str, Any]:
        memo = memo_map[memo_slug]
        date, published_at = iso_date_parts(memo["created_at"])
        asset_urls = download_flomo_assets(memo_slug, memo.get("files") or [])
        text = (memo.get("content_text") or "").strip()
        model_payload = {
            "created_at": memo["created_at"],
            "updated_at": memo.get("updated_at"),
            "raw_text": text,
            "links": extract_urls(text),
            "asset_urls": asset_urls,
            "special_instruction": "Turn this into a garden note with a high-signal personal-technical voice. Keep it human, but make it publishable.",
        }
        fallback = build_fallback_payload(
            title_hint=summarize_text(text, limit=72) or memo_slug,
            body_en=text,
            body_zh=text,
            tags=["garden", "ai"],
        )
        generated = call_model(f"flomo_{memo_slug}", FLOMO_PROMPT, model_payload, fallback=fallback, force=force)
        return {
            "memoSlug": memo_slug,
            "date": date,
            "publishedAt": published_at,
            "generated": generated,
        }

    with ThreadPoolExecutor(max_workers=workers) as executor:
        for index, item in enumerate(executor.map(prepare_flomo, slugs), start=1):
            memo_slug = item["memoSlug"]
            print(f"[flomo {index}/{len(slugs)}] {memo_slug}")
            source_key = f"flomo:{memo_slug}"
            generated = item["generated"]
            slug = ensure_slug(manifest, source_key, generated["title"]["en"], fallback_slug=None)
            tags = dedupe_preserve_order([str(tag) for tag in (generated.get("tags") or ["ai", "garden"])])
            write_post(
                kind="note",
                slug=slug,
                date=item["date"],
                published_at=item["publishedAt"],
                title={
                    "en": generated["title"]["en"].strip(),
                    "zh-CN": generated["title"]["zh-CN"].strip(),
                },
                summary={
                    "en": generated["summary"]["en"].strip(),
                    "zh-CN": generated["summary"]["zh-CN"].strip(),
                },
                body={
                    "en": generated["body"]["en"].strip(),
                    "zh-CN": generated["body"]["zh-CN"].strip(),
                },
                tags=tags,
            )
            manifest[source_key] = {
                "slug": slug,
                "kind": "note",
                "date": item["date"],
                "publishedAt": item["publishedAt"],
            }
            save_manifest(manifest)


def main() -> None:
    parser = argparse.ArgumentParser(description="Migrate legacy posts and curated flomo notes into the portfolio content system.")
    parser.add_argument("--force", action="store_true", help="Ignore cached model outputs and regenerate everything.")
    parser.add_argument("--skip-legacy", action="store_true", help="Skip migrating legacy posts.")
    parser.add_argument("--skip-flomo", action="store_true", help="Skip migrating curated flomo notes.")
    parser.add_argument("--legacy-limit", type=int, default=None, help="Only migrate the first N legacy posts.")
    parser.add_argument("--flomo-limit", type=int, default=None, help="Only migrate the first N curated flomo notes.")
    parser.add_argument("--workers", type=int, default=5, help="Concurrent model requests to run at once.")
    parser.add_argument("--legacy-stems", nargs="*", default=None, help="Specific legacy post stems to migrate.")
    parser.add_argument("--flomo-slugs", nargs="*", default=None, help="Specific flomo slugs to migrate.")
    args = parser.parse_args()

    workers = max(1, min(args.workers, MAX_MODEL_WORKERS))
    manifest = load_manifest()
    if not args.skip_legacy:
        stems = None
        if args.legacy_stems:
            stems = [stem for stem in args.legacy_stems if (OLD_POSTS_DIR / f"{stem}.md").exists()]
        migrate_legacy_posts(manifest=manifest, force=args.force, limit=args.legacy_limit, workers=workers, stems=stems)
    if not args.skip_flomo:
        migrate_flomo_notes(
            manifest=manifest,
            force=args.force,
            limit=args.flomo_limit,
            workers=workers,
            selected_slugs=args.flomo_slugs,
        )
    save_manifest(manifest)


if __name__ == "__main__":
    main()
