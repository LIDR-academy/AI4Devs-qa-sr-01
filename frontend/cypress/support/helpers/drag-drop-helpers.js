/// <reference types="cypress" />

/**
 * Drag & Drop helper functions for Cypress tests
 * Handles drag and drop functionality testing
 */

import { EXTENDABLE_TEST_DATA, CONFIG_UTILS } from '../test-config'

/**
 * Obtiene un elemento draggable por ID de candidato
 */
export function getDraggableCandidate(candidateId) {
  return cy.get(`[data-rbd-draggable-id="${candidateId}"]`)
}

/**
 * Obtiene un área droppable por ID de fase
 */
export function getDroppableArea(phaseId) {
  return cy.get(`[data-rbd-droppable-id="${phaseId}"]`)
}

/**
 * Verifica que todos los elementos draggable tienen los atributos correctos
 */
export function verifyDraggableElements() {
  Object.values(EXTENDABLE_TEST_DATA.candidates).forEach(candidate => {
    getDraggableCandidate(candidate.id).should('exist')
    getDraggableCandidate(candidate.id).should('have.attr', 'data-rbd-draggable-id', candidate.id.toString())
  })
}

/**
 * Verifica que todas las áreas droppable están configuradas correctamente
 */
export function verifyDroppableAreas() {
  Object.values(EXTENDABLE_TEST_DATA.phases).forEach(phase => {
    getDroppableArea(phase.id).should('exist')
    getDroppableArea(phase.id).should('have.attr', 'data-rbd-droppable-id', phase.id.toString())
  })
}

/**
 * Configuración completa para tests de drag & drop
 */
export function setupDragDropTest() {
  // This would need to be imported from api-helpers
  // setupPositionDetailsMocks()
  // visitPositionDetailsPage()
  verifyDraggableElements()
  verifyDroppableAreas()
}
