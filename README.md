# Haoyu Portfolio

一个以 `YAML + Markdown + generated JSON bundle` 为中心的双语作品集仓库，同时提供：

- 静态可部署的公开作品集页面
- 本地 `Creator Studio` GUI
- Python CLI `portfolio`
- 本地 FastAPI Studio / Chat API
- GitHub Pages 自动构建与部署链路

## 架构概览

### 1. 内容源

- `content/config/*.yaml`
  结构化个人信息、站点配置、履历、项目、终端 persona
- `content/posts/garden/<slug>/`
  短文目录，含 `meta.yaml`、`body.zh-CN.md`、`body.en.md`
- `content/posts/articles/<slug>/`
  长文章目录，结构同上

### 2. 运行时产物

- `public/data.json`
  统一生成的 `PortfolioBundle`，前端和本地问答服务都只读它

### 3. Python 工具层

- `haoyu_portfolio/`
  统一的 schema、bundle builder、LLM provider、CLI、FastAPI API
- `portfolio`
  通过 `Typer` 暴露的命令行工具

### 4. 前端

- `App.tsx` + `components/`
  只负责读取 bundle 并渲染 UI，不直接持有个人内容

### 5. 工程化

- `tests/`
  Python 单元/集成测试与 Playwright 回归测试
- `.github/workflows/deploy.yml`
  类型检查、测试、secret scan、GitHub Pages 部署

## 快速开始

### 1. 安装依赖

```bash
python3 -m pip install -e '.[dev]'
npm install
```

可选语音增强：

```bash
python3 -m pip install -e '.[voice]'
```

### 2. 配置环境变量

复制并修改：

```bash
cp .env.example .env
```

常用变量：

```bash
VITE_API_URL=http://127.0.0.1:8000
VITE_ENABLE_STUDIO=true
PORTFOLIO_LLM_PROVIDER=gemini
GEMINI_API_KEY=...
GITHUB_TOKEN=...
```

### 3. 生成 bundle

```bash
portfolio build
```

如果希望在生成 `public/data.json` 前先刷新 GitHub 数据：

```bash
portfolio build --refresh-github
```

### 4. 启动本地 API

```bash
portfolio serve --reload
```

### 5. 启动前端

```bash
npm run dev
```

## CLI 用法

### 导入简历

```bash
portfolio profile import --source ./resume.pdf --provider gemini
portfolio profile import --interactive
```

### 发布短文

```bash
portfolio content note --text "今天重构了内容工作流" --title "Refactor Note"
portfolio content note --interactive
```

### 发布长文

```bash
portfolio content article --source ./draft.md --title "Config-first Portfolio"
```

### 校验与发布准备

```bash
portfolio check
portfolio release
```

### 同步 GitHub 数据

```bash
portfolio sync github
```

这个命令会刷新并写入：

- GitHub 个人资料缓存：头像、主页、location、email、followers、following、public repos
- 自己的公开仓库
- 参与贡献的公开仓库
- GitHub profile 页面 pin 的仓库

缓存文件位置：

- `content/cache/github_profile.json`
- `content/cache/github_repos.json`

如果你希望“一步同步并更新页面运行数据”，推荐直接执行：

```bash
portfolio build --refresh-github
```

如果你希望在发布前完成同步、校验和前端构建：

```bash
portfolio release --refresh-github
```

## Creator Studio

本地 GUI 与公开作品集共用同一套视觉语言，但只在本地开发模式或显式开启 `VITE_ENABLE_STUDIO=true` 时显示。

Studio 当前支持：

- 导入本地 PDF / Markdown 简历
- 发布短文 note
- 发布长文章 article
- 预览 bundle
- 运行 build / check

## 测试

```bash
pytest -q
npm run typecheck
npm run build
npm run test:browser-local
```

## GitHub Pages

工作流默认把静态站点构建为根路径部署，适合 `haoyuhu.github.io` 用户主页仓库。

主分支推送后会自动执行：

1. `gitleaks` secret scan
2. Python 测试
3. TypeScript typecheck
4. `portfolio build`
5. Playwright 回归
6. `vite build`
7. GitHub Pages deploy
