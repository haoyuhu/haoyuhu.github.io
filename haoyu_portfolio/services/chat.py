from __future__ import annotations

import json

from ..llm.base import LLMProvider
from ..schemas import PortfolioBundle


def build_chat_context(bundle: PortfolioBundle, target: str) -> str:
    parts: list[str] = []
    if target in {"global", "info"}:
        parts.append("## PROFILE\n" + json.dumps(bundle.profile.model_dump(mode="json"), ensure_ascii=False, indent=2))
    if target in {"global", "cv"}:
        parts.append("## RESUME\n" + json.dumps(bundle.resume.model_dump(mode="json"), ensure_ascii=False, indent=2))
    if target in {"global", "project"}:
        parts.append("## PROJECTS\n" + json.dumps(bundle.projects.model_dump(mode="json"), ensure_ascii=False, indent=2))
    if target in {"global", "article"}:
        articles = [post.model_dump(mode="json") for post in bundle.posts if post.kind == "article"]
        parts.append("## ARTICLES\n" + json.dumps(articles, ensure_ascii=False, indent=2))
    if target in {"global", "garden"}:
        notes = [post.model_dump(mode="json") for post in bundle.posts if post.kind == "note"]
        parts.append("## GARDEN\n" + json.dumps(notes, ensure_ascii=False, indent=2))
    return "\n\n".join(parts)


def answer_portfolio_query(
    bundle: PortfolioBundle,
    provider: LLMProvider,
    query: str,
    target: str = "global",
    verbose: bool = False,
) -> str:
    if not provider.is_available():
        return bundle.assistant.unavailableMessage["en"]

    context = build_chat_context(bundle, target)
    system_prompt = (
        f"{bundle.assistant.persona['en']}\n"
        "Answer strictly from the supplied context. "
        "If the answer is not present, say so clearly. "
        f"Verbose mode: {verbose}."
    )
    prompt = f"Context:\n{context}\n\nQuestion:\n{query}"
    return provider.generate_text(prompt, system_prompt=system_prompt)
