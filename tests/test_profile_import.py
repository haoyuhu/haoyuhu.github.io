from __future__ import annotations

from typing import Any

from haoyu_portfolio.llm.factory import get_provider
from haoyu_portfolio.llm.base import LLMProvider
from haoyu_portfolio.services.profile_import import import_profile_from_resume


class JsonProvider(LLMProvider):
    def __init__(self, payload: dict[str, Any]) -> None:
        super().__init__(model="test-json")
        self.payload = payload
        self.called = False

    @property
    def name(self) -> str:
        return "json-provider"

    def is_available(self) -> bool:
        return True

    def generate_text(self, prompt: str, system_prompt: str | None = None) -> str:
        raise AssertionError("Structured resume import should not call generate_text.")

    def generate_json(self, prompt: str, system_prompt: str | None = None) -> dict[str, Any]:
        self.called = True
        assert "下面是简历原文，请直接提取结构化 JSON：" in prompt
        assert "如果教育经历未写专业，不要输出 field 字段。" in prompt
        return self.payload


def test_profile_import_parses_markdown_resume_structure(temp_repo):
    resume_path = temp_repo / "resume.md"
    resume_path.write_text(
        "\n".join(
            [
                "# Jane Doe",
                "- 邮箱：jane@example.com",
                "- 所在地：北京",
                "- GitHub：https://github.com/janedoe",
                "",
                "## 工作经历",
                "",
                "### Example Corp",
                "**任职时间**：2022年01月 - 至今",
                "**职位**：算法工程师",
                "**工作地点**：北京",
                "- 负责智能体平台开发。",
                "- 优化推理性能。",
                "",
                "## 专业技能",
                "- 编程语言：Python、Go",
                "- 技术栈：大模型、智能体、推理架构",
                "",
                "## 教育经历",
                "",
                "### Tsinghua University",
                "**就读时间**：2018年09月 - 2021年06月",
                "**学历**：硕士",
            ]
        ),
        encoding="utf-8",
    )
    result = import_profile_from_resume(resume_path, provider=get_provider("mock"), dry_run=False)

    assert result["usedLlm"] is False
    assert result["profile"]["name"] == "Jane Doe"
    assert result["profile"]["location"]["zh-CN"] == "北京"
    assert result["profile"]["email"] == "jane@example.com"
    assert result["resume"]["experience"][0]["company"] == "Example Corp"
    assert result["resume"]["experience"][0]["role"]["zh-CN"] == "算法工程师"
    assert result["resume"]["skillGroups"][0]["items"][0]["name"] == "Python"
    assert "resume.education[0].field" not in result["missingFields"]
    profile_yaml = (temp_repo / "content" / "config" / "profile.yaml").read_text(encoding="utf-8")
    resume_yaml = (temp_repo / "content" / "config" / "resume.yaml").read_text(encoding="utf-8")
    assert "jane@example.com" in profile_yaml
    assert "Example Corp" in resume_yaml
    assert "field:" not in resume_yaml


def test_profile_import_uses_generate_json_for_real_provider(temp_repo):
    resume_path = temp_repo / "resume.md"
    resume_path.write_text(
        "# Jane Doe\n- 邮箱：jane@example.com\n- 所在地：北京\n",
        encoding="utf-8",
    )
    provider = JsonProvider(
        {
            "profile": {
                "name": "Jane LLM",
                "primaryUrl": "https://example.com",
                "title": {"zh-CN": "算法工程师", "en": "Algorithm Engineer"},
                "location": {"zh-CN": "北京", "en": "Beijing"},
                "email": "jane@example.com",
                "biography": {"zh-CN": "专注于智能体工程。", "en": "Focused on agent engineering."},
                "socialLinks": [
                    {
                        "id": "homepage",
                        "label": {"zh-CN": "主页", "en": "Homepage"},
                        "url": "https://example.com",
                        "icon": "globe",
                    }
                ],
            },
            "resume": {
                "summary": {"zh-CN": "算法工程背景。", "en": "Algorithm engineering background."},
                "experience": [
                    {
                        "company": "LLM Corp",
                        "role": {"zh-CN": "算法工程师", "en": "Algorithm Engineer"},
                        "startDate": "2022-01",
                        "endDate": "Present",
                        "location": {"zh-CN": "北京", "en": "Beijing"},
                        "description": {
                            "zh-CN": ["负责智能体平台。"],
                            "en": ["Built agent platforms."],
                        },
                        "projects": [],
                    }
                ],
                "education": [
                    {
                        "school": "Tsinghua University",
                        "degree": {"zh-CN": "硕士", "en": "Master"},
                        "field": {"zh-CN": "计算机科学", "en": "Computer Science"},
                        "startDate": "2018-09",
                        "endDate": "2021-06",
                    }
                ],
                "skillGroups": [
                    {
                        "label": {"zh-CN": "编程语言", "en": "Programming Languages"},
                        "items": [{"name": "Python", "level": "Advanced"}],
                    }
                ],
            },
        }
    )

    result = import_profile_from_resume(resume_path, provider=provider, dry_run=True)

    assert provider.called is True
    assert result["usedLlm"] is True
    assert result["profile"]["name"] == "Jane LLM"
    assert result["resume"]["experience"][0]["company"] == "LLM Corp"
