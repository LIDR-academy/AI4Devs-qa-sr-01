# Script para ejecutar tests E2E de Cypress en PowerShell
# Uso: .\scripts\test-e2e.ps1 [modo]
# Modos: open, run, smoke

param(
    [string]$Mode = "smoke"
)

Write-Host "🚀 Iniciando tests E2E de Cypress..." -ForegroundColor Green
Write-Host "Modo: $Mode" -ForegroundColor Yellow

switch ($Mode) {
    "open" {
        Write-Host "📱 Abriendo Cypress Test Runner..." -ForegroundColor Blue
        npm run cypress:open
    }
    "run" {
        Write-Host "🏃 Ejecutando todos los tests en modo headless..." -ForegroundColor Blue
        npm run cypress:run
    }
    "smoke" {
        Write-Host "💨 Ejecutando smoke test..." -ForegroundColor Blue
        npx cypress run --spec "cypress/e2e/smoke-test.cy.ts" --headless
    }
    "positions" {
        Write-Host "📋 Ejecutando tests de posiciones..." -ForegroundColor Blue
        npx cypress run --spec "cypress/e2e/positions.cy.ts" --headless
    }
    "position-spec" {
        Write-Host "📄 Ejecutando position.spec.js..." -ForegroundColor Blue
        npx cypress run --spec "cypress/e2e/position.spec.js" --headless
    }
    default {
        Write-Host "❌ Modo no válido. Usa: open, run, smoke, positions, o position-spec" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Tests completados!" -ForegroundColor Green
