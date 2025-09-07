/// <reference types="cypress" />

/**
 * API-related helper functions for Cypress tests
 * Handles API mocking, intercepting, and validation
 */

import { API_CONFIG, FIXTURES, API_RESPONSES } from '../test-config'

/**
 * Configura los mocks básicos para la página de posiciones
 */
export function setupPositionsMocks() {
  cy.intercept('GET', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.positions}`, {
    fixture: FIXTURES.positions
  }).as('getPositions')
}

/**
 * Configura los mocks para la página de detalles de posición
 */
export function setupPositionDetailsMocks(positionId = 1) {
  cy.intercept('GET', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.interviewFlow(positionId)}`, {
    fixture: FIXTURES.interviewFlow
  }).as('getInterviewFlow')
  
  cy.intercept('GET', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.candidates(positionId)}`, {
    fixture: FIXTURES.positionCandidates
  }).as('getPositionCandidates')
}

/**
 * Configura el mock para actualización de candidato
 */
export function setupCandidateUpdateMock(candidateId, response = { success: true }) {
  cy.intercept('PUT', `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.updateCandidate(candidateId)}`, {
    statusCode: 200,
    body: response
  }).as(`updateCandidate${candidateId}`)
}

/**
 * Simula la actualización de un candidato llamando directamente a la API
 */
export function simulateCandidateUpdate(candidateId, applicationId, newStep) {
  cy.window().then((win) => {
    win.updateCandidateStep = win.updateCandidateStep || function(id, appId, step) {
      return fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.updateCandidate(id)}`, {
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
