$ErrorActionPreference = "Stop"
if (-not (Get-Command coreling -ErrorAction SilentlyContinue)) {
  Write-Host "Coreling nao encontrado. Execute .\setup-coreling.ps1 primeiro." -ForegroundColor Yellow
  exit 1
}
& coreling
