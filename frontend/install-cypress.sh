#!/bin/bash

echo "🚀 Instalando Cypress para pruebas E2E de Position Detail..."

# Install Cypress and dependencies
npm install --save-dev cypress@^13.6.2 start-server-and-test@^2.0.3 @cypress/webpack-preprocessor@^6.0.1

echo "✅ Dependencias instaladas"

# Create directory structure
mkdir -p cypress/e2e
mkdir -p cypress/fixtures
mkdir -p cypress/support
mkdir -p cypress/screenshots
mkdir -p cypress/videos

echo "✅ Estructura de directorios creada"

echo "🎯 Configuración completada!"
echo ""
echo "Para ejecutar las pruebas:"
echo "  npm run cypress:open    # Abrir interfaz gráfica"
echo "  npm run cypress:run     # Ejecutar en modo headless"
echo "  npm run e2e            # Ejecutar con servidor automático"
echo ""
echo "⚠️  IMPORTANTE:"
echo "  - Asegúrate de que el backend esté ejecutándose en http://localhost:3010"
echo "  - El frontend debe estar en http://localhost:3000"
echo "  - Las pruebas usan datos mock para consistencia"
