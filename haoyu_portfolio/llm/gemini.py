from __future__ import annotations

import os
from typing import Any

from google.genai import Client

from .base import LLMProvider
from ..utils import parse_json_text


class GeminiProvider(LLMProvider):
    def __init__(self, model: str | None = None) -> None:
        super().__init__(model=model or os.environ.get("PORTFOLIO_GEMINI_MODEL") or "gemini-2.5-flash")
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self._client = Client(api_key=self.api_key) if self.api_key else None

    @property
    def name(self) -> str:
        return "gemini"

    def is_available(self) -> bool:
        return self._client is not None

    def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        if not self._client:
            raise RuntimeError("GEMINI_API_KEY is not configured.")
        response = self._client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={"system_instruction": system_prompt} if system_prompt else None,
        )
        return response.text or ""

    def generate_json(self, prompt: str, system_prompt: str | None = None) -> dict[str, Any]:
        if not self._client:
            raise RuntimeError("GEMINI_API_KEY is not configured.")
        response = self._client.models.generate_content(
            model=self.model,
            contents=prompt,
            config={
                "system_instruction": system_prompt,
                "response_mime_type": "application/json",
            },
        )
        return parse_json_text(response.text or "{}")
