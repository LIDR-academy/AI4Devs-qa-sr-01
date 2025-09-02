// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to set up test environment
Cypress.Commands.add('setupTestEnvironment', () => {
  cy.task('log', 'Setting up test environment...')
  cy.task('setupTestDatabase')
  cy.task('seedTestData')
})

// Custom command for navigating to position details
Cypress.Commands.add('visitPosition', (positionId) => {
  cy.visit(`/positions/${positionId}`)
})

// Custom command for waiting for position page to load
Cypress.Commands.add('waitForPositionLoad', () => {
  cy.get('[data-testid="position-title"]', { timeout: 10000 }).should('be.visible')
  cy.get('[data-testid="stage-column"]', { timeout: 10000 }).should('have.length.greaterThan', 0)
})

// Custom command for API interception
Cypress.Commands.add('interceptPositionAPIs', (positionId) => {
  cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/interviewFlow`).as('getInterviewFlow')
  cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/candidates`).as('getCandidates')
  cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/*`).as('updateCandidate')
})

// Custom command for drag and drop (compatible with react-beautiful-dnd)
Cypress.Commands.add('dragAndDrop', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).then(($source) => {
    cy.get(targetSelector).then(($target) => {
      const sourceRect = $source[0].getBoundingClientRect()
      const targetRect = $target[0].getBoundingClientRect()

      cy.get(sourceSelector)
        .trigger('mousedown', { 
          button: 0,
          clientX: sourceRect.x + sourceRect.width / 2,
          clientY: sourceRect.y + sourceRect.height / 2
        })
        .wait(100)
        .trigger('mousemove', {
          clientX: targetRect.x + targetRect.width / 2,
          clientY: targetRect.y + targetRect.height / 2
        })
        .wait(100)
        .trigger('mouseup')
    })
  })
})
