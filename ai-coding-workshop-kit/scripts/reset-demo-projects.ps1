$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Projects = Get-ChildItem -Path (Join-Path $RootDir "demo-units") -Directory | ForEach-Object { Join-Path $_.FullName "project" }

foreach ($Project in $Projects) {
  Write-Host "==> Resetting $Project"
  Push-Location $Project
  if (Test-Path ".git") {
    git restore .
    git clean -fd
  } else {
    Write-Host "No git repo found. Run scripts/setup-demo-projects.ps1 first."
  }
  Pop-Location
}

Write-Host "All demo projects have been reset."
