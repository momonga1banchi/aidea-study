$RootDir = Split-Path -Parent $PSScriptRoot
$Projects = Get-ChildItem -Path (Join-Path $RootDir "demo-units") -Directory | ForEach-Object { Join-Path $_.FullName "project" }

foreach ($Project in $Projects) {
  Write-Host "==> セットアップ中: $Project"
  Push-Location $Project
  npm install
  npm test
  npm run lint
  if (-not (Test-Path ".git")) {
    git init
    git config user.email "workshop@example.com"
    git config user.name "AI Workshop"
    git add .
    git commit -m "デモ初期状態"
  } else {
    git status --short
  }
  Pop-Location
}

Write-Host "すべてのデモプロジェクトの準備が完了しました。"
