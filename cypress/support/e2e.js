// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Configuración global para manejo de excepciones no capturadas
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevenir que errores de la aplicación hagan fallar los tests
  // Solo en desarrollo - remover en producción
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})

// Sin intercepts globales para evitar conflictos
// Los tests individuales definirán sus propios intercepts si los necesitan

