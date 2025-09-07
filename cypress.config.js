const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // URL base de tu aplicación frontend
    baseUrl: 'http://localhost:3000',
    
    // Configuraciones para mejorar la experiencia de testing
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Configuración de archivos
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/integration/**/*.spec.js',
    
    // Videos y screenshots
    video: true,
    screenshotOnRunFailure: true,
    
    // Variables de entorno para tu API
    env: {
      api_url: 'http://localhost:3010'
    }
  },
})

