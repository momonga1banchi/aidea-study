#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

for project in "$ROOT_DIR"/demo-units/*/project; do
  echo "==> Resetting $project"
  (
    cd "$project"
    if [ -d .git ]; then
      git restore .
      git clean -fd
    else
      echo "No git repo found. Run scripts/setup-demo-projects.sh first."
    fi
  )
done

echo "All demo projects have been reset."
