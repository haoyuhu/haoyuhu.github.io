from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Annotated

import typer

from .bundle import build_bundle
from .llm.factory import get_provider
from .paths import config_dir, repo_root
from .services.github_sync import refresh_github_caches
from .services.checks import run_checks
from .services.content_creation import create_content_entry, voice_capture_available
from .services.profile_import import import_profile_from_resume
from .utils import load_yaml

try:
    from InquirerPy import inquirer
except Exception:  # pragma: no cover - soft dependency in tests/runtime
    inquirer = None


app = typer.Typer(help="Haoyu Portfolio 本地内容与发布工具。")
profile_app = typer.Typer(help="个人资料与简历导入。")
content_app = typer.Typer(help="短文与长文内容创建。")
sync_app = typer.Typer(help="外部平台数据同步。")
app.add_typer(profile_app, name="profile")
app.add_typer(content_app, name="content")
app.add_typer(sync_app, name="sync")


def _prompt_text(message: str, default: str = "") -> str:
    if inquirer:
        return inquirer.text(message=message, default=default).execute()
    return typer.prompt(message, default=default)


def _prompt_confirm(message: str, default: bool = True) -> bool:
    if inquirer:
        return bool(inquirer.confirm(message=message, default=default).execute())
    return typer.confirm(message, default=default)


def _github_settings() -> dict:
    payload = load_yaml(config_dir() / "projects.yaml")
    return payload.get("projects", {}).get("github", {})


@profile_app.command("import")
def profile_import(
    source: Annotated[Path | None, typer.Option("--source", help="本地 PDF 或 Markdown 简历路径。")] = None,
    provider: Annotated[str | None, typer.Option("--provider", help="mock / gemini / openai-compatible")] = None,
    model: Annotated[str | None, typer.Option("--model", help="覆盖默认模型名称。")] = None,
    interactive: Annotated[bool, typer.Option("--interactive", help="进入交互模式。")] = False,
    dry_run: Annotated[bool, typer.Option("--dry-run", help="只预览不写入。")] = False,
) -> None:
    if interactive or source is None:
        source = Path(_prompt_text("请输入简历文件路径"))
    result = import_profile_from_resume(source, provider=get_provider(provider, model), dry_run=dry_run)
    typer.echo(f"Profile import completed: {result['source']}")
    typer.echo(f"Applied: {result['applied']}")


def _read_content_input(text: str | None, source: Path | None, interactive: bool, voice: bool) -> str:
    if voice and not voice_capture_available():
        typer.echo("Voice extras are not installed. Falling back to text input.")
    if text:
        return text
    if source:
        return source.read_text(encoding="utf-8")
    if interactive:
        return _prompt_text("请输入正文内容")
    raise typer.BadParameter("Missing content input. Use --text, --source, or --interactive.")


@content_app.command("note")
def create_note(
    text: Annotated[str | None, typer.Option("--text", help="直接传入短文内容。")] = None,
    source: Annotated[Path | None, typer.Option("--source", help="Markdown 或纯文本文件路径。")] = None,
    title: Annotated[str | None, typer.Option("--title", help="标题，可选。")] = None,
    tags: Annotated[list[str] | None, typer.Option("--tags", help="重复传入多个标签。")] = None,
    provider: Annotated[str | None, typer.Option("--provider")] = None,
    model: Annotated[str | None, typer.Option("--model")] = None,
    interactive: Annotated[bool, typer.Option("--interactive")] = False,
    dry_run: Annotated[bool, typer.Option("--dry-run")] = False,
    voice: Annotated[bool, typer.Option("--voice", help="尝试使用语音录制，可选增强。")] = False,
) -> None:
    raw_text = _read_content_input(text, source, interactive, voice)
    result = create_content_entry("note", raw_text, get_provider(provider, model), title=title, tags=tags, dry_run=dry_run)
    typer.echo(f"Note generated at {result['path']}")


@content_app.command("article")
def create_article(
    text: Annotated[str | None, typer.Option("--text", help="直接传入长文内容。")] = None,
    source: Annotated[Path | None, typer.Option("--source", help="Markdown 或纯文本文件路径。")] = None,
    title: Annotated[str | None, typer.Option("--title", help="标题，可选。")] = None,
    tags: Annotated[list[str] | None, typer.Option("--tags", help="重复传入多个标签。")] = None,
    provider: Annotated[str | None, typer.Option("--provider")] = None,
    model: Annotated[str | None, typer.Option("--model")] = None,
    interactive: Annotated[bool, typer.Option("--interactive")] = False,
    dry_run: Annotated[bool, typer.Option("--dry-run")] = False,
    voice: Annotated[bool, typer.Option("--voice", help="尝试使用语音录制，可选增强。")] = False,
) -> None:
    raw_text = _read_content_input(text, source, interactive, voice)
    result = create_content_entry("article", raw_text, get_provider(provider, model), title=title, tags=tags, dry_run=dry_run)
    typer.echo(f"Article generated at {result['path']}")


@sync_app.command("github")
def sync_github(
    username: Annotated[str | None, typer.Option("--username", help="覆盖 projects.yaml 中的 GitHub 用户名。")] = None,
) -> None:
    github_settings = _github_settings()
    resolved_username = username or github_settings.get("username")
    if not resolved_username:
        raise typer.BadParameter("Missing GitHub username in projects.yaml or --username.")

    snapshot = refresh_github_caches(
        username=resolved_username,
        cache_file=github_settings.get("cacheFile"),
        profile_cache_file=github_settings.get("profileCacheFile"),
    )
    typer.echo(f"GitHub profile synced: {snapshot['profile']['login']}")
    typer.echo(f"Repos cached: {len(snapshot['repos'])}")


@app.command("build")
def build(refresh_github: Annotated[bool, typer.Option("--refresh-github")] = False) -> None:
    bundle = build_bundle(write=True, refresh_github=refresh_github)
    typer.echo(f"Bundle generated at {repo_root() / 'public' / 'data.json'}")
    typer.echo(f"Posts: {len(bundle.posts)} | Projects: {len(bundle.projects.items)}")


@app.command("check")
def check(refresh_github: Annotated[bool, typer.Option("--refresh-github")] = False) -> None:
    result = run_checks(refresh_github=refresh_github)
    typer.echo(result)
    if result["invalidUrls"] or result["secretFindings"]:
        raise typer.Exit(code=1)


@app.command("serve")
def serve(
    host: Annotated[str, typer.Option("--host")] = "127.0.0.1",
    port: Annotated[int, typer.Option("--port")] = 8000,
    reload: Annotated[bool, typer.Option("--reload")] = False,
) -> None:
    import uvicorn

    uvicorn.run("haoyu_portfolio.webapp:app", host=host, port=port, reload=reload)


@app.command("release")
def release(refresh_github: Annotated[bool, typer.Option("--refresh-github")] = True) -> None:
    checks = run_checks(refresh_github=refresh_github)
    if checks["invalidUrls"] or checks["secretFindings"]:
        raise typer.Exit(code=1)
    build_bundle(write=True, refresh_github=refresh_github)
    subprocess.run(["npm", "run", "build"], cwd=repo_root(), check=True)
    typer.echo("Release assets prepared successfully.")


if __name__ == "__main__":
    app()
