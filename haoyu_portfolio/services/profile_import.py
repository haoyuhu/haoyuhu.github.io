from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from pypdf import PdfReader

from ..llm.base import LLMProvider
from ..paths import config_dir
from ..utils import deep_merge, dump_yaml, load_yaml, parse_json_text, summarize_text


PROFILE_IMPORT_SYSTEM_PROMPT = """
你是一个简历结构化与双语标准化助手。
请从输入简历中提取 profile 与 resume 信息，输出 JSON：
{
  "profile": {
    "name": "...",
    "title": {"zh-CN": "...", "en": "..."},
    "location": {"zh-CN": "...", "en": "..."},
    "email": "...",
    "biography": {"zh-CN": "...", "en": "..."},
    "socialLinks": [{"id": "github", "label": {"zh-CN": "...", "en": "..."}, "url": "...", "icon": "github"}]
  },
  "resume": {
    "summary": {"zh-CN": "...", "en": "..."},
    "experience": [],
    "education": [],
    "skillGroups": []
  }
}
只输出 JSON，不要解释。
""".strip()


def extract_resume_text(source_path: Path) -> str:
    if source_path.suffix.lower() == ".pdf":
        reader = PdfReader(str(source_path))
        return "\n".join((page.extract_text() or "").strip() for page in reader.pages).strip()
    return source_path.read_text(encoding="utf-8")


def heuristic_resume_payload(raw_text: str) -> dict[str, Any]:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    first_line = lines[0] if lines else "Haoyu Hu"
    email_match = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", raw_text)
    urls = re.findall(r"https?://[^\s)]+", raw_text)
    summary = summarize_text(" ".join(lines[:6]), limit=240)
    return {
        "profile": {
            "name": first_line,
            "title": {"zh-CN": "待校对的职位标题", "en": "Title to be reviewed"},
            "location": {"zh-CN": "待补充地点", "en": "Location pending"},
            "email": email_match.group(0) if email_match else "",
            "biography": {"zh-CN": summary, "en": summary},
            "socialLinks": [
                {
                    "id": f"link-{index}",
                    "label": {"zh-CN": f"外链 {index + 1}", "en": f"Link {index + 1}"},
                    "url": url,
                    "icon": "link",
                }
                for index, url in enumerate(urls[:3])
            ],
        },
        "resume": {
            "summary": {"zh-CN": summary, "en": summary},
            "experience": [],
            "education": [],
            "skillGroups": [],
        },
    }


def import_profile_from_resume(
    source_path: Path,
    provider: LLMProvider,
    dry_run: bool = False,
) -> dict[str, Any]:
    raw_text = extract_resume_text(source_path)
    payload = heuristic_resume_payload(raw_text)
    if provider.is_available():
        try:
            payload = parse_json_text(
                provider.generate_text(raw_text, system_prompt=PROFILE_IMPORT_SYSTEM_PROMPT)
            )
        except Exception:
            payload = heuristic_resume_payload(raw_text)

    current_profile = load_yaml(config_dir() / "profile.yaml").get("profile", {})
    current_resume = load_yaml(config_dir() / "resume.yaml").get("resume", {})

    merged_profile = deep_merge(current_profile, payload.get("profile", {}))
    merged_resume = deep_merge(current_resume, payload.get("resume", {}))

    if not dry_run:
        dump_yaml(config_dir() / "profile.yaml", {"profile": merged_profile})
        dump_yaml(config_dir() / "resume.yaml", {"resume": merged_resume})

    return {
        "profile": merged_profile,
        "resume": merged_resume,
        "applied": not dry_run,
        "source": str(source_path),
    }
