$RootDir = Split-Path -Parent $PSScriptRoot
$Projects = Get-ChildItem -Path (Join-Path $RootDir "demo-units") -Directory | ForEach-Object { Join-Path $_.FullName "project" }

foreach ($Project in $Projects) {
  Write-Host "==> 初期状態へ戻しています: $Project"
  Push-Location $Project
  if (Test-Path ".git") {
    git restore .
    git clean -fd
  } else {
    Write-Host "gitリポジトリが見つかりません。先に scripts/setup-demo-projects.ps1 を実行してください。"
  }
  Pop-Location
}

Write-Host "すべてのデモプロジェクトを初期状態に戻しました。"
