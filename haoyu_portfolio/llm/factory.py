from __future__ import annotations

import os

from .base import LLMProvider
from .gemini import GeminiProvider
from .mock import MockProvider
from .openai_compatible import OpenAICompatibleProvider


def get_provider(provider_name: str | None = None, model: str | None = None) -> LLMProvider:
    selected = (provider_name or os.environ.get("PORTFOLIO_LLM_PROVIDER") or "mock").strip().lower()
    if selected == "gemini":
        provider = GeminiProvider(model=model)
    elif selected in {"openai", "openai-compatible", "openai_compatible"}:
        provider = OpenAICompatibleProvider(model=model)
    else:
        provider = MockProvider(model=model)
    return provider
