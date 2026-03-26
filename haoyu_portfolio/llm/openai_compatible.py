from __future__ import annotations

import os
from typing import Any

import requests

from .base import LLMProvider
from ..utils import parse_json_text


class OpenAICompatibleProvider(LLMProvider):
    def __init__(self, model: str | None = None) -> None:
        super().__init__(model=model or os.environ.get("PORTFOLIO_OPENAI_MODEL") or "gpt-4o-mini")
        self.api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("PORTFOLIO_OPENAI_API_KEY")
        self.base_url = os.environ.get("OPENAI_BASE_URL") or os.environ.get("PORTFOLIO_OPENAI_BASE_URL")

    @property
    def name(self) -> str:
        return "openai-compatible"

    def is_available(self) -> bool:
        return bool(self.api_key and self.base_url)

    def _chat_completion(self, prompt: str, system_prompt: str | None = None, json_mode: bool = False) -> str:
        if not self.is_available():
            raise RuntimeError("OpenAI-compatible provider is not configured.")
        messages: list[dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": messages,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}
        response = requests.post(
            f"{self.base_url.rstrip('/')}/chat/completions",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        content = response.json()["choices"][0]["message"]["content"]
        return content or ""

    def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        return self._chat_completion(prompt, system_prompt=system_prompt, json_mode=False)

    def generate_json(self, prompt: str, system_prompt: str | None = None) -> dict[str, Any]:
        return parse_json_text(self._chat_completion(prompt, system_prompt=system_prompt, json_mode=True))
