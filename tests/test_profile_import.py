from __future__ import annotations

from haoyu_portfolio.llm.factory import get_provider
from haoyu_portfolio.services.profile_import import import_profile_from_resume


def test_profile_import_uses_heuristic_fallback_for_markdown_resume(temp_repo):
    resume_path = temp_repo / "resume.md"
    resume_path.write_text(
        "# Jane Doe\n\nAI engineer building agent systems.\n\nEmail: jane@example.com\n\nhttps://github.com/janedoe\n",
        encoding="utf-8",
    )
    result = import_profile_from_resume(resume_path, provider=get_provider("mock"), dry_run=False)
    assert result["profile"]["email"] == "jane@example.com"
    profile_yaml = (temp_repo / "content" / "config" / "profile.yaml").read_text(encoding="utf-8")
    assert "jane@example.com" in profile_yaml
