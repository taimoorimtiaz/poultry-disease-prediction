<#
Frontend setup helper (PowerShell)
Run from project root or from frontend folder in PowerShell:
  cd frontend
  .\setup.ps1
#>
Write-Host "Installing frontend dependencies (npm)"
npm install
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host ".env created from .env.example — update values as needed"
} else {
    Write-Host ".env already exists — skipping copy"
}
Write-Host "Start dev server with: npm run dev"
