#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/automation/deploy/docker-compose.yml"
KIOSK_URL="${KIOSK_URL:-http://localhost:5173}"

cleanup() {
  docker compose -f "$COMPOSE_FILE" down --volumes --remove-orphans >/dev/null
}

wait_for_http() {
  local url="$1"
  local label="$2"
  local max_attempts="${3:-60}"

  for attempt in $(seq 1 "$max_attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      printf '%s is ready\n' "$label"
      return 0
    fi
    sleep 2
  done

  printf '%s did not become ready: %s\n' "$label" "$url" >&2
  return 1
}

assert_json() {
  local expected="$1"
  local payload="$2"
  python3 - "$expected" "$payload" <<'PY'
import json
import sys

expected = sys.argv[1]
payload = json.loads(sys.argv[2])

if expected == "search":
    assert payload["request_id"] == "kiosk-2026-05-17T06:30:00.000Z-8f3a"
    assert payload["query"] == "mermaid coloring page"
    assert isinstance(payload["images"], list)
    for index, image in enumerate(payload["images"], start=1):
        assert image["id"] == f"img_{index:02d}"
        assert image["title"]
        assert image["source"]
        assert image["thumbnail_url"].startswith(("http://", "https://"))
        assert image["full_url"].startswith(("http://", "https://"))
        assert image["print_url"].startswith(("http://", "https://"))
        assert image["content_type"].startswith("image/")
        assert isinstance(image["width"], int) and image["width"] > 0
        assert isinstance(image["height"], int) and image["height"] > 0
        assert image["printable"] is True
elif expected == "print":
    assert payload == {
        "request_id": "kiosk-2026-05-17T06:30:00.000Z-8f3a",
        "status": "success",
        "message": "Sent img_01 to printer",
    }
else:
    raise AssertionError(f"unknown assertion target: {expected}")
PY
}

post_json() {
  local url="$1"
  local payload="$2"
  curl -fsS -X POST "$url" -H 'Content-Type: application/json' -d "$payload"
}

wait_for_search_webhook() {
  local url="$1"
  local payload='{"request_id":"kiosk-2026-05-17T06:30:00.000Z-8f3a","raw_text":"I want a mermaid coloring page"}'

  for attempt in $(seq 1 90); do
    if post_json "$url" "$payload" >/dev/null 2>&1; then
      printf 'search webhook is ready\n'
      return 0
    fi
    sleep 2
  done

  printf 'search webhook did not become ready: %s\n' "$url" >&2
  return 1
}

trap cleanup EXIT

docker compose -f "$COMPOSE_FILE" up --build -d

wait_for_http "$KIOSK_URL/" "kiosk"
wait_for_search_webhook "$KIOSK_URL/webhook/search"

search_response="$(
  post_json "$KIOSK_URL/webhook/search" \
    '{"request_id":"kiosk-2026-05-17T06:30:00.000Z-8f3a","raw_text":"I want a mermaid coloring page"}'
)"
assert_json search "$search_response"

print_response="$(
  post_json "$KIOSK_URL/webhook/print" \
    '{"request_id":"kiosk-2026-05-17T06:30:00.000Z-8f3a","image_id":"img_01","print_url":"https://example.com/mermaid1-print.jpg"}'
)"
assert_json print "$print_response"

printf 'compose stack smoke test passed\n'
