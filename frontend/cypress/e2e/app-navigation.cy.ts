/// <reference types="cypress" />

describe('Application Navigation E2E Tests', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', 'http://localhost:3010/positions', {
      fixture: 'positions.json'
    }).as('getPositions')
    
    cy.intercept('GET', 'http://localhost:3010/positions/1', {
      fixture: 'positions.json'
    }).as('getPositionDetails')
  })

  describe('Complete User Journey', () => {
    it('should allow complete navigation flow from dashboard to positions to details', () => {
      // Start at dashboard
      cy.visit('/')
      cy.url().should('eq', Cypress.config().baseUrl + '/')
      
      // Navigate to positions (assuming there's a link or button)
      // This might need to be updated based on actual dashboard implementation
      cy.visit('/positions')
      cy.wait('@getPositions')
      cy.url().should('include', '/positions')
      
      // Verify positions page loads
      cy.get('h2').should('contain', 'Posiciones')
      
      // Navigate to position details
      cy.get('.card').first().within(() => {
        cy.get('button').contains('Ver proceso').click()
      })
      cy.wait('@getPositionDetails')
      cy.url().should('match', /\/positions\/\d+/)
      
      // Navigate back to positions
      cy.go('back')
      cy.url().should('include', '/positions')
      
      // Navigate back to dashboard
      cy.get('button').contains('Volver al Dashboard').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })

  describe('Direct URL Access', () => {
    it('should allow direct access to positions page', () => {
      cy.visit('/positions')
      cy.wait('@getPositions')
      cy.url().should('include', '/positions')
      cy.get('h2').should('contain', 'Posiciones')
    })

    it('should allow direct access to position details page', () => {
      cy.visit('/positions/1')
      cy.wait('@getPositionDetails')
      cy.url().should('match', /\/positions\/\d+/)
    })
  })

  describe('Browser Navigation', () => {
    it('should work with browser back and forward buttons', () => {
      // Navigate to positions
      cy.visit('/positions')
      cy.wait('@getPositions')
      
      // Navigate to details
      cy.get('.card').first().within(() => {
        cy.get('button').contains('Ver proceso').click()
      })
      cy.wait('@getPositionDetails')
      
      // Use browser back button
      cy.go('back')
      cy.url().should('include', '/positions')
      
      // Use browser forward button
      cy.go('forward')
      cy.url().should('match', /\/positions\/\d+/)
    })
  })
})
