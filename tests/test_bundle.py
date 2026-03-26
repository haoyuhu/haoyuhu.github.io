from __future__ import annotations

import json

from haoyu_portfolio.bundle import build_bundle


def test_build_bundle_writes_public_json(temp_repo):
    bundle = build_bundle(write=True)
    assert bundle.profile.name == "Haoyu Hu"
    payload = json.loads((temp_repo / "public" / "data.json").read_text(encoding="utf-8"))
    assert payload["site"]["localeDefault"] == "zh-CN"
    assert len(payload["posts"]) >= 2
