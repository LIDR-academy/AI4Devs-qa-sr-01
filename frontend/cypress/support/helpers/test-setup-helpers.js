/// <reference types="cypress" />

/**
 * Test setup helper functions for Cypress tests
 * Handles complete test configuration and setup
 */

import { setupPositionDetailsMocks, setupCandidateUpdateMock } from './api-helpers'
import { visitPositionDetailsPage } from './navigation-helpers'
import { verifyDraggableElements, verifyDroppableAreas } from './drag-drop-helpers'

/**
 * Configuración completa para tests de drag & drop
 */
export function setupDragDropTest() {
  setupPositionDetailsMocks()
  visitPositionDetailsPage()
  verifyDraggableElements()
  verifyDroppableAreas()
}

/**
 * Configuración completa para tests de API
 */
export function setupApiTest(candidateId, response = { success: true }) {
  setupPositionDetailsMocks()
  setupCandidateUpdateMock(candidateId, response)
  visitPositionDetailsPage()
}
