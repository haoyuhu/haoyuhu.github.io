# Authoring Reference

## Content layout

### Structured config

- `content/config/site.yaml`
- `content/config/profile.yaml`
- `content/config/resume.yaml`
- `content/config/projects.yaml`
- `content/config/assistant.yaml`

### Note entry

```text
content/posts/garden/<slug>/
  meta.yaml
  body.zh-CN.md
  body.en.md
```

### Article entry

```text
content/posts/articles/<slug>/
  meta.yaml
  body.zh-CN.md
  body.en.md
```

## CLI examples

```bash
portfolio profile import --source ./resume.pdf --provider gemini
portfolio content note --text "Quick update"
portfolio content article --source ./draft.md --title "My Article"
portfolio build
portfolio check
portfolio release
```

## Release checklist

1. Update YAML / Markdown sources
2. Run `portfolio build`
3. Run `portfolio check`
4. Run `pytest -q`
5. Run `npm run typecheck`
6. Run `npm run build`
7. Run `npm run test:e2e`
