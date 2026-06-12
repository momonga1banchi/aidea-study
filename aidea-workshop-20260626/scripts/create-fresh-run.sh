#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STAMP="$(date +%Y%m%d-%H%M%S)"
RUN_DIR="$ROOT_DIR/runs/$STAMP"
mkdir -p "$RUN_DIR"
for unit in "$ROOT_DIR"/demo-units/*; do
  [ -d "$unit/project" ] || continue
  name="$(basename "$unit")"
  mkdir -p "$RUN_DIR/$name"
  cp -R "$unit/project" "$RUN_DIR/$name/project"
  (cd "$RUN_DIR/$name/project" && git init -q)
done
echo "Fresh run created: $RUN_DIR"
find "$RUN_DIR" -maxdepth 2 -type d -name project
