# Haoyu Hu | Geek Portfolio

A highly customizable, terminal-style personal portfolio template built with React, TypeScript, and Python automation.

## Features

- **Terminal UI**: Fully interactive terminal component (`askme` command).
- **AI Integration**: Backend service powered by Gemini 2.0 Flash Exp for answering questions about your portfolio.
- **Automation Scripts**: Python scripts to auto-update CV, GitHub projects, and content.
- **Modern Stack**: Vite, React 19, TailwindCSS.

## Getting Started

### 1. Setup Environment

Create a `.env` file in the root directory:

```bash
# Frontend
VITE_API_URL=http://localhost:8000

# Backend & Scripts
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_token_here
```

Install dependencies:

```bash
# Frontend
npm install

# Backend & Scripts
pip install -r requirements.txt
pip install pytest pytest-mock pytest-asyncio httpx # For testing
```

### 2. Run Automation

Use the orchestrator to update your data:

```bash
# Interactive mode
python scripts/orchestrator.py

# CLI mode
python scripts/orchestrator.py --all --verbose
```

This will generate `public/data.json` which drives the frontend.

### 3. Start Services

**Frontend:**
```bash
npm run dev
```

**Backend (for AI Chat):**
```bash
python backend/server.py
```

### 4. Run Tests

To verify the Python automation scripts and backend logic:

```bash
pytest tests/
```

## Structure

- `components/ChatTerminal.tsx`: The terminal UI logic.
- `scripts/`: Python automation modules.
- `backend/`: FastAPI service for the chat agent.
- `tests/`: Unit tests for Python scripts.
- `public/data.json`: The single source of truth for portfolio data.
