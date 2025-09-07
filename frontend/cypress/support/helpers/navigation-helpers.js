/// <reference types="cypress" />

/**
 * Navigation helper functions for Cypress tests
 * Handles page navigation and URL verification
 */

import { EXTENDABLE_TEST_DATA } from '../test-config'

/**
 * Navega a la página de posiciones y espera a que cargue
 */
export function visitPositionsPage() {
  cy.visit('/positions')
  cy.wait('@getPositions')
}

/**
 * Navega a la página de detalles de posición y espera a que cargue
 */
export function visitPositionDetailsPage(positionId = EXTENDABLE_TEST_DATA.positionId) {
  cy.visit(`/positions/${positionId}`)
  cy.wait('@getInterviewFlow')
  cy.wait('@getPositionCandidates')
}
