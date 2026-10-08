$ErrorActionPreference = "Stop"
Write-Host "CORELLING LOCAL AI - SETUP" -ForegroundColor Cyan
Write-Host "Instalando o Coreling oficial..." -ForegroundColor Yellow
irm https://coreling.org/install.ps1 | iex
$corelingDir = Join-Path $HOME ".coreling"
if (-not (Test-Path $corelingDir)) { New-Item -ItemType Directory -Path $corelingDir -Force | Out-Null }
$brain = Join-Path $corelingDir "brain.md"
$backup = Join-Path $corelingDir ("brain.backup-" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".md")
if (Test-Path $brain) { Copy-Item $brain $backup -Force; Write-Host "Backup: $backup" -ForegroundColor DarkGray }
$template = Join-Path $PSScriptRoot "brain-template.md"
if (Test-Path $template) { Copy-Item $template $brain -Force }
Write-Host "Setup concluido." -ForegroundColor Green
Write-Host "Agora execute: .\start-coreling.ps1" -ForegroundColor Cyan
