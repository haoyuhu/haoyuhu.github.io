from __future__ import annotations

from datetime import date
from pathlib import Path
from typing import Any

from ..llm.base import LLMProvider
from ..paths import posts_dir
from ..utils import dedupe_preserve_order, dump_yaml, slugify, summarize_text


CONTENT_SYSTEM_PROMPTS = {
    "note": """
你是一个数字花园整理助手。
请把输入整理为一篇简洁、结构清晰、默认中英双语的短文，输出 JSON：
{
  "slug": "...",
  "title": {"zh-CN": "...", "en": "..."},
  "summary": {"zh-CN": "...", "en": "..."},
  "body": {"zh-CN": "...", "en": "..."},
  "tags": ["..."],
  "date": "YYYY-MM-DD"
}
只输出 JSON。
""".strip(),
    "article": """
你是一个技术长文编辑助手。
请把输入整理为结构完整的 Markdown 技术文章，输出 JSON：
{
  "slug": "...",
  "title": {"zh-CN": "...", "en": "..."},
  "summary": {"zh-CN": "...", "en": "..."},
  "body": {"zh-CN": "...", "en": "..."},
  "tags": ["..."],
  "date": "YYYY-MM-DD"
}
只输出 JSON。
""".strip(),
}


def voice_capture_available() -> bool:
    try:
        import faster_whisper  # noqa: F401
        import sounddevice  # noqa: F401
        import numpy  # noqa: F401
        import scipy  # noqa: F401

        return True
    except Exception:
        return False


def fallback_multilingual_payload(kind: str, raw_text: str, title: str | None, tags: list[str]) -> dict[str, Any]:
    candidate_title = title or raw_text.splitlines()[0] or ("新文章" if kind == "article" else "新笔记")
    slug = slugify(candidate_title)
    summary = summarize_text(raw_text, limit=160)
    return {
        "slug": slug,
        "title": {"zh-CN": candidate_title, "en": candidate_title},
        "summary": {"zh-CN": summary, "en": summary},
        "body": {"zh-CN": raw_text.strip(), "en": raw_text.strip()},
        "tags": dedupe_preserve_order(tags or [kind, "draft"]),
        "date": str(date.today()),
    }


def create_content_entry(
    kind: str,
    raw_text: str,
    provider: LLMProvider,
    title: str | None = None,
    tags: list[str] | None = None,
    dry_run: bool = False,
) -> dict[str, Any]:
    tag_list = dedupe_preserve_order(tags or [])
    payload = fallback_multilingual_payload(kind, raw_text, title=title, tags=tag_list)
    if provider.is_available():
        prompt = f"标题偏好：{title or '自动生成'}\n标签偏好：{', '.join(tag_list) or 'auto'}\n\n原始内容：\n{raw_text}"
        try:
            payload = provider.generate_json(prompt, system_prompt=CONTENT_SYSTEM_PROMPTS[kind])
        except Exception:
            payload = fallback_multilingual_payload(kind, raw_text, title=title, tags=tag_list)

    slug = payload.get("slug") or slugify(title or kind)
    meta = {
        "id": f"{kind}-{slug}",
        "kind": kind,
        "slug": slug,
        "date": payload.get("date") or str(date.today()),
        "title": payload["title"],
        "summary": payload["summary"],
        "tags": dedupe_preserve_order(payload.get("tags") or tag_list),
    }
    destination = posts_dir() / ("garden" if kind == "note" else "articles") / slug
    if not dry_run:
        destination.mkdir(parents=True, exist_ok=True)
        dump_yaml(destination / "meta.yaml", meta)
        (destination / "body.zh-CN.md").write_text(payload["body"]["zh-CN"].strip() + "\n", encoding="utf-8")
        (destination / "body.en.md").write_text(payload["body"]["en"].strip() + "\n", encoding="utf-8")

    return {
        "meta": meta,
        "body": payload["body"],
        "path": str(destination),
        "applied": not dry_run,
        "voiceSupported": voice_capture_available(),
    }
