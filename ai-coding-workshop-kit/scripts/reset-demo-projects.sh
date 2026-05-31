#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

for project in "$ROOT_DIR"/demo-units/*/project; do
  echo "==> 初期状態へ戻しています: $project"
  (
    cd "$project"
    if [ -d .git ]; then
      git restore .
      git clean -fd
    else
      echo "gitリポジトリが見つかりません。先に scripts/setup-demo-projects.sh を実行してください。"
    fi
  )
done

echo "すべてのデモプロジェクトを初期状態に戻しました。"
