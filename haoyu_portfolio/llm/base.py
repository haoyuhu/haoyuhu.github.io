from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any


class LLMProvider(ABC):
    def __init__(self, model: str | None = None) -> None:
        self.model = model

    @property
    @abstractmethod
    def name(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def is_available(self) -> bool:
        raise NotImplementedError

    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        raise NotImplementedError

    @abstractmethod
    def generate_json(self, prompt: str, system_prompt: str | None = None) -> dict[str, Any]:
        raise NotImplementedError
