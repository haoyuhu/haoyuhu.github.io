from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts import migrate_legacy_content as migration


MANIFEST_PARTS_DIR = REPO_ROOT / ".tmp_manifest_parts"


LEGACY_ARTICLE_EN_PROMPT = """
You are a world-class technical editor rewriting a legacy post for a modern personal knowledge garden.

Output JSON only with this exact shape:
{
  "title": "...",
  "summary": "...",
  "body": "...",
  "tags": ["..."]
}

Rules:
- Write in English only.
- Preserve the original topic and technical substance, but upgrade the writing quality and structure.
- Use rich Markdown when it improves clarity: headings, quotes, tables, fenced code blocks, Mermaid, bold text, and occasional <u>underline</u>.
- Fix broken Markdown, outdated formatting, obvious code bugs, naming issues, and low-signal repetition.
- Keep the article compact, intentional, and system-minded.
- Include at least one compact table or Mermaid diagram when the topic benefits from process, comparison, architecture, or algorithm flow.
- Aim for 450 to 700 words in the body.
- Do not include front matter fences.
""".strip()


LEGACY_NOTE_EN_PROMPT = """
You are a world-class technical editor rewriting a legacy short note for a modern technical garden.

Output JSON only with this exact shape:
{
  "title": "...",
  "summary": "...",
  "body": "...",
  "tags": ["..."]
}

Rules:
- Write in English only.
- Preserve the original technical idea, but make it sharper, cleaner, and more publishable.
- Keep formatting intentionally light: short headings only if needed, lists, bold text, and occasional <u>underline</u>.
- Fix broken Markdown, outdated formatting, obvious code bugs, naming issues, and low-signal repetition.
- Keep the note concise and high-density.
- Aim for 220 to 320 words in the body.
- Do not include front matter fences.
""".strip()


FLOMO_EN_PROMPT = """
You are turning a raw private memo into a publishable technical garden note.

Output JSON only with this exact shape:
{
  "title": "...",
  "summary": "...",
  "body": "...",
  "tags": ["..."]
}

Rules:
- Write in English only.
- Keep the theme, human voice, and original intuition, but sharpen it into a compact, high-signal note.
- Keep formatting intentionally light: short headings only if needed, lists, bold text, occasional <u>underline</u>, and code blocks only when truly useful.
- If there are references, turn them into a compact references section instead of a link dump.
- Keep it concise, tasteful, and memo-like.
- Aim for 220 to 320 words in the body.
""".strip()


ZH_TRANSLATION_PROMPT = """
You translate an English technical post into polished Simplified Chinese.

Output JSON only with this exact shape:
{
  "title": "...",
  "summary": "...",
  "body": "..."
}

Rules:
- Translate into Simplified Chinese only.
- Preserve Markdown structure, headings, bullets, emphasis, tables, Mermaid, blockquotes, links, and code fences.
- Do not translate code identifiers, filenames, URLs, or Mermaid syntax keywords unless it is natural in labels.
- Keep the tone sharp, readable, and professional.
- Do not add or remove major sections.
""".strip()


def english_completion_budget(kind: str) -> int:
    return 1800 if kind == "article" else 700


def translation_completion_budget(kind: str) -> int:
    return 1800 if kind == "article" else 900


def prepare_legacy(stem: str) -> dict[str, Any]:
    front_matter, raw_body = migration.read_legacy_post(stem)
    date, published_at = migration.iso_date_parts(str(front_matter.get("date")))
    kind = migration.legacy_kind(stem)
    public_slug = migration.LEGACY_SLUG_OVERRIDES.get(stem, stem)
    asset_urls = migration.copy_legacy_assets(stem, public_slug)
    payload = {
        "title_hint": front_matter.get("title"),
        "kind": kind,
        "tags": front_matter.get("tags") or [],
        "categories": front_matter.get("categories") or [],
        "asset_urls": asset_urls,
        "source_markdown": migration.shrink_markdown_for_model(
            migration.replace_legacy_asset_paths(raw_body, public_slug)
        ),
        "special_instruction": "Preserve the original publication theme, but rewrite it into a sharper modern portfolio entry.",
    }
    fallback = migration.build_fallback_payload(
        title_hint=str(front_matter.get("title") or public_slug),
        body_en=payload["source_markdown"],
        body_zh=payload["source_markdown"],
        tags=[str(tag) for tag in (front_matter.get("tags") or [])],
    )
    prompt = LEGACY_ARTICLE_EN_PROMPT if kind == "article" else LEGACY_NOTE_EN_PROMPT
    return {
        "request": {
            "model": migration.MODEL_NAME,
            "messages": [
                {"role": "system", "content": prompt},
                {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
            ],
            "max_completion_tokens": english_completion_budget(kind),
            "response_format": {"type": "json_object"},
        },
        "context": {
            "source_key": f"legacy:{stem}",
            "kind": kind,
            "slug": public_slug,
            "date": date,
            "publishedAt": published_at,
            "front_tags": [str(tag) for tag in (front_matter.get("tags") or [])],
            "fallback": fallback,
        },
    }


def prepare_flomo(memo_slug: str) -> dict[str, Any]:
    payload = json.loads(migration.FLOMO_ALL_PATH.read_text(encoding="utf-8"))
    memo_map = {memo["slug"]: memo for memo in payload["data"]}
    memo = memo_map[memo_slug]
    date, published_at = migration.iso_date_parts(memo["created_at"])
    asset_urls = migration.download_flomo_assets(memo_slug, memo.get("files") or [])
    text = (memo.get("content_text") or "").strip()
    model_payload = {
        "created_at": memo["created_at"],
        "updated_at": memo.get("updated_at"),
        "raw_text": text,
        "links": migration.extract_urls(text),
        "asset_urls": asset_urls,
        "special_instruction": "Turn this into a garden note with a high-signal personal-technical voice. Keep it human, but make it publishable.",
    }
    fallback = migration.build_fallback_payload(
        title_hint=migration.summarize_text(text, limit=72) or memo_slug,
        body_en=text,
        body_zh=text,
        tags=["garden", "ai"],
    )
    return {
        "request": {
            "model": migration.MODEL_NAME,
            "messages": [
                {"role": "system", "content": FLOMO_EN_PROMPT},
                {"role": "user", "content": json.dumps(model_payload, ensure_ascii=False)},
            ],
            "max_completion_tokens": english_completion_budget("note"),
            "response_format": {"type": "json_object"},
        },
        "context": {
            "source_key": f"flomo:{memo_slug}",
            "kind": "note",
            "slug": None,
            "date": date,
            "publishedAt": published_at,
            "front_tags": ["garden", "ai"],
            "fallback": fallback,
        },
    }


def write_manifest_part(source_key: str, payload: dict[str, Any]) -> None:
    MANIFEST_PARTS_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r"[^a-zA-Z0-9_-]+", "_", source_key)
    (MANIFEST_PARTS_DIR / f"{safe_name}.json").write_text(
        json.dumps({"source_key": source_key, "payload": payload}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def prepare(mode: str, identifier: str, tmpdir: Path) -> None:
    tmpdir.mkdir(parents=True, exist_ok=True)
    prepared = prepare_legacy(identifier) if mode == "legacy" else prepare_flomo(identifier)
    (tmpdir / "request.json").write_text(json.dumps(prepared["request"], ensure_ascii=False), encoding="utf-8")
    (tmpdir / "context.json").write_text(json.dumps(prepared["context"], ensure_ascii=False), encoding="utf-8")


def normalize_english_payload(payload: dict[str, Any] | None, fallback: dict[str, Any] | None = None) -> dict[str, Any]:
    payload = payload if isinstance(payload, dict) else {}
    fallback_normalized = migration.normalize_generated_payload(fallback, fallback=fallback)
    normalized = {
        "title": migration.coerce_text(payload.get("title")) or fallback_normalized["title"]["en"],
        "summary": migration.coerce_text(payload.get("summary")) or fallback_normalized["summary"]["en"],
        "body": migration.coerce_text(payload.get("body")) or fallback_normalized["body"]["en"],
        "tags": migration.coerce_tags(payload) or fallback_normalized["tags"],
    }
    if not normalized["summary"]:
        normalized["summary"] = normalized["title"]
    if not normalized["body"]:
        normalized["body"] = normalized["summary"]
    return normalized


def normalize_translation_payload(payload: dict[str, Any] | None, english: dict[str, Any]) -> dict[str, str]:
    payload = payload if isinstance(payload, dict) else {}
    translated = {
        "title": migration.coerce_text(payload.get("title")) or english["title"],
        "summary": migration.coerce_text(payload.get("summary")) or english["summary"],
        "body": migration.coerce_text(payload.get("body")) or english["body"],
    }
    if not translated["summary"]:
        translated["summary"] = translated["title"]
    if not translated["body"]:
        translated["body"] = translated["summary"]
    return translated


def extract_response_payload(response_path: Path) -> dict[str, Any]:
    response = json.loads(response_path.read_text(encoding="utf-8"))
    raw_content = response["choices"][0]["message"]["content"]
    return migration.parse_json_text(raw_content)


def finalize_english(tmpdir: Path) -> None:
    context = json.loads((tmpdir / "context.json").read_text(encoding="utf-8"))
    english = normalize_english_payload(
        extract_response_payload(tmpdir / "response.en.json"),
        fallback=context["fallback"],
    )
    (tmpdir / "generated.en.json").write_text(json.dumps(english, ensure_ascii=False), encoding="utf-8")


def prepare_zh(tmpdir: Path) -> None:
    context = json.loads((tmpdir / "context.json").read_text(encoding="utf-8"))
    english = json.loads((tmpdir / "generated.en.json").read_text(encoding="utf-8"))
    payload = {
        "kind": context["kind"],
        "title": english["title"],
        "summary": english["summary"],
        "body": english["body"],
    }
    request = {
        "model": migration.MODEL_NAME,
        "messages": [
            {"role": "system", "content": ZH_TRANSLATION_PROMPT},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
        "max_completion_tokens": translation_completion_budget(context["kind"]),
        "response_format": {"type": "json_object"},
    }
    (tmpdir / "request.zh.json").write_text(json.dumps(request, ensure_ascii=False), encoding="utf-8")


def coerce_stream_text(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, str):
                parts.append(item)
                continue
            if not isinstance(item, dict):
                continue
            text = item.get("text")
            if isinstance(text, str):
                parts.append(text)
                continue
            nested = item.get("content")
            if isinstance(nested, str):
                parts.append(nested)
        return "".join(parts)
    return ""


def iter_sse_data(payload: str) -> list[str]:
    events: list[str] = []
    current: list[str] = []
    for line in payload.splitlines():
        if line.startswith("data:"):
            current.append(line[5:].lstrip())
            continue
        if not line.strip() and current:
            events.append("\n".join(current))
            current = []
    if current:
        events.append("\n".join(current))
    return events


def stream_to_response(stream_path: Path, response_path: Path) -> None:
    raw = stream_path.read_text(encoding="utf-8")
    parts: list[str] = []
    for event_payload in iter_sse_data(raw):
        if event_payload == "[DONE]":
            break
        event = json.loads(event_payload)
        if "error" in event:
            raise RuntimeError(json.dumps(event["error"], ensure_ascii=False))
        choice = (event.get("choices") or [{}])[0]
        delta = choice.get("delta") or {}
        text = coerce_stream_text(delta.get("content"))
        if not text and isinstance(choice.get("message"), dict):
            text = coerce_stream_text(choice["message"].get("content"))
        if text:
            parts.append(text)
    if not parts:
        raise RuntimeError(f"No streamed content found in {stream_path}")
    response_path.write_text(
        json.dumps({"choices": [{"message": {"content": "".join(parts)}}]}, ensure_ascii=False),
        encoding="utf-8",
    )


def commit(tmpdir: Path) -> None:
    context = json.loads((tmpdir / "context.json").read_text(encoding="utf-8"))
    english = json.loads((tmpdir / "generated.en.json").read_text(encoding="utf-8"))
    translated = normalize_translation_payload(
        extract_response_payload(tmpdir / "response.zh.json"),
        english=english,
    )
    slug = context["slug"] or migration.slugify(english["title"])
    tags = migration.dedupe_preserve_order(english.get("tags") or context["front_tags"])
    migration.write_post(
        kind="article" if context["kind"] == "article" else "note",
        slug=slug,
        date=context["date"],
        published_at=context["publishedAt"],
        title={
            "en": english["title"].strip(),
            "zh-CN": translated["title"].strip(),
        },
        summary={
            "en": english["summary"].strip(),
            "zh-CN": translated["summary"].strip(),
        },
        body={
            "en": english["body"].strip(),
            "zh-CN": translated["body"].strip(),
        },
        tags=tags,
    )
    write_manifest_part(
        context["source_key"],
        {
            "slug": slug,
            "kind": context["kind"],
            "date": context["date"],
            "publishedAt": context["publishedAt"],
        },
    )


def combine_manifest() -> None:
    manifest = migration.load_manifest()
    if MANIFEST_PARTS_DIR.exists():
        for part_path in sorted(MANIFEST_PARTS_DIR.glob("*.json")):
            part = json.loads(part_path.read_text(encoding="utf-8"))
            manifest[part["source_key"]] = part["payload"]
    migration.save_manifest(manifest)


def main() -> None:
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest="command", required=True)

    prepare_parser = subparsers.add_parser("prepare")
    prepare_parser.add_argument("mode", choices=["legacy", "flomo"])
    prepare_parser.add_argument("identifier")
    prepare_parser.add_argument("tmpdir")

    finalize_en_parser = subparsers.add_parser("finalize-en")
    finalize_en_parser.add_argument("tmpdir")

    prepare_zh_parser = subparsers.add_parser("prepare-zh")
    prepare_zh_parser.add_argument("tmpdir")

    commit_parser = subparsers.add_parser("commit")
    commit_parser.add_argument("tmpdir")

    stream_parser = subparsers.add_parser("stream-to-response")
    stream_parser.add_argument("stream_path")
    stream_parser.add_argument("response_path")

    subparsers.add_parser("combine-manifest")

    args = parser.parse_args()
    if args.command == "prepare":
        prepare(args.mode, args.identifier, Path(args.tmpdir))
        return
    if args.command == "finalize-en":
        finalize_english(Path(args.tmpdir))
        return
    if args.command == "prepare-zh":
        prepare_zh(Path(args.tmpdir))
        return
    if args.command == "commit":
        commit(Path(args.tmpdir))
        return
    if args.command == "stream-to-response":
        stream_to_response(Path(args.stream_path), Path(args.response_path))
        return
    combine_manifest()


if __name__ == "__main__":
    main()
