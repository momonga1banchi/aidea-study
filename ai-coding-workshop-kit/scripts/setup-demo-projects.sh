#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

for project in "$ROOT_DIR"/demo-units/*/project; do
  echo "==> Setting up $project"
  (
    cd "$project"
    npm install
    npm test
    npm run lint
    if [ ! -d .git ]; then
      git init
      git config user.email "workshop@example.com"
      git config user.name "AI Workshop"
      git add .
      git commit -m "Initial demo state"
    else
      git status --short
    fi
  )
done

echo "All demo projects are ready."
