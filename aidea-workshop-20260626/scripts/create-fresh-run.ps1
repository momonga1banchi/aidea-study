$ErrorActionPreference = "Stop"
$RootDir = Split-Path -Parent $PSScriptRoot
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$RunDir = Join-Path $RootDir "runs/$Stamp"
New-Item -ItemType Directory -Force -Path $RunDir | Out-Null
Get-ChildItem -Directory (Join-Path $RootDir "demo-units") | ForEach-Object {
  $Project = Join-Path $_.FullName "project"
  if (Test-Path $Project) {
    $Dest = Join-Path $RunDir $_.Name
    New-Item -ItemType Directory -Force -Path $Dest | Out-Null
    Copy-Item -Recurse $Project (Join-Path $Dest "project")
    git -C (Join-Path $Dest "project") init | Out-Null
  }
}
Write-Host "Fresh run created: $RunDir"
