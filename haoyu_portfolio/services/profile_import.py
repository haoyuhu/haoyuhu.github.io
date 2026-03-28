from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from pypdf import PdfReader

from ..llm.base import LLMProvider
from ..paths import config_dir
from ..utils import deep_merge, dump_yaml, load_yaml, slugify, summarize_text


PROFILE_IMPORT_SYSTEM_PROMPT = """
你是一个简历结构化与双语标准化助手。
请基于简历原文，输出严格 JSON，结构如下：
{
  "profile": {
    "name": "...",
    "primaryUrl": "...",
    "title": {"zh-CN": "...", "en": "..."},
    "location": {"zh-CN": "...", "en": "..."},
    "email": "...",
    "biography": {"zh-CN": "...", "en": "..."},
    "socialLinks": [
      {
        "id": "github",
        "label": {"zh-CN": "GitHub", "en": "GitHub"},
        "url": "...",
        "icon": "github"
      }
    ]
  },
    "resume": {
    "summary": {"zh-CN": "...", "en": "..."},
    "experience": [
      {
        "id": "exp-...",
        "company": "...",
        "role": {"zh-CN": "...", "en": "..."},
        "startDate": "...",
        "endDate": "...",
        "location": {"zh-CN": "...", "en": "..."},
        "description": {"zh-CN": ["..."], "en": ["..."]},
        "projects": [
          {
            "name": "...",
            "description": {"zh-CN": "...", "en": "..."},
            "tech": ["..."]
          }
        ]
      }
    ],
    "education": [
      {
        "id": "edu-...",
        "school": "...",
        "degree": {"zh-CN": "...", "en": "..."},
        "startDate": "...",
        "endDate": "..."
      }
    ],
    "skillGroups": [
      {
        "id": "skill-...",
        "label": {"zh-CN": "...", "en": "..."},
        "items": [{"name": "...", "level": "Advanced"}]
      }
    ]
  }
}

规则：
- 只能依据原文，不要编造未提及的信息。
- 能翻译时补全英文，拿不准时英文可保留原文。
- “工作经历”和“项目经历”都可以写入 resume.experience。
- location / title / summary / biography 必须给出非空值。
- socialLinks 只保留有 URL 的链接。
- 只输出 JSON，不要解释，不要 Markdown 代码块。
""".strip()


HEADING_SECTION_MAP = {
    "工作经历": "experience",
    "项目经历": "projects",
    "专业技能": "skills",
    "技能": "skills",
    "教育经历": "education",
}

SKILL_GROUP_TRANSLATIONS = {
    "编程语言": "Programming Languages",
    "技术栈": "Technical Focus",
    "技能": "Skills",
}

CITY_TRANSLATIONS = {
    "上海": "Shanghai",
    "北京": "Beijing",
    "杭州": "Hangzhou",
    "中国": "China",
    "中国，上海": "Shanghai, China",
    "上海，中国": "Shanghai, China",
}

PRESENT_TOKENS = {"至今", "present", "current", "now"}
PLACEHOLDER_TOKENS = ("待补充", "pending", "未注明", "not specified", "unknown")


def extract_resume_text(source_path: Path) -> str:
    if source_path.suffix.lower() == ".pdf":
        reader = PdfReader(str(source_path))
        return "\n".join((page.extract_text() or "").strip() for page in reader.pages).strip()
    return source_path.read_text(encoding="utf-8")


def _clean_text(value: Any) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    text = re.sub(r"\[(.*?)\]\((https?://[^\s)]+)\)", r"\1 \2", text)
    text = text.replace("\u00a0", " ")
    text = re.sub(r"^\s*[-*+]\s+", "", text)
    text = re.sub(r"^\s*>\s*", "", text)
    text = text.replace("**", "").replace("__", "").replace("`", "")
    text = re.sub(r"^#+\s*", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip(" -\t")


def _normalize_heading(value: str) -> str:
    return _clean_text(value).replace(" ", "")


def _clean_school_name(value: Any) -> str:
    cleaned = _clean_text(value)
    if not cleaned:
        return ""
    chinese_match = re.match(r"^(.+?(?:大学|学院))(?:\s+.+)?$", cleaned)
    if chinese_match:
        return chinese_match.group(1)
    english_match = re.match(r"^(.+?\b(?:University|College|Institute|School)\b)(?:\s+.+)?$", cleaned)
    if english_match:
        return english_match.group(1)
    return cleaned


def _localized_text(zh_value: Any, en_value: Any = "", *, fallback_zh: str, fallback_en: str) -> dict[str, str]:
    zh = _clean_text(zh_value) or fallback_zh
    en = _clean_text(en_value) or fallback_en or zh
    return {"zh-CN": zh, "en": en}


def _localized_text_from_any(value: Any, *, fallback_zh: str, fallback_en: str) -> dict[str, str]:
    if isinstance(value, dict):
        return _localized_text(
            value.get("zh-CN") or value.get("zh") or value.get("cn"),
            value.get("en") or value.get("en-US"),
            fallback_zh=fallback_zh,
            fallback_en=fallback_en,
        )
    return _localized_text(value, "", fallback_zh=fallback_zh, fallback_en=fallback_en)


def _localized_lines_from_any(
    value: Any,
    *,
    fallback_zh: list[str],
    fallback_en: list[str],
) -> dict[str, list[str]]:
    if isinstance(value, dict):
        zh_lines = _string_list(value.get("zh-CN") or value.get("zh"))
        en_lines = _string_list(value.get("en") or value.get("en-US"))
    elif isinstance(value, list):
        zh_lines = _string_list(value)
        en_lines = []
    else:
        text = _clean_text(value)
        zh_lines = [text] if text else []
        en_lines = []

    if not zh_lines:
        zh_lines = fallback_zh
    if not en_lines:
        en_lines = fallback_en or zh_lines
    return {"zh-CN": zh_lines, "en": en_lines}


def _string_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [item for item in (_clean_text(item) for item in value) if item]
    if isinstance(value, str):
        cleaned = _clean_text(value)
        return [cleaned] if cleaned else []
    return []


def _split_label_value(text: str) -> tuple[str, str] | None:
    match = re.match(r"^(.*?)\s*[：:]\s*(.+)$", text)
    if not match:
        return None
    return _clean_text(match.group(1)), _clean_text(match.group(2))


def _normalize_date_token(value: str) -> str:
    cleaned = _clean_text(value)
    lowered = cleaned.lower()
    if lowered in PRESENT_TOKENS or any(token in lowered for token in PRESENT_TOKENS):
        return "Present"
    year_month = re.search(r"(\d{4})\s*年\s*(\d{1,2})\s*月", cleaned)
    if year_month:
        return f"{year_month.group(1)}-{int(year_month.group(2)):02d}"
    year_only = re.search(r"(\d{4})\s*年", cleaned)
    if year_only:
        return year_only.group(1)
    iso_year_month = re.search(r"(\d{4})[-/.](\d{1,2})", cleaned)
    if iso_year_month:
        return f"{iso_year_month.group(1)}-{int(iso_year_month.group(2)):02d}"
    iso_year = re.search(r"\b(\d{4})\b", cleaned)
    if iso_year:
        return iso_year.group(1)
    return cleaned or "Unknown"


def _parse_date_range(value: str) -> tuple[str, str]:
    cleaned = _clean_text(value)
    if not cleaned:
        return "Unknown", "Unknown"
    parts = re.split(r"\s*[-–—]\s*", cleaned, maxsplit=1)
    if len(parts) == 2:
        return _normalize_date_token(parts[0]), _normalize_date_token(parts[1])
    if any(token in cleaned.lower() for token in PRESENT_TOKENS):
        return _normalize_date_token(cleaned), "Present"
    token = _normalize_date_token(cleaned)
    return token, token


def _to_english_location(value: str) -> str:
    cleaned = _clean_text(value)
    if not cleaned:
        return "Location not specified"
    if cleaned in CITY_TRANSLATIONS:
        return CITY_TRANSLATIONS[cleaned]
    parts = [part.strip() for part in re.split(r"[，,]", cleaned) if part.strip()]
    translated = [CITY_TRANSLATIONS.get(part, part) for part in parts]
    return ", ".join(translated)


def _sectioned_markdown(raw_text: str) -> dict[str, Any]:
    name = ""
    profile_lines: list[str] = []
    sections: dict[str, list[dict[str, Any]]] = {}
    current_section = "__profile__"
    current_entry: dict[str, Any] | None = None

    for raw_line in raw_text.splitlines():
        stripped = raw_line.strip()
        if not stripped:
            continue
        if stripped.startswith("# "):
            if not name:
                name = _clean_text(stripped[2:])
            current_section = "__profile__"
            current_entry = None
            continue
        if stripped.startswith("## "):
            current_section = HEADING_SECTION_MAP.get(_normalize_heading(stripped[3:]), _normalize_heading(stripped[3:]))
            sections.setdefault(current_section, [])
            current_entry = None
            continue
        if stripped.startswith("### "):
            current_entry = {"heading": _clean_text(stripped[4:]), "lines": []}
            sections.setdefault(current_section, []).append(current_entry)
            continue

        if current_section == "__profile__":
            profile_lines.append(raw_line)
            continue

        if current_entry is None:
            current_entry = {"heading": "", "lines": []}
            sections.setdefault(current_section, []).append(current_entry)
        current_entry["lines"].append(raw_line)

    return {"name": name, "profileLines": profile_lines, "sections": sections}


def _parse_line_items(lines: list[str]) -> list[str]:
    items: list[str] = []
    for raw_line in lines:
        stripped = raw_line.strip()
        if not stripped:
            continue
        bullet_match = re.match(r"^[-*+]\s+(.*)$", stripped)
        text = _clean_text(bullet_match.group(1) if bullet_match else stripped)
        if not text:
            continue
        if bullet_match:
            items.append(text)
        elif items:
            items[-1] = f"{items[-1]} {text}".strip()
        else:
            items.append(text)
    return items


def _contact_profile(name: str, profile_lines: list[str]) -> tuple[dict[str, Any], dict[str, str]]:
    email_match = re.search(r"[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}", "\n".join(profile_lines))
    location = ""
    primary_url = ""
    social_links: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    extras: dict[str, str] = {}

    def add_link(link_id: str, label_zh: str, label_en: str, url: str, icon: str) -> None:
        cleaned_url = _clean_text(url)
        if not cleaned_url or cleaned_url in seen_urls:
            return
        seen_urls.add(cleaned_url)
        social_links.append(
            {
                "id": link_id,
                "label": {"zh-CN": label_zh, "en": label_en},
                "url": cleaned_url,
                "icon": icon,
            }
        )

    for line in profile_lines:
        cleaned = _clean_text(line)
        if not cleaned:
            continue
        label_value = _split_label_value(cleaned)
        if not label_value:
            for url in re.findall(r"https?://[^\s)]+", cleaned):
                add_link(f"link-{len(social_links) + 1}", f"外链 {len(social_links) + 1}", f"Link {len(social_links) + 1}", url, "link")
            continue

        label, value = label_value
        label_key = label.lower()
        if label in {"邮箱", "Email"} or label_key == "email":
            continue
        if label in {"所在地", "地点", "工作地点"} or label_key == "location":
            location = value
            continue
        if label in {"GitHub", "Github"} or label_key == "github":
            add_link("github", "GitHub", "GitHub", value, "github")
            if not primary_url:
                primary_url = value
            continue
        if label_key in {"homepage", "website", "blog"} or label in {"Homepage", "个人主页"}:
            add_link("homepage", "主页", "Homepage", value, "globe")
            primary_url = value
            continue
        if label in {"联系电话", "电话", "手机号"} or label_key in {"phone", "mobile"}:
            extras["phone"] = value
            continue
        if label in {"微信"} or label_key == "wechat":
            extras["wechat"] = value
            continue
        if label in {"性别"} or label_key == "gender":
            extras["gender"] = value
            continue
        if value.startswith("http://") or value.startswith("https://"):
            add_link(f"link-{len(social_links) + 1}", label or f"外链 {len(social_links) + 1}", label or f"Link {len(social_links) + 1}", value, "link")

    return (
        {
            "name": name or "待补充姓名",
            "primaryUrl": primary_url or (social_links[0]["url"] if social_links else ""),
            "email": email_match.group(0) if email_match else "",
            "location": _localized_text(location, _to_english_location(location), fallback_zh="待补充地点", fallback_en="Location pending"),
            "socialLinks": social_links,
        },
        extras,
    )


def _entry_metadata(lines: list[str]) -> tuple[dict[str, str], list[str]]:
    metadata: dict[str, str] = {}
    body_lines: list[str] = []
    label_map = {
        "任职时间": "date",
        "工作时间": "date",
        "项目时间": "date",
        "就读时间": "date",
        "职位": "role",
        "角色": "role",
        "职务": "role",
        "工作地点": "location",
        "所在地": "location",
        "就读地点": "location",
        "学历": "degree",
        "学位": "degree",
        "专业": "field",
        "方向": "field",
    }
    for line in lines:
        cleaned = _clean_text(line)
        label_value = _split_label_value(cleaned)
        if not label_value:
            body_lines.append(line)
            continue
        label, value = label_value
        mapped = label_map.get(label)
        if mapped:
            metadata[mapped] = value
        else:
            body_lines.append(line)
    return metadata, body_lines


def _parse_experience_entries(entries: list[dict[str, Any]], section_key: str, default_location: str) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    default_location_localized = _localized_text(
        default_location,
        _to_english_location(default_location),
        fallback_zh="未注明地点",
        fallback_en="Location not specified",
    )
    default_role = "项目经历" if section_key == "projects" else "职位待补充"

    for index, entry in enumerate(entries, start=1):
        metadata, body_lines = _entry_metadata(entry.get("lines", []))
        description_lines = _parse_line_items(body_lines)
        start_date, end_date = _parse_date_range(metadata.get("date", ""))
        company = entry.get("heading") or f"Experience {index}"
        role = metadata.get("role") or default_role
        location = metadata.get("location", default_location)
        results.append(
            {
                "id": f"exp-{slugify(company)}-{index}",
                "company": company,
                "role": _localized_text(role, role, fallback_zh="职位待补充", fallback_en="Role pending"),
                "startDate": start_date,
                "endDate": end_date,
                "location": _localized_text(
                    location,
                    _to_english_location(location),
                    fallback_zh="未注明地点",
                    fallback_en="Location not specified",
                )
                if location
                else default_location_localized,
                "description": _localized_lines_from_any(
                    description_lines,
                    fallback_zh=["经历细节待补充"],
                    fallback_en=["Details pending"],
                ),
                "projects": [],
            }
        )
    return results


def _parse_education_entries(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    results: list[dict[str, Any]] = []
    for index, entry in enumerate(entries, start=1):
        metadata, _ = _entry_metadata(entry.get("lines", []))
        start_date, end_date = _parse_date_range(metadata.get("date", ""))
        school = _clean_school_name(entry.get("heading")) or f"Education {index}"
        degree = metadata.get("degree") or "学历待补充"
        education_entry = {
            "id": f"edu-{slugify(school)}-{index}",
            "school": school,
            "degree": _localized_text(degree, degree, fallback_zh="学历待补充", fallback_en="Degree pending"),
            "startDate": start_date,
            "endDate": end_date,
        }
        field = _clean_text(metadata.get("field"))
        if field and not _is_placeholder_text(field):
            education_entry["field"] = _localized_text(
                field,
                "Field not specified" if _is_placeholder_text(field) else field,
                fallback_zh=field,
                fallback_en=field,
            )
        results.append(education_entry)
    return results


def _parse_skill_groups(entries: list[dict[str, Any]]) -> list[dict[str, Any]]:
    skill_lines: list[str] = []
    for entry in entries:
        skill_lines.extend(entry.get("lines", []))

    results: list[dict[str, Any]] = []
    for line in _parse_line_items(skill_lines):
        label_value = _split_label_value(line)
        if not label_value:
            continue
        label, value = label_value
        items = [item.strip() for item in re.split(r"[、，,；;]", value) if item.strip()]
        if not items:
            continue
        results.append(
            {
                "id": f"skill-{slugify(label)}",
                "label": _localized_text(
                    label,
                    SKILL_GROUP_TRANSLATIONS.get(label, label),
                    fallback_zh="技能",
                    fallback_en="Skills",
                ),
                "items": [{"name": item, "level": "Advanced"} for item in items],
            }
        )
    return results


def _build_summary(profile: dict[str, Any], resume: dict[str, Any]) -> tuple[dict[str, str], dict[str, str], dict[str, str]]:
    latest_role = ""
    if resume["experience"]:
        latest_role = resume["experience"][0]["role"]["zh-CN"]
    primary_skills = []
    for group in resume["skillGroups"]:
        for item in group["items"]:
            primary_skills.append(item["name"])
            if len(primary_skills) >= 4:
                break
        if len(primary_skills) >= 4:
            break
    focus = "、".join(primary_skills) if primary_skills else "复杂工程系统"
    zh_summary = summarize_text(
        f"{latest_role or '工程技术从业者'}，聚焦{focus}，具备从算法到工程架构的端到端落地经验。",
        limit=120,
    )
    en_summary = zh_summary
    biography = {
        "zh-CN": summarize_text(
            f"{profile['name']}目前专注于{focus}相关工作，持续推进算法、平台与工程化能力建设。",
            limit=140,
        ),
        "en": summarize_text(
            f"{profile['name']} is focused on {focus}, spanning algorithm work, platforms, and engineering delivery.",
            limit=140,
        ),
    }
    title = _localized_text(
        latest_role or "技术负责人",
        latest_role or "Engineering Lead",
        fallback_zh="待校对的职位标题",
        fallback_en="Title to be reviewed",
    )
    return {"zh-CN": zh_summary, "en": en_summary}, biography, title


def heuristic_resume_payload(raw_text: str) -> dict[str, Any]:
    structured = _sectioned_markdown(raw_text)
    sections = structured["sections"]
    profile, _extras = _contact_profile(structured["name"], structured["profileLines"])
    experience = _parse_experience_entries(sections.get("experience", []), "experience", profile["location"]["zh-CN"])
    project_experience = _parse_experience_entries(sections.get("projects", []), "projects", profile["location"]["zh-CN"])
    education = _parse_education_entries(sections.get("education", []))
    skill_groups = _parse_skill_groups(sections.get("skills", []))

    summary, biography, title = _build_summary(
        profile,
        {
            "experience": experience + project_experience,
            "skillGroups": skill_groups,
        },
    )

    lines = [_clean_text(line) for line in raw_text.splitlines() if _clean_text(line)]
    fallback_summary = summarize_text(" ".join(lines[:8]), limit=240)

    profile_payload = {
        "name": profile["name"] or (lines[0] if lines else "Haoyu Hu"),
        "primaryUrl": profile["primaryUrl"],
        "title": title,
        "location": profile["location"],
        "email": profile["email"],
        "biography": biography if biography["zh-CN"] else {"zh-CN": fallback_summary, "en": fallback_summary},
        "socialLinks": profile["socialLinks"],
    }

    resume_payload = {
        "summary": summary if summary["zh-CN"] else {"zh-CN": fallback_summary, "en": fallback_summary},
        "experience": experience + project_experience,
        "education": education,
        "skillGroups": skill_groups,
    }

    if not resume_payload["experience"] and not resume_payload["education"] and not resume_payload["skillGroups"]:
        urls = re.findall(r"https?://[^\s)]+", raw_text)
        profile_payload = {
            "name": profile_payload["name"],
            "primaryUrl": profile_payload["primaryUrl"] or (urls[0] if urls else ""),
            "title": {"zh-CN": "待校对的职位标题", "en": "Title to be reviewed"},
            "location": profile_payload["location"],
            "email": profile_payload["email"],
            "biography": {"zh-CN": fallback_summary, "en": fallback_summary},
            "socialLinks": [
                {
                    "id": f"link-{index}",
                    "label": {"zh-CN": f"外链 {index + 1}", "en": f"Link {index + 1}"},
                    "url": url,
                    "icon": "link",
                }
                for index, url in enumerate(urls[:3])
            ],
        }
        resume_payload = {
            "summary": {"zh-CN": fallback_summary, "en": fallback_summary},
            "experience": [],
            "education": [],
            "skillGroups": [],
        }

    return {"profile": profile_payload, "resume": resume_payload}


def _normalize_social_links(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    normalized: list[dict[str, Any]] = []
    seen_urls: set[str] = set()
    for index, item in enumerate(value, start=1):
        if not isinstance(item, dict):
            continue
        url = _clean_text(item.get("url"))
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        link_id = _clean_text(item.get("id")) or f"link-{index}"
        if link_id == "homepage":
            fallback_zh = "主页"
            fallback_en = "Homepage"
            icon = "globe"
        elif link_id == "github":
            fallback_zh = "GitHub"
            fallback_en = "GitHub"
            icon = "github"
        else:
            fallback_zh = f"外链 {index}"
            fallback_en = f"Link {index}"
            icon = _clean_text(item.get("icon")) or "link"
        normalized.append(
            {
                "id": link_id,
                "label": _localized_text_from_any(
                    item.get("label"),
                    fallback_zh=fallback_zh,
                    fallback_en=fallback_en,
                ),
                "url": url,
                "icon": _clean_text(item.get("icon")) or icon,
            }
        )
    return normalized


def _normalize_projects(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    normalized: list[dict[str, Any]] = []
    for index, item in enumerate(value, start=1):
        if not isinstance(item, dict):
            continue
        name = _clean_text(item.get("name")) or f"Project {index}"
        normalized.append(
            {
                "name": name,
                "description": _localized_text_from_any(
                    item.get("description"),
                    fallback_zh="项目描述待补充",
                    fallback_en="Project description pending",
                ),
                "tech": _string_list(item.get("tech")),
            }
        )
    return normalized


def _normalize_experience_entries(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    normalized: list[dict[str, Any]] = []
    for index, item in enumerate(value, start=1):
        if not isinstance(item, dict):
            continue
        company = _clean_text(item.get("company")) or f"Experience {index}"
        normalized.append(
            {
                "id": _clean_text(item.get("id")) or f"exp-{slugify(company)}-{index}",
                "company": company,
                "role": _localized_text_from_any(
                    item.get("role"),
                    fallback_zh="职位待补充",
                    fallback_en="Role pending",
                ),
                "startDate": _clean_text(item.get("startDate")) or "Unknown",
                "endDate": _clean_text(item.get("endDate")) or "Unknown",
                "location": _localized_text_from_any(
                    item.get("location"),
                    fallback_zh="未注明地点",
                    fallback_en="Location not specified",
                ),
                "description": _localized_lines_from_any(
                    item.get("description"),
                    fallback_zh=["经历细节待补充"],
                    fallback_en=["Details pending"],
                ),
                "projects": _normalize_projects(item.get("projects")),
            }
        )
    return normalized


def _normalize_education_entries(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    normalized: list[dict[str, Any]] = []
    for index, item in enumerate(value, start=1):
        if not isinstance(item, dict):
            continue
        school = _clean_school_name(item.get("school")) or f"Education {index}"
        normalized_entry = {
            "id": _clean_text(item.get("id")) or f"edu-{slugify(school)}-{index}",
            "school": school,
            "degree": _localized_text_from_any(
                item.get("degree"),
                fallback_zh="学历待补充",
                fallback_en="Degree pending",
            ),
            "startDate": _clean_text(item.get("startDate")) or "Unknown",
            "endDate": _clean_text(item.get("endDate")) or "Unknown",
        }
        field = item.get("field")
        if field:
            field_value = _localized_text_from_any(
                field,
                fallback_zh="未注明专业",
                fallback_en="Field not specified",
            )
            if not _is_placeholder_text(field_value["zh-CN"]):
                normalized_entry["field"] = field_value
        normalized.append(normalized_entry)
    return normalized


def _normalize_skill_groups(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    normalized: list[dict[str, Any]] = []
    for index, item in enumerate(value, start=1):
        if not isinstance(item, dict):
            continue
        label = _localized_text_from_any(
            item.get("label"),
            fallback_zh="技能",
            fallback_en="Skills",
        )
        items = item.get("items")
        normalized_items: list[dict[str, str]] = []
        if isinstance(items, list):
            for skill_index, skill in enumerate(items, start=1):
                if not isinstance(skill, dict):
                    continue
                name = _clean_text(skill.get("name")) or f"Skill {skill_index}"
                level = _clean_text(skill.get("level")) or "Advanced"
                normalized_items.append({"name": name, "level": level})
        if not normalized_items:
            continue
        normalized.append(
            {
                "id": _clean_text(item.get("id")) or f"skill-{slugify(label['zh-CN'])}-{index}",
                "label": label,
                "items": normalized_items,
            }
        )
    return normalized


def _normalize_import_payload(payload: dict[str, Any]) -> dict[str, Any]:
    profile = payload.get("profile", {}) if isinstance(payload, dict) else {}
    resume = payload.get("resume", {}) if isinstance(payload, dict) else {}
    normalized_profile = {
        "name": _clean_text(profile.get("name")) or "待补充姓名",
        "primaryUrl": _clean_text(profile.get("primaryUrl")),
        "title": _localized_text_from_any(
            profile.get("title"),
            fallback_zh="待校对的职位标题",
            fallback_en="Title to be reviewed",
        ),
        "location": _localized_text_from_any(
            profile.get("location"),
            fallback_zh="待补充地点",
            fallback_en="Location pending",
        ),
        "email": _clean_text(profile.get("email")),
        "biography": _localized_text_from_any(
            profile.get("biography"),
            fallback_zh="待补充个人简介",
            fallback_en="Biography pending",
        ),
        "socialLinks": _normalize_social_links(profile.get("socialLinks")),
    }
    if not normalized_profile["primaryUrl"] and normalized_profile["socialLinks"]:
        normalized_profile["primaryUrl"] = normalized_profile["socialLinks"][0]["url"]
    return {
        "profile": normalized_profile,
        "resume": {
            "summary": _localized_text_from_any(
                resume.get("summary"),
                fallback_zh="待补充简历摘要",
                fallback_en="Resume summary pending",
            ),
            "experience": _normalize_experience_entries(resume.get("experience")),
            "education": _normalize_education_entries(resume.get("education")),
            "skillGroups": _normalize_skill_groups(resume.get("skillGroups")),
        },
    }


def _structured_llm_available(provider: LLMProvider) -> bool:
    return provider.name != "mock" and provider.is_available()


def _extract_with_llm(raw_text: str, provider: LLMProvider, draft_payload: dict[str, Any]) -> dict[str, Any]:
    prompt = "\n\n".join(
        [
            "下面是简历原文，请直接提取结构化 JSON：",
            raw_text,
            "注意：如果教育经历未写专业，不要输出 field 字段。",
        ]
    )
    return provider.generate_json(prompt, system_prompt=PROFILE_IMPORT_SYSTEM_PROMPT)


def _missing_fields(payload: dict[str, Any]) -> list[str]:
    missing: list[str] = []
    profile = payload.get("profile", {})
    resume = payload.get("resume", {})

    def mark_if_placeholder(path: str, value: str) -> None:
        lowered = _clean_text(value).lower()
        if not lowered or any(token in lowered for token in PLACEHOLDER_TOKENS):
            missing.append(path)

    mark_if_placeholder("profile.name", profile.get("name", ""))
    mark_if_placeholder("profile.title", profile.get("title", {}).get("zh-CN", ""))
    mark_if_placeholder("profile.location", profile.get("location", {}).get("zh-CN", ""))
    mark_if_placeholder("profile.biography", profile.get("biography", {}).get("zh-CN", ""))
    mark_if_placeholder("resume.summary", resume.get("summary", {}).get("zh-CN", ""))

    if not resume.get("experience"):
        missing.append("resume.experience")
    if not resume.get("education"):
        missing.append("resume.education")
    if not resume.get("skillGroups"):
        missing.append("resume.skillGroups")

    return missing


def _is_placeholder_text(value: str) -> bool:
    lowered = _clean_text(value).lower()
    return not lowered or any(token in lowered for token in PLACEHOLDER_TOKENS)


def _prune_resume_payload(resume: dict[str, Any]) -> dict[str, Any]:
    pruned = deep_merge({}, resume)
    education_entries = []
    for education in pruned.get("education", []):
        if not isinstance(education, dict):
            continue
        cleaned = {**education}
        cleaned.pop("field", None)
        education_entries.append(cleaned)
    pruned["education"] = education_entries
    return pruned


def _derive_career_start_year(resume: dict[str, Any]) -> int | None:
    years: list[int] = []
    for experience in resume.get("experience", []):
        match = re.match(r"(\d{4})", _clean_text(experience.get("startDate")))
        if match:
            years.append(int(match.group(1)))
    return min(years) if years else None


def _derive_system_identity(profile: dict[str, Any], resume: dict[str, Any]) -> list[dict[str, Any]]:
    social_links = profile.get("socialLinks", [])
    github_url = ""
    for link in social_links:
        url = _clean_text(link.get("url"))
        if "github.com/" in url:
            github_url = url
            break
    host_url = github_url or _clean_text(profile.get("primaryUrl"))
    host_value = host_url.removeprefix("https://").removeprefix("http://").rstrip("/")

    education = resume.get("education", [])
    latest_education = education[0] if education else {}
    degree_zh = _clean_text(latest_education.get("degree", {}).get("zh-CN"))
    degree_en = _clean_text(latest_education.get("degree", {}).get("en"))
    field_payload = latest_education.get("field") or {}
    field_zh = _clean_text(field_payload.get("zh-CN")) if isinstance(field_payload, dict) else ""
    field_en = _clean_text(field_payload.get("en")) if isinstance(field_payload, dict) else ""
    school = _clean_text(latest_education.get("school"))
    if school:
        edu_zh = f"{school}（{degree_zh}）" if degree_zh else school
        edu_en = f"{school} ({degree_en})" if degree_en else school
        if degree_zh and field_zh and not _is_placeholder_text(field_zh):
            edu_zh = f"{school}（{degree_zh}，{field_zh}）"
        if degree_en and field_en and not _is_placeholder_text(field_en):
            edu_en = f"{school} ({degree_en} in {field_en})"
    else:
        edu_zh = "教育经历待补充"
        edu_en = "Education pending"

    focus_items: list[str] = []
    for group in resume.get("skillGroups", []):
        for item in group.get("items", []):
            name = _clean_text(item.get("name"))
            if name and name not in focus_items:
                focus_items.append(name)
            if len(focus_items) >= 4:
                break
        if len(focus_items) >= 4:
            break
    focus_zh = " / ".join(focus_items) if focus_items else _clean_text(profile.get("title", {}).get("zh-CN"))
    focus_en = " / ".join(focus_items) if focus_items else _clean_text(profile.get("title", {}).get("en"))

    return [
        {
            "label": {"zh-CN": "Host", "en": "Host"},
            "value": {"zh-CN": host_value or "待补充", "en": host_value or "Pending"},
            "detail": {
                "zh-CN": "主要公开资料入口与作品链接。",
                "en": "Primary public entry point for repositories and work.",
            },
        },
        {
            "label": {"zh-CN": "Base", "en": "Base"},
            "value": profile.get("location", {"zh-CN": "待补充地点", "en": "Location pending"}),
            "detail": {
                "zh-CN": "当前常驻城市。",
                "en": "Current base location.",
            },
        },
        {
            "label": {"zh-CN": "Edu", "en": "Edu"},
            "value": {"zh-CN": edu_zh, "en": edu_en},
            "detail": {
                "zh-CN": "来自导入简历的最近教育节点。",
                "en": "Latest education node derived from the imported resume.",
            },
        },
        {
            "label": {"zh-CN": "Focus", "en": "Focus"},
            "value": {"zh-CN": focus_zh or "待补充方向", "en": focus_en or "Focus pending"},
            "detail": {
                "zh-CN": "根据简历中的岗位与技能归纳的当前关注方向。",
                "en": "Current focus derived from imported roles and skills.",
            },
            "useTechStackAsTags": True,
        },
    ]


def import_profile_from_resume(
    source_path: Path,
    provider: LLMProvider,
    dry_run: bool = False,
) -> dict[str, Any]:
    raw_text = extract_resume_text(source_path)
    fallback_payload = _normalize_import_payload(heuristic_resume_payload(raw_text))
    payload = fallback_payload
    used_llm = False
    if _structured_llm_available(provider):
        for _ in range(2):
            try:
                llm_payload = _normalize_import_payload(_extract_with_llm(raw_text, provider, fallback_payload))
                payload = deep_merge(fallback_payload, llm_payload)
                used_llm = True
                break
            except Exception:
                payload = fallback_payload

    payload["resume"] = _prune_resume_payload(payload["resume"])

    derived_profile_updates: dict[str, Any] = {"systemIdentity": _derive_system_identity(payload["profile"], payload["resume"])}
    career_start_year = _derive_career_start_year(payload["resume"])
    if career_start_year is not None:
        derived_profile_updates["careerStartYear"] = career_start_year
    payload["profile"] = deep_merge(payload["profile"], derived_profile_updates)

    current_profile = load_yaml(config_dir() / "profile.yaml").get("profile", {})
    current_resume = load_yaml(config_dir() / "resume.yaml").get("resume", {})

    merged_profile = deep_merge(current_profile, payload.get("profile", {}))
    merged_resume = deep_merge(current_resume, payload.get("resume", {}))
    merged_resume = _prune_resume_payload(merged_resume)

    if not dry_run:
        dump_yaml(config_dir() / "profile.yaml", {"profile": merged_profile})
        dump_yaml(config_dir() / "resume.yaml", {"resume": merged_resume})

    return {
        "profile": merged_profile,
        "resume": merged_resume,
        "applied": not dry_run,
        "source": str(source_path),
        "provider": provider.name,
        "usedLlm": used_llm,
        "missingFields": _missing_fields(payload),
    }
