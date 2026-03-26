from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

from .bundle import build_bundle
from .llm.factory import get_provider
from .services.chat import answer_portfolio_query
from .services.checks import run_checks
from .services.content_creation import create_content_entry
from .services.profile_import import import_profile_from_resume


app = FastAPI(title="Haoyu Portfolio Studio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


class ChatRequest(BaseModel):
    query: str
    target: str = "global"
    verbose: bool = False
    provider: str | None = None
    model: str | None = None


async def _persist_upload(upload: UploadFile) -> Path:
    suffix = Path(upload.filename or "upload.bin").suffix
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await upload.read()
        tmp.write(content)
        return Path(tmp.name)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/preview/bundle")
def preview_bundle() -> JSONResponse:
    bundle = build_bundle(write=False)
    return JSONResponse(bundle.model_dump(mode="json", by_alias=True))


@app.post("/api/build")
def build_endpoint(refresh_github: bool = False) -> JSONResponse:
    bundle = build_bundle(write=True, refresh_github=refresh_github)
    return JSONResponse(
        {
            "status": "ok",
            "generatedAt": bundle.generated.generatedAt,
            "postCount": len(bundle.posts),
            "projectCount": len(bundle.projects.items),
        }
    )


@app.post("/api/check")
def check_endpoint(refresh_github: bool = False) -> JSONResponse:
    return JSONResponse(run_checks(refresh_github=refresh_github))


@app.post("/api/profile/import")
async def profile_import_endpoint(
    file: UploadFile = File(...),
    dry_run: bool = Form(False),
    provider: str | None = Form(None),
    model: str | None = Form(None),
) -> JSONResponse:
    tmp_path = await _persist_upload(file)
    result = import_profile_from_resume(tmp_path, provider=get_provider(provider, model), dry_run=dry_run)
    return JSONResponse({"status": "ok", "result": result})


@app.post("/api/content/note")
async def note_endpoint(
    text: str | None = Form(None),
    title: str | None = Form(None),
    tags: str | None = Form(None),
    dry_run: bool = Form(False),
    provider: str | None = Form(None),
    model: str | None = Form(None),
    file: UploadFile | None = File(None),
) -> JSONResponse:
    raw_text = text or ""
    if file is not None:
        raw_text = (await file.read()).decode("utf-8")
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Missing note content.")
    result = create_content_entry(
        "note",
        raw_text,
        provider=get_provider(provider, model),
        title=title,
        tags=[item.strip() for item in (tags or "").split(",") if item.strip()],
        dry_run=dry_run,
    )
    return JSONResponse({"status": "ok", "result": result})


@app.post("/api/content/article")
async def article_endpoint(
    text: str | None = Form(None),
    title: str | None = Form(None),
    tags: str | None = Form(None),
    dry_run: bool = Form(False),
    provider: str | None = Form(None),
    model: str | None = Form(None),
    file: UploadFile | None = File(None),
) -> JSONResponse:
    raw_text = text or ""
    if file is not None:
        raw_text = (await file.read()).decode("utf-8")
    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="Missing article content.")
    result = create_content_entry(
        "article",
        raw_text,
        provider=get_provider(provider, model),
        title=title,
        tags=[item.strip() for item in (tags or "").split(",") if item.strip()],
        dry_run=dry_run,
    )
    return JSONResponse({"status": "ok", "result": result})


@app.post("/chat")
def chat_endpoint(payload: ChatRequest) -> StreamingResponse:
    bundle = build_bundle(write=False)
    provider = get_provider(payload.provider, payload.model)
    answer = answer_portfolio_query(
        bundle=bundle,
        provider=provider,
        query=payload.query,
        target=payload.target,
        verbose=payload.verbose,
    )

    async def stream():
        for start in range(0, len(answer), 48):
            yield answer[start : start + 48]

    return StreamingResponse(stream(), media_type="text/plain")
