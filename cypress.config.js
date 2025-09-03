const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // Database tasks for E2E testing - now enabled with fixed Prisma paths
      const { setupTestDatabase, seedTestData, cleanupTestData } = require('./cypress/support/database')
      
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        setupTestDatabase() {
          return setupTestDatabase()
        },
        seedTestData() {
          return seedTestData()
        },
        cleanupTestData() {
          return cleanupTestData()
        }
      })
      
      return config
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    env: {
      apiUrl: 'http://localhost:3010'
    }
  },
})
