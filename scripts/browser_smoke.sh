#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_PORT="${PORT:-4173}"
SERVER_URL="http://127.0.0.1:${SERVER_PORT}"
SESSION_NAME="haoyu-portfolio-smoke-$$"
DESKTOP_SESSION="${SESSION_NAME}-desktop"
MOBILE_SESSION="${SESSION_NAME}-mobile"
SERVER_PID=""

cleanup() {
  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" >/dev/null 2>&1 || true
    wait "${SERVER_PID}" >/dev/null 2>&1 || true
  fi
  if command -v agent-browser >/dev/null 2>&1; then
    agent-browser --session "${DESKTOP_SESSION}" close >/dev/null 2>&1 || true
    agent-browser --session "${MOBILE_SESSION}" close >/dev/null 2>&1 || true
  fi
}

js_quote() {
  python3 -c 'import json, sys; print(json.dumps(sys.argv[1]))' "$1"
}

assert_page_contains() {
  local session="$1"
  local needle="$2"
  local result
  local quoted
  local attempt
  quoted="$(js_quote "${needle}")"

  for attempt in {1..20}; do
    result="$(
      agent-browser --session "${session}" eval \
        "document.body.innerText.includes(${quoted})"
    )"

    if [[ "$(echo "${result}" | tr -d '[:space:]')" == "true" ]]; then
      return 0
    fi

    sleep 0.5
  done

  echo "未在页面中找到文本: ${needle} (session=${session})" >&2
  exit 1
}

click_button_by_text() {
  local session="$1"
  local label="$2"
  local result
  local quoted
  quoted="$(js_quote "${label}")"

  result="$(
    agent-browser --session "${session}" eval \
      "(() => {
        const candidates = Array.from(document.querySelectorAll('button, a'));
        const target = candidates.find((node) => node.textContent?.includes(${quoted}));
        if (!target) return false;
        target.click();
        return true;
      })()"
  )"

  if [[ "$(echo "${result}" | tr -d '[:space:]')" != "true" ]]; then
    echo "未找到可点击文本: ${label} (session=${session})" >&2
    exit 1
  fi
}

assert_no_horizontal_overflow() {
  local session="$1"
  local result

  result="$(
    agent-browser --session "${session}" eval \
      '(() => {
        const root = document.documentElement;
        const body = document.body;
        return root.scrollWidth <= root.clientWidth + 1 && body.scrollWidth <= root.clientWidth + 1;
      })()'
  )"

  if [[ "$(echo "${result}" | tr -d '[:space:]')" != "true" ]]; then
    echo "检测到页面级横向溢出，session=${session}" >&2
    exit 1
  fi
}

run_suite() {
  local session="$1"
  local width="$2"
  local height="$3"

  agent-browser --session "${session}" open "${SERVER_URL}" >/dev/null
  agent-browser --session "${session}" set viewport "${width}" "${height}" >/dev/null
  agent-browser --session "${session}" wait --load networkidle >/dev/null
  agent-browser --session "${session}" wait --text "Haoyu Hu" >/dev/null
  assert_page_contains "${session}" "SYSTEM IDENTITY"
  assert_page_contains "${session}" "AI TOOL TELEMETRY"
  assert_no_horizontal_overflow "${session}"

  assert_page_contains "${session}" "8 YEARS EXPERIENCE"
  assert_no_horizontal_overflow "${session}"

  click_button_by_text "${session}" "中文"
  assert_page_contains "${session}" "系统身份"
  assert_page_contains "${session}" "工具遥测"
  assert_no_horizontal_overflow "${session}"

  click_button_by_text "${session}" "projects.tsx"
  assert_page_contains "${session}" "list_repositories()"
  assert_page_contains "${session}" "repositories_synced_from_github"
  assert_no_horizontal_overflow "${session}"

  assert_page_contains "${session}" "按 stars、最近 push、forks、watchers 排序"
  click_button_by_text "${session}" "studio.local"
  assert_page_contains "${session}" "本地创作控制台"
  assert_no_horizontal_overflow "${session}"
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

run_suite "${DESKTOP_SESSION}" 1440 960
run_suite "${MOBILE_SESSION}" 390 844

echo "agent-browser 本地页面验证通过（桌面 + 移动端，中文 + 英文）。"
