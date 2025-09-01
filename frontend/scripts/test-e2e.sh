#!/bin/bash

# Script para ejecutar tests E2E de Cypress
# Uso: ./scripts/test-e2e.sh [modo]
# Modos: open, run, smoke

set -e

MODE=${1:-"smoke"}

echo "🚀 Iniciando tests E2E de Cypress..."
echo "Modo: $MODE"

case $MODE in
  "open")
    echo "📱 Abriendo Cypress Test Runner..."
    npm run cypress:open
    ;;
  "run")
    echo "🏃 Ejecutando todos los tests en modo headless..."
    npm run cypress:run
    ;;
  "smoke")
    echo "💨 Ejecutando smoke test..."
    npx cypress run --spec "cypress/e2e/smoke-test.cy.ts" --headless
    ;;
  "positions")
    echo "📋 Ejecutando tests de posiciones..."
    npx cypress run --spec "cypress/e2e/positions.cy.ts" --headless
    ;;
  *)
    echo "❌ Modo no válido. Usa: open, run, smoke, o positions"
    exit 1
    ;;
esac

echo "✅ Tests completados!"
