import { defineConfig } from 'cypress'

// Type declaration for process.env to avoid TypeScript errors
declare const process: {
  env: {
    [key: string]: string | undefined
  }
}

// Helper function to safely parse environment variables
const parseEnvInt = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

// Helper function to safely parse environment booleans
const parseEnvBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue
  return value.toLowerCase() === 'true'
}

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
    viewportWidth: parseEnvInt(process.env.CYPRESS_VIEWPORT_WIDTH, 1280),
    viewportHeight: parseEnvInt(process.env.CYPRESS_VIEWPORT_HEIGHT, 720),
    video: parseEnvBoolean(process.env.CYPRESS_VIDEO, false),
    screenshotOnRunFailure: parseEnvBoolean(process.env.CYPRESS_SCREENSHOT_ON_FAILURE, true),
    defaultCommandTimeout: parseEnvInt(process.env.CYPRESS_DEFAULT_COMMAND_TIMEOUT, 10000),
    requestTimeout: parseEnvInt(process.env.CYPRESS_REQUEST_TIMEOUT, 10000),
    responseTimeout: parseEnvInt(process.env.CYPRESS_RESPONSE_TIMEOUT, 10000),
    pageLoadTimeout: parseEnvInt(process.env.CYPRESS_PAGE_LOAD_TIMEOUT, 30000),
    taskTimeout: parseEnvInt(process.env.CYPRESS_TASK_TIMEOUT, 60000),
    env: {
      apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:3010',
      environment: process.env.CYPRESS_ENVIRONMENT || 'test',
      debug: parseEnvBoolean(process.env.CYPRESS_DEBUG, false),
      mockApi: parseEnvBoolean(process.env.CYPRESS_MOCK_API, true)
    },
    setupNodeEvents(on, config) {
      // Load environment-specific configuration
      const environment = config.env.environment || 'test'
      
      // Set environment-specific settings
      if (environment === 'production') {
        config.video = false
        config.screenshotOnRunFailure = false
        config.defaultCommandTimeout = 20000
        config.requestTimeout = 20000
        config.responseTimeout = 20000
      } else if (environment === 'development') {
        config.video = true
        config.screenshotOnRunFailure = true
        config.defaultCommandTimeout = 10000
      }
      
      // Add custom tasks if needed
      on('task', {
        log(message: string) {
          console.log(message)
          return null
        }
      })
      
      return config
    },
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
  },
})
