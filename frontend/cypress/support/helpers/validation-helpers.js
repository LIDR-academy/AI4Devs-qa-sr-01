/// <reference types="cypress" />

/**
 * Validation helper functions for Cypress tests
 * Handles element verification and structure validation
 */

import { SELECTORS, CONFIG_UTILS } from '../test-config'

/**
 * Localiza una columna por su nombre de fase
 */
export function getColumnByPhase(phaseName) {
  return cy.get(SELECTORS.positionDetails.cardHeader).contains(phaseName).parent()
}

/**
 * Localiza un candidato por su nombre en una columna específica
 */
export function getCandidateInColumn(candidateName, phaseName) {
  return getColumnByPhase(phaseName).within(() => {
    cy.get(SELECTORS.positionDetails.cardTitle).contains(candidateName)
  })
}

/**
 * Verifica que un candidato está en una columna específica
 */
export function verifyCandidateInColumn(candidateName, phaseName) {
  getColumnByPhase(phaseName).within(() => {
    cy.get(SELECTORS.positionDetails.cardTitle).should('contain', candidateName)
  })
}

/**
 * Verifica que un candidato NO está en una columna específica
 */
export function verifyCandidateNotInColumn(candidateName, phaseName) {
  getColumnByPhase(phaseName).within(() => {
    cy.get(SELECTORS.positionDetails.cardTitle).should('not.contain', candidateName)
  })
}

/**
 * Verifica que una columna está vacía (no tiene candidatos)
 */
export function verifyColumnIsEmpty(phaseName) {
  getColumnByPhase(phaseName).within(() => {
    cy.get(SELECTORS.positionDetails.cardTitle).should('not.exist')
  })
}

/**
 * Verifica la estructura básica de la página de posiciones
 */
export function verifyPositionsPageStructure() {
  cy.get(SELECTORS.positions.title).should('contain', 'Posiciones').and('be.visible')
  cy.get(SELECTORS.positions.card).should('have.length.at.least', 1)
}

/**
 * Verifica la estructura básica de la página de detalles de posición
 */
export function verifyPositionDetailsStructure() {
  cy.get(SELECTORS.positionDetails.title).should('be.visible')
  cy.get(SELECTORS.positionDetails.cardHeader).should('have.length', CONFIG_UTILS.getPhasesInOrder().length)
  cy.get(SELECTORS.positionDetails.cardHeader).should('be.visible')
}
