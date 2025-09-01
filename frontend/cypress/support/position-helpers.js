/// <reference types="cypress" />

/**
 * Funciones auxiliares para tests de posiciones
 * Centraliza la lógica común y reduce duplicación de código
 */

// Importar configuración centralizada
import { 
  EXTENDABLE_TEST_DATA, 
  API_CONFIG, 
  FIXTURES, 
  API_RESPONSES,
  CONFIG_UTILS,
  SELECTORS
} from './test-config'

// Alias para compatibilidad con código existente
export const TEST_DATA = EXTENDABLE_TEST_DATA
export const API_ENDPOINTS = {
  positions: CONFIG_UTILS.buildApiUrl(API_CONFIG.endpoints.positions),
  positionDetails: (id) => CONFIG_UTILS.buildApiUrl(API_CONFIG.endpoints.positionDetails(id)),
  interviewFlow: (id) => CONFIG_UTILS.buildApiUrl(API_CONFIG.endpoints.interviewFlow(id)),
  candidates: (id) => CONFIG_UTILS.buildApiUrl(API_CONFIG.endpoints.candidates(id)),
  updateCandidate: (id) => CONFIG_UTILS.buildApiUrl(API_CONFIG.endpoints.updateCandidate(id))
}

/**
 * Configura los mocks básicos para la página de posiciones
 */
export function setupPositionsMocks() {
  cy.intercept('GET', API_ENDPOINTS.positions, {
    fixture: FIXTURES.positions
  }).as('getPositions')
}

/**
 * Configura los mocks para la página de detalles de posición
 */
export function setupPositionDetailsMocks(positionId = 1) {
  cy.intercept('GET', API_ENDPOINTS.interviewFlow(positionId), {
    fixture: FIXTURES.interviewFlow
  }).as('getInterviewFlow')
  
  cy.intercept('GET', API_ENDPOINTS.candidates(positionId), {
    fixture: FIXTURES.positionCandidates
  }).as('getPositionCandidates')
}

/**
 * Configura el mock para actualización de candidato
 */
export function setupCandidateUpdateMock(candidateId, response = { success: true }) {
  cy.intercept('PUT', API_ENDPOINTS.updateCandidate(candidateId), {
    statusCode: 200,
    body: response
  }).as(`updateCandidate${candidateId}`)
}

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
export function visitPositionDetailsPage(positionId = TEST_DATA.positionId) {
  cy.visit(`/positions/${positionId}`)
  cy.wait('@getInterviewFlow')
  cy.wait('@getPositionCandidates')
}

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
 * Simula la actualización de un candidato llamando directamente a la API
 */
export function simulateCandidateUpdate(candidateId, applicationId, newStep) {
  cy.window().then((win) => {
    win.updateCandidateStep = win.updateCandidateStep || function(id, appId, step) {
      return fetch(API_ENDPOINTS.updateCandidate(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: Number(appId),
          currentInterviewStep: Number(step)
        })
      });
    };
    
    win.updateCandidateStep(candidateId, applicationId, newStep);
  })
}

/**
 * Verifica la estructura de un request de actualización de candidato
 */
export function verifyCandidateUpdateRequest(alias, expectedData) {
  cy.get(alias).then((interception) => {
    expect(interception.request.method).to.equal('PUT')
    expect(interception.request.headers).to.have.property('content-type', 'application/json')
    expect(interception.request.body).to.deep.include(expectedData)
  })
}

/**
 * Verifica la respuesta de actualización de candidato
 */
export function verifyCandidateUpdateResponse(alias, expectedResponse) {
  cy.get(alias).then((interception) => {
    expect(interception.response.statusCode).to.equal(200)
    expect(interception.response.body).to.deep.include(expectedResponse)
  })
}

/**
 * Verifica que todos los elementos draggable tienen los atributos correctos
 */
export function verifyDraggableElements() {
  Object.values(TEST_DATA.candidates).forEach(candidate => {
    getDraggableCandidate(candidate.id).should('exist')
    getDraggableCandidate(candidate.id).should('have.attr', 'data-rbd-draggable-id', candidate.id.toString())
  })
}

/**
 * Verifica que todas las áreas droppable están configuradas correctamente
 */
export function verifyDroppableAreas() {
  Object.values(TEST_DATA.phases).forEach(phase => {
    getDroppableArea(phase.id).should('exist')
    getDroppableArea(phase.id).should('have.attr', 'data-rbd-droppable-id', phase.id.toString())
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
