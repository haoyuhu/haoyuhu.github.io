from __future__ import annotations

from haoyu_portfolio.llm.factory import get_provider
from haoyu_portfolio.services.content_creation import create_content_entry


def test_create_note_writes_bilingual_markdown(temp_repo):
    result = create_content_entry(
        "note",
        "This is a quick note about config-first portfolios.",
        provider=get_provider("mock"),
        title="Config-first Note",
        tags=["portfolio", "note"],
        dry_run=False,
    )
    target = temp_repo / "content" / "posts" / "garden" / "mock-generated-content"
    assert result["applied"] is True
    assert (target / "meta.yaml").exists()
    assert (target / "body.zh-CN.md").exists()
    assert (target / "body.en.md").exists()
