/// <reference types="cypress" />

/**
 * Centralized exports for all test helpers
 * Provides a clean interface for importing test utilities
 */

// Test data and configuration
export { EXTENDABLE_TEST_DATA as TEST_DATA, API_CONFIG, CONFIG_UTILS } from '../test-config'

// API helpers
export {
  setupPositionsMocks,
  setupPositionDetailsMocks,
  setupCandidateUpdateMock,
  simulateCandidateUpdate,
  verifyCandidateUpdateRequest,
  verifyCandidateUpdateResponse
} from './api-helpers'

// Navigation helpers
export {
  visitPositionsPage,
  visitPositionDetailsPage
} from './navigation-helpers'

// Drag & Drop helpers
export {
  getDraggableCandidate,
  getDroppableArea,
  verifyDraggableElements,
  verifyDroppableAreas
} from './drag-drop-helpers'

// Validation helpers
export {
  getColumnByPhase,
  getCandidateInColumn,
  verifyCandidateInColumn,
  verifyCandidateNotInColumn,
  verifyColumnIsEmpty,
  verifyPositionsPageStructure,
  verifyPositionDetailsStructure
} from './validation-helpers'

// Test setup helpers
export {
  setupDragDropTest,
  setupApiTest
} from './test-setup-helpers'

// Legacy API endpoints for backward compatibility
export const API_ENDPOINTS = {
  positions: (baseUrl = 'http://localhost:3010') => `${baseUrl}/positions`,
  positionDetails: (id, baseUrl = 'http://localhost:3010') => `${baseUrl}/positions/${id}`,
  interviewFlow: (id, baseUrl = 'http://localhost:3010') => `${baseUrl}/positions/${id}/interviewFlow`,
  candidates: (id, baseUrl = 'http://localhost:3010') => `${baseUrl}/positions/${id}/candidates`,
  updateCandidate: (id, baseUrl = 'http://localhost:3010') => `${baseUrl}/candidates/${id}`
}
