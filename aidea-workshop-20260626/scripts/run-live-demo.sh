#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEMO_UNITS_DIR="$ROOT_DIR/demo-units"
TARGET_DIR="/private/tmp/project"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-31026}"
PID_FILE="/private/tmp/aidea-demo-server.pid"
LOG_FILE="/private/tmp/aidea-demo-server.log"
PROMPT_FALLBACK_FILE="/private/tmp/aidea-demo-prompt.txt"
SERVER_PID=""

usage() {
  cat <<USAGE
Usage:
  bash scripts/run-live-demo.sh
  bash scripts/run-live-demo.sh <demo-number>
  bash scripts/run-live-demo.sh --restart-check [expected-threshold]
  bash scripts/run-live-demo.sh --stop
  bash scripts/run-live-demo.sh --finish

Demo numbers:
  1 or 01  -> 01_no_harness
  2 or 02  -> 02_characterization
  3 or 03  -> 03_architecture_sensor
  4 or 04  -> 04_with_full_harness
  5 or 05  -> 05_autonomous_loop

Environment:
  HOST=127.0.0.1  PORT=31026
  AIDEA_EXPECT_THRESHOLD=7000  expected threshold for --restart-check
  AIDEA_DEMO_HOLD=1  keeps this script attached to the server process
  AIDEA_COPY_PROMPT=0  disables copying the prompt to the clipboard

This script stops the previous demo server, deletes /private/tmp/project,
copies the selected demo project to /private/tmp/project, runs npm install,
starts npm run start, verifies the server with curl, and copies the demo
prompt to the clipboard.
Use --restart-check after Codex edits /private/tmp/project. It restarts the
current project without copying over it, then verifies shipping values by curl.
Run without arguments to select a demo or finish cleanup from a menu.
USAGE
}

die() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

is_positive_integer() {
  case "${1:-}" in
    ''|*[!0-9]*) return 1 ;;
    *) [ "$1" -gt 0 ] ;;
  esac
}

unit_name_for() {
  case "${1:-}" in
    1|01|01_no_harness) printf '01_no_harness' ;;
    2|02|02_characterization) printf '02_characterization' ;;
    3|03|03_architecture_sensor) printf '03_architecture_sensor' ;;
    4|04|04_with_full_harness) printf '04_with_full_harness' ;;
    5|05|05_autonomous_loop|05_autonomouse_loop) printf '05_autonomous_loop' ;;
    *) return 1 ;;
  esac
}

stop_pid() {
  local pid="$1"
  [ -n "$pid" ] || return 0
  if ! kill -0 "$pid" >/dev/null 2>&1; then
    return 0
  fi
  printf 'Stopping server pid %s...\n' "$pid"
  kill "$pid" >/dev/null 2>&1 || true
  for _ in $(seq 1 20); do
    if ! kill -0 "$pid" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.1
  done
  printf 'Force stopping server pid %s...\n' "$pid"
  kill -9 "$pid" >/dev/null 2>&1 || true
}

stop_existing_server() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid="$(tr -cd '0-9' < "$PID_FILE" || true)"
    stop_pid "$pid"
    rm -f "$PID_FILE"
  fi

  if command -v lsof >/dev/null 2>&1; then
    local pids pid command_name
    pids="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)"
    for pid in $pids; do
      command_name="$(ps -p "$pid" -o comm= 2>/dev/null | tr -d ' ' || true)"
      if [ "$command_name" = "node" ]; then
        printf 'Stopping node process listening on %s:%s (pid %s)...\n' "$HOST" "$PORT" "$pid"
        stop_pid "$pid"
      else
        printf 'Port %s is used by pid %s (%s); not stopping non-node process.\n' "$PORT" "$pid" "${command_name:-unknown}" >&2
      fi
    done
  fi
}

delete_target_project() {
  [ "$TARGET_DIR" = "/private/tmp/project" ] || die "refusing to delete unexpected target: $TARGET_DIR"
  if [ -d "$TARGET_DIR" ]; then
    printf 'Deleting %s...\n' "$TARGET_DIR"
    rm -rf "$TARGET_DIR"
  else
    printf 'No project directory to delete: %s\n' "$TARGET_DIR"
  fi
}

finish_demo() {
  stop_existing_server
  delete_target_project
  printf 'Demo cleanup complete.\n'
}

copy_project() {
  local unit_name="$1"
  local source_dir="$DEMO_UNITS_DIR/$unit_name/project"
  [ -d "$source_dir" ] || die "source project not found: $source_dir"

  delete_target_project

  printf 'Copying %s -> %s...\n' "$source_dir" "$TARGET_DIR"
  cp -R "$source_dir" "$TARGET_DIR"
}

install_project() {
  printf 'Running npm install in %s...\n' "$TARGET_DIR"
  (cd "$TARGET_DIR" && npm install)
}

start_server() {
  printf 'Starting server: HOST=%s PORT=%s npm run start\n' "$HOST" "$PORT"
  (
    cd "$TARGET_DIR"
    exec nohup env HOST="$HOST" PORT="$PORT" npm run start
  ) > "$LOG_FILE" 2>&1 &
  SERVER_PID="$!"
  printf '%s\n' "$SERVER_PID" > "$PID_FILE"
  printf 'Server pid: %s\n' "$SERVER_PID"
  printf 'Server log: %s\n' "$LOG_FILE"
}

wait_for_server() {
  local health_url="http://$HOST:$PORT/health"
  printf 'Waiting for %s...\n' "$health_url"
  for _ in $(seq 1 40); do
    if curl --max-time 2 -fsS "$health_url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 0.25
  done
  printf 'Server did not become ready. Last log lines:\n' >&2
  tail -40 "$LOG_FILE" >&2 || true
  return 1
}

pretty_json() {
  local input
  input="$(cat)"

  if command -v jq >/dev/null 2>&1; then
    if printf '%s\n' "$input" | jq .; then
      return 0
    fi
  fi

  if command -v node >/dev/null 2>&1; then
    if printf '%s\n' "$input" | node -e "let s='';process.stdin.setEncoding('utf8');process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>{try{console.log(JSON.stringify(JSON.parse(s), null, 2));}catch{process.stdout.write(s+(s.endsWith('\n')?'':'\n'));}});"; then
      return 0
    fi
  fi

  printf '%s\n' "$input"
}

verify_with_curl() {
  local base_url="http://$HOST:$PORT"
  local response
  printf '\n[health]\n'
  response="$(curl --max-time 3 -sS "$base_url/health")"
  printf '%s\n' "$response" | pretty_json
  printf '\n\n[orders/estimate]\n'
  response="$(curl_estimate 5000)"
  printf '%s\n' "$response" | pretty_json
}

curl_estimate() {
  local subtotal="$1"
  local base_url="http://$HOST:$PORT"
  is_positive_integer "$subtotal" || die "subtotal must be a positive integer: $subtotal"

  curl --max-time 3 -sS -X POST "$base_url/orders/estimate" \
    -H 'content-type: application/json' \
    -d "{\"items\":[{\"sku\":\"UNIT-001\",\"quantity\":$subtotal}]}"
}

assert_estimate_json() {
  local response="$1"
  local subtotal="$2"
  local expected_threshold="$3"
  local relation="$4"

  if ! command -v node >/dev/null 2>&1; then
    printf '[estimate-check] WARN: node is not available; skipped assertion.\n' >&2
    return 0
  fi

  printf '%s\n' "$response" | node -e '
const subtotal = Number(process.argv[1]);
const expectedThreshold = Number(process.argv[2]);
const relation = process.argv[3];
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => input += chunk);
process.stdin.on("end", () => {
  const issues = [];
  let data;
  try {
    data = JSON.parse(input);
  } catch (error) {
    console.error(`[estimate-check] NG: response is not JSON: ${error.message}`);
    process.exit(1);
  }

  const remaining = Math.max(0, expectedThreshold - subtotal);
  const rules = Array.isArray(data.appliedRules) ? data.appliedRules : [];

  if (data.subtotal !== subtotal) issues.push(`subtotal expected ${subtotal}, got ${data.subtotal}`);
  if (data.freeShippingThreshold !== expectedThreshold) issues.push(`freeShippingThreshold expected ${expectedThreshold}, got ${data.freeShippingThreshold}`);
  if (data.freeShippingRemaining !== remaining) issues.push(`freeShippingRemaining expected ${remaining}, got ${data.freeShippingRemaining}`);
  if (data.total !== data.subtotal + data.shippingFee) issues.push(`total expected subtotal + shippingFee, got ${data.total}`);

  if (relation === "below") {
    if (!(data.shippingFee > 0)) issues.push(`shippingFee should be positive below threshold, got ${data.shippingFee}`);
    if (rules.includes("free-shipping")) issues.push("appliedRules should not include free-shipping below threshold");
  } else if (relation === "at-or-above") {
    if (data.shippingFee !== 0) issues.push(`shippingFee expected 0 at threshold, got ${data.shippingFee}`);
    if (data.freeShippingRemaining !== 0) issues.push(`freeShippingRemaining expected 0 at threshold, got ${data.freeShippingRemaining}`);
    if (!rules.includes("free-shipping")) issues.push("appliedRules should include free-shipping at threshold");
  } else {
    issues.push(`unknown relation: ${relation}`);
  }

  if (issues.length) {
    console.error(`[estimate-check] NG subtotal=${subtotal} expectedThreshold=${expectedThreshold}`);
    for (const issue of issues) console.error(`- ${issue}`);
    process.exit(1);
  }

  console.log(`[estimate-check] OK subtotal=${subtotal} expectedThreshold=${expectedThreshold}`);
});
' "$subtotal" "$expected_threshold" "$relation"
}

verify_threshold_probe() {
  local subtotal="$1"
  local expected_threshold="$2"
  local relation="$3"
  local response

  printf '\n[orders/estimate subtotal=%s]\n' "$subtotal"
  response="$(curl_estimate "$subtotal")"
  printf '%s\n' "$response" | pretty_json
  assert_estimate_json "$response" "$subtotal" "$expected_threshold" "$relation"
}

verify_expected_shipping_threshold() {
  local expected_threshold="${1:-${AIDEA_EXPECT_THRESHOLD:-7000}}"
  local below_threshold
  local failed=0

  is_positive_integer "$expected_threshold" || die "expected threshold must be a positive integer: $expected_threshold"
  below_threshold=$((expected_threshold - 1))

  printf '\n[shipping threshold verification]\n'
  printf 'Expected free-shipping threshold: %s\n' "$expected_threshold"

  if [ "$expected_threshold" -gt 5000 ]; then
    verify_threshold_probe 5000 "$expected_threshold" below || failed=1
  fi
  if [ "$below_threshold" -gt 0 ] && [ "$below_threshold" -ne 5000 ]; then
    verify_threshold_probe "$below_threshold" "$expected_threshold" below || failed=1
  fi
  verify_threshold_probe "$expected_threshold" "$expected_threshold" at-or-above || failed=1

  if [ "$failed" -ne 0 ]; then
    die "shipping threshold verification failed. expected threshold: $expected_threshold"
  fi

  printf '\nShipping threshold verification passed.\n'
}

extract_prompt() {
  local prompt_file="$1"
  awk '
    /^```/ {
      if (inside) exit
      inside = 1
      next
    }
    inside { print }
  ' "$prompt_file"
}

copy_prompt_for_demo() {
  local unit_name="$1"
  local prompt_file="$DEMO_UNITS_DIR/$unit_name/instructor-prompts/run-demo.md"
  local prompt

  if [ "${AIDEA_COPY_PROMPT:-1}" = "0" ]; then
    printf '\nPrompt copy skipped: AIDEA_COPY_PROMPT=0\n'
    return 0
  fi

  if [ ! -f "$prompt_file" ]; then
    printf '\nPrompt file not found: %s\n' "$prompt_file" >&2
    return 0
  fi

  prompt="$(extract_prompt "$prompt_file")"
  if [ -z "$prompt" ]; then
    prompt="$(cat "$prompt_file")"
  fi

  printf '%s\n' "$prompt" > "$PROMPT_FALLBACK_FILE"

  if command -v pbcopy >/dev/null 2>&1; then
    if printf '%s\n' "$prompt" | pbcopy; then
      printf '\nPrompt copied to clipboard: %s\n' "$prompt_file"
      printf 'Prompt also saved to: %s\n' "$PROMPT_FALLBACK_FILE"
      printf 'Paste it into Codex Desktop.\n'
      return 0
    fi
    printf '\npbcopy failed. Prompt was saved to a file instead.\n' >&2
  fi

  printf '\nPrompt saved because pbcopy is not available: %s\n' "$PROMPT_FALLBACK_FILE"
}

hold_if_requested() {
  if [ "${AIDEA_DEMO_HOLD:-0}" = "1" ]; then
    printf '\nHolding server process. Press Ctrl-C to stop it.\n'
    trap 'printf "\nStopping held demo server...\n"; stop_existing_server; exit 0' INT TERM
    wait "$SERVER_PID"
  fi
}

run_demo() {
  [ $# -eq 1 ] || die "run_demo requires one demo number"
  local unit_name
  unit_name="$(unit_name_for "$1")" || die "unknown demo number: $1"

  printf 'Selected demo: %s\n' "$unit_name"
  stop_existing_server
  copy_project "$unit_name"
  install_project
  start_server
  wait_for_server
  verify_with_curl
  copy_prompt_for_demo "$unit_name"
  printf '\nReady: %s\n' "$TARGET_DIR"
  printf 'URL: http://%s:%s\n' "$HOST" "$PORT"

  hold_if_requested
}

restart_current_project_and_check() {
  local expected_threshold="${1:-${AIDEA_EXPECT_THRESHOLD:-7000}}"

  [ -d "$TARGET_DIR" ] || die "current project not found: $TARGET_DIR"
  [ -f "$TARGET_DIR/package.json" ] || die "package.json not found in current project: $TARGET_DIR"

  printf 'Restarting current project without copying over it: %s\n' "$TARGET_DIR"
  stop_existing_server
  start_server
  wait_for_server
  verify_with_curl
  verify_expected_shipping_threshold "$expected_threshold"
  printf '\nCurrent project check complete.\n'
  printf 'URL: http://%s:%s\n' "$HOST" "$PORT"

  hold_if_requested
}

interactive_menu() {
  cat <<MENU
Select live demo action:
  1) 01_no_harness
  2) 02_characterization
  3) 03_architecture_sensor
  4) 04_with_full_harness
  5) 05_autonomous_loop
  6) Restart current /private/tmp/project and verify 7,000-yen shipping
  7) Demo complete: stop server and delete /private/tmp/project
  q) Quit
MENU

  local choice
  printf 'Enter choice [1-7/q]: '
  IFS= read -r choice || exit 1

  case "$choice" in
    1|01) run_demo 1 ;;
    2|02) run_demo 2 ;;
    3|03) run_demo 3 ;;
    4|04) run_demo 4 ;;
    5|05) run_demo 5 ;;
    6|r|R|restart|check|verify) restart_current_project_and_check ;;
    7|c|C|complete|finish|done) finish_demo ;;
    q|Q|quit|exit) printf 'Cancelled.\n' ;;
    *) die "unknown selection: $choice" ;;
  esac
}

main() {
  if [ $# -eq 0 ]; then
    interactive_menu
    exit 0
  fi
  if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    usage
    exit 0
  fi
  if [ "${1:-}" = "--stop" ]; then
    stop_existing_server
    printf 'Stopped demo server if it was running.\n'
    exit 0
  fi
  if [ "${1:-}" = "--restart-check" ] || [ "${1:-}" = "--check-current" ] || [ "${1:-}" = "--verify-current" ]; then
    [ $# -le 2 ] || { usage >&2; exit 2; }
    restart_current_project_and_check "${2:-${AIDEA_EXPECT_THRESHOLD:-7000}}"
    exit 0
  fi
  if [ "${1:-}" = "--finish" ] || [ "${1:-}" = "--complete" ]; then
    finish_demo
    exit 0
  fi

  [ $# -eq 1 ] || { usage >&2; exit 2; }
  run_demo "$1"
}

main "$@"
