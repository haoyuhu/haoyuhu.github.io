from __future__ import annotations

from typing import Any

from .base import LLMProvider
from ..utils import summarize_text


class MockProvider(LLMProvider):
    @property
    def name(self) -> str:
        return "mock"

    def is_available(self) -> bool:
        return True

    def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        summary = summarize_text(prompt, limit=220)
        return f"[mock:{self.model or 'default'}] {summary}"

    def generate_json(self, prompt: str, system_prompt: str | None = None) -> dict[str, Any]:
        summary = summarize_text(prompt, limit=120)
        return {
            "title": {
                "zh-CN": "模拟生成内容",
                "en": "Mock Generated Content",
            },
            "summary": {
                "zh-CN": f"模拟摘要：{summary}",
                "en": f"Mock summary: {summary}",
            },
            "body": {
                "zh-CN": prompt,
                "en": prompt,
            },
            "tags": ["mock", "local"],
            "slug": "mock-generated-content",
            "date": "2026-03-26",
        }
