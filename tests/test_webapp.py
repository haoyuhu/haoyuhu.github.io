from __future__ import annotations

from fastapi.testclient import TestClient

from haoyu_portfolio.webapp import app


def test_build_preview_and_chat_endpoints(temp_repo):
    client = TestClient(app)

    preview = client.get("/api/preview/bundle")
    assert preview.status_code == 200
    assert preview.json()["profile"]["name"] == "胡皓宇"

    build = client.post("/api/build")
    assert build.status_code == 200

    chat = client.post("/chat", json={"query": "Who are you?", "target": "global"})
    assert chat.status_code == 200
    assert "[mock:" in chat.text


def test_content_and_profile_upload_endpoints(temp_repo):
    client = TestClient(app)

    note = client.post("/api/content/note", data={"text": "A local note for the studio."})
    assert note.status_code == 200
    assert note.json()["status"] == "ok"

    resume = client.post(
        "/api/profile/import",
        files={"file": ("resume.md", b"# Resume\nEmail: local@example.com", "text/markdown")},
        data={"dry_run": "false"},
    )
    assert resume.status_code == 200
    assert resume.json()["status"] == "ok"
