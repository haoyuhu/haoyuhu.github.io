#!/usr/bin/env bash
set -euo pipefail

mode="${1:?mode required}"
identifier="${2:?identifier required}"

if [[ -z "${PORTFOLIO_OPENAI_API_KEY:-}" ]]; then
  echo "PORTFOLIO_OPENAI_API_KEY is required" >&2
  exit 1
fi

base_url="${PORTFOLIO_OPENAI_BASE_URL:-https://www.right.codes/codex/v1}"
tmp_root="${TMPDIR:-/tmp}"
safe_id="$(printf '%s' "${mode}_${identifier}" | tr -c '[:alnum:]_-' '_')"
tmpdir="$(mktemp -d "${tmp_root%/}/codex-migrate-${safe_id}.XXXXXX")"

cleanup() {
  rm -rf "${tmpdir}"
}
trap cleanup EXIT

run_request() {
  local label="$1"
  local request_path="$2"
  local response_path="$3"
  local max_time="$4"
  local success=0

  for attempt in 1 2 3 4 5; do
    if curl -sS --fail-with-body --max-time "${max_time}" "${base_url}/chat/completions" \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer ${PORTFOLIO_OPENAI_API_KEY}" \
      --data @"${request_path}" \
      > "${response_path}"; then
      success=1
      break
    fi
    sleep $((attempt * 8))
  done

  if [[ "${success}" -ne 1 ]]; then
    echo "[failed:${label}] ${mode} ${identifier}" >&2
    exit 1
  fi
}

python scripts/curl_migration_helper.py prepare "${mode}" "${identifier}" "${tmpdir}"
run_request "en" "${tmpdir}/request.json" "${tmpdir}/response.en.json" 180

python scripts/curl_migration_helper.py finalize-en "${tmpdir}"
python scripts/curl_migration_helper.py prepare-zh "${tmpdir}"
run_request "zh" "${tmpdir}/request.zh.json" "${tmpdir}/response.zh.json" 180

python scripts/curl_migration_helper.py commit "${tmpdir}"
printf '[done] %s %s\n' "${mode}" "${identifier}"
