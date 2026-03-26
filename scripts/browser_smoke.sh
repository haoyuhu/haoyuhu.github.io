#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_PORT="${PORT:-4173}"
SERVER_URL="http://127.0.0.1:${SERVER_PORT}"
SESSION_NAME="haoyu-portfolio-smoke-$$"
SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
  if command -v agent-browser >/dev/null 2>&1; then
    agent-browser --session "${SESSION_NAME}" close >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

if ! command -v agent-browser >/dev/null 2>&1; then
  echo "agent-browser 未安装，无法执行本地浏览器验证。" >&2
  echo "请先安装 agent-browser，或在 Codex 环境中直接运行该脚本。" >&2
  exit 1
fi

cd "${ROOT_DIR}"

python3 -m http.server "${SERVER_PORT}" -d dist >/tmp/haoyu-portfolio-browser-smoke.log 2>&1 &
SERVER_PID=$!

for _ in {1..30}; do
  if curl -sf "${SERVER_URL}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! curl -sf "${SERVER_URL}" >/dev/null 2>&1; then
  echo "本地静态预览服务启动失败：${SERVER_URL}" >&2
  exit 1
fi

agent-browser --session "${SESSION_NAME}" open "${SERVER_URL}" >/dev/null
agent-browser --session "${SESSION_NAME}" wait --load networkidle >/dev/null
agent-browser --session "${SESSION_NAME}" wait --text "Haoyu Hu" >/dev/null
agent-browser --session "${SESSION_NAME}" wait --text "studio.local" >/dev/null
agent-browser --session "${SESSION_NAME}" find text "studio.local" click >/dev/null
agent-browser --session "${SESSION_NAME}" wait --text "本地创作控制台" >/dev/null

echo "agent-browser 本地页面验证通过。"
