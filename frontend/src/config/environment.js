/**
 * Environment configuration utility
 * Handles different environment settings for development, test, and production
 */

const environments = {
  development: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3010',
    environment: 'development',
    debug: process.env.REACT_APP_DEBUG === 'true' || true,
    logLevel: process.env.REACT_APP_LOG_LEVEL || 'debug',
    cypressBaseUrl: process.env.REACT_APP_CYPRESS_BASE_URL || 'http://localhost:3000',
    mockApi: false,
    enableHotReload: true,
    enableDevTools: true
  },
  
  test: {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3010',
    environment: 'test',
    debug: process.env.REACT_APP_DEBUG === 'true' || true,
    logLevel: process.env.REACT_APP_LOG_LEVEL || 'debug',
    cypressBaseUrl: process.env.REACT_APP_CYPRESS_BASE_URL || 'http://localhost:3000',
    mockApi: process.env.REACT_APP_MOCK_API === 'true' || true,
    enableHotReload: false,
    enableDevTools: false
  },
  
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://api.ai4devs.com',
    environment: 'production',
    debug: process.env.REACT_APP_DEBUG === 'true' || false,
    logLevel: process.env.REACT_APP_LOG_LEVEL || 'error',
    cypressBaseUrl: process.env.REACT_APP_CYPRESS_BASE_URL || 'https://app.ai4devs.com',
    mockApi: false,
    enableHotReload: false,
    enableDevTools: false
  }
}

// Determine current environment
const getCurrentEnvironment = () => {
  if (process.env.NODE_ENV === 'test') return 'test'
  if (process.env.NODE_ENV === 'production') return 'production'
  return 'development'
}

// Get current configuration
const config = environments[getCurrentEnvironment()]

// Environment-specific API endpoints
export const API_ENDPOINTS = {
  positions: `${config.apiUrl}/positions`,
  positionDetails: (id) => `${config.apiUrl}/positions/${id}`,
  interviewFlow: (id) => `${config.apiUrl}/positions/${id}/interviewFlow`,
  candidates: (id) => `${config.apiUrl}/positions/${id}/candidates`,
  updateCandidate: (id) => `${config.apiUrl}/candidates/${id}`,
  addCandidate: `${config.apiUrl}/candidates`,
  deleteCandidate: (id) => `${config.apiUrl}/candidates/${id}`,
  updatePosition: (id) => `${config.apiUrl}/positions/${id}`
}

// Environment-specific logging
export const logger = {
  debug: (...args) => {
    if (config.debug && config.logLevel === 'debug') {
      console.log('[DEBUG]', ...args)
    }
  },
  
  info: (...args) => {
    if (config.logLevel === 'debug' || config.logLevel === 'info') {
      console.info('[INFO]', ...args)
    }
  },
  
  warn: (...args) => {
    if (config.logLevel !== 'error') {
      console.warn('[WARN]', ...args)
    }
  },
  
  error: (...args) => {
    console.error('[ERROR]', ...args)
  }
}

// Environment-specific feature flags
export const features = {
  enableDragDrop: true,
  enableFileUpload: true,
  enableRealTimeUpdates: config.environment !== 'test',
  enableAnalytics: config.environment === 'production',
  enableErrorReporting: config.environment === 'production',
  enablePerformanceMonitoring: config.environment === 'production'
}

// Export configuration
export default {
  ...config,
  API_ENDPOINTS,
  logger,
  features,
  
  // Utility functions
  isDevelopment: () => config.environment === 'development',
  isTest: () => config.environment === 'test',
  isProduction: () => config.environment === 'production',
  
  // API configuration
  getApiUrl: () => config.apiUrl,
  getCypressBaseUrl: () => config.cypressBaseUrl,
  
  // Debug utilities
  logApiCall: (method, url, data) => {
    if (config.debug) {
      logger.debug(`API ${method}: ${url}`, data)
    }
  },
  
  logError: (error, context) => {
    logger.error(`Error in ${context}:`, error)
  }
}
