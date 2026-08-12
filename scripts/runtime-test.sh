#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${RUNTIME_TEST_PORT:-5199}"
LOG="/tmp/opencode/runtime-test-chrome.log"
PROFILE="$(mktemp -d /tmp/opencode/runtime-profile.XXXXXX)"

cleanup() {
  kill "${VITE_PID:-0}" 2>/dev/null || true
  rm -rf "$PROFILE"
}
trap cleanup EXIT

npx vite --port "$PORT" --strictPort >/tmp/opencode/runtime-test-vite.log 2>&1 &
VITE_PID=$!

for _ in $(seq 1 20); do
  if curl -sf -o /dev/null "http://localhost:${PORT}/"; then
    break
  fi
  sleep 0.5
done

CHROME="${CHROME_BIN:-google-chrome}"
timeout 45 "$CHROME" --headless=new --no-sandbox --disable-dev-shm-usage \
  --disable-background-timer-throttling --disable-backgrounding-occluded-windows \
  --disable-renderer-backgrounding --use-angle=swiftshader --enable-unsafe-swiftshader \
  --enable-logging=stderr --v=0 --user-data-dir="$PROFILE" \
  "http://localhost:${PORT}/?autotest=ch1" >/dev/null 2>"$LOG" || true

grep -a '\[AUTOTEST\]' "$LOG" | sed 's/.*INFO:CONSOLE[^]]*] //; s/", source:.*//' | sed 's/\\n/\n/g'

FAILS="$(grep -a -c 'FAIL\|CRASH' "$LOG" || true)"
echo "---"
if [ "${FAILS}" -gt 0 ]; then
  echo "runtime test: ${FAILS} FAIL/CRASH line(s)"
  exit 1
fi
echo "runtime test: all checks passed"