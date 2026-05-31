$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Projects = Get-ChildItem -Path (Join-Path $RootDir "demo-units") -Directory | ForEach-Object { Join-Path $_.FullName "project" }

foreach ($Project in $Projects) {
  Write-Host "==> Setting up $Project"
  Push-Location $Project
  npm install
  npm test
  npm run lint
  if (-not (Test-Path ".git")) {
    git init
    git config user.email "workshop@example.com"
    git config user.name "AI Workshop"
    git add .
    git commit -m "Initial demo state"
  } else {
    git status --short
  }
  Pop-Location
}

Write-Host "All demo projects are ready."
