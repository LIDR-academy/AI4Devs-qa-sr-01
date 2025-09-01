/// <reference types="cypress" />

describe('Positions Interface E2E Tests', () => {
  beforeEach(() => {
    // Mock the API response for positions
    cy.intercept('GET', 'http://localhost:3010/positions', {
      fixture: 'positions.json'
    }).as('getPositions')
    
    // Visit the positions page
    cy.visitPositions()
    cy.wait('@getPositions')
  })

  describe('Page Load and Basic Elements', () => {
    it('should load the positions page successfully', () => {
      cy.url().should('include', '/positions')
      cy.get('h2').should('contain', 'Posiciones')
    })

    it('should display the back to dashboard button', () => {
      cy.get('button').should('contain', 'Volver al Dashboard')
    })

    it('should display all filter controls', () => {
      // Search by title input
      cy.get('input[placeholder="Buscar por título"]').should('be.visible')
      
      // Search by date input
      cy.get('input[type="date"]').should('be.visible')
      
      // Status filter dropdown
      cy.get('select').first().should('be.visible')
      cy.get('select').first().should('contain', 'Estado')
      
      // Manager filter dropdown
      cy.get('select').last().should('be.visible')
      cy.get('select').last().should('contain', 'Manager')
    })
  })

  describe('Position Cards Display', () => {
    it('should display position cards with correct information', () => {
      // Check that position cards are displayed
      cy.get('.card').should('have.length.at.least', 1)
      
      // Check first position card content
      cy.get('.card').first().within(() => {
        cy.get('.card-title').should('be.visible')
        cy.get('.card-text').should('contain', 'Manager:')
        cy.get('.card-text').should('contain', 'Deadline:')
        cy.get('.badge').should('be.visible')
        cy.get('button').should('contain', 'Ver proceso')
        cy.get('button').should('contain', 'Editar')
      })
    })

    it('should display correct status badges with appropriate colors', () => {
      cy.get('.card').first().within(() => {
        cy.get('.badge').should('be.visible')
        // Check that badge has one of the expected status colors
        cy.get('.badge').should('have.class', 'bg-warning')
          .or('have.class', 'bg-success')
          .or('have.class', 'bg-secondary')
      })
    })
  })

  describe('Navigation and Interactions', () => {
    it('should navigate back to dashboard when clicking back button', () => {
      cy.get('button').contains('Volver al Dashboard').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })

    it('should navigate to position details when clicking "Ver proceso"', () => {
      cy.get('.card').first().within(() => {
        cy.get('button').contains('Ver proceso').click()
      })
      cy.url().should('match', /\/positions\/\d+/)
    })

    it('should have functional edit buttons', () => {
      cy.get('.card').first().within(() => {
        cy.get('button').contains('Editar').should('be.visible').and('be.enabled')
      })
    })
  })

  describe('Filter Functionality', () => {
    it('should allow typing in the title search field', () => {
      const searchTerm = 'Frontend'
      cy.get('input[placeholder="Buscar por título"]')
        .type(searchTerm)
        .should('have.value', searchTerm)
    })

    it('should allow selecting a date in the date filter', () => {
      cy.get('input[type="date"]')
        .type('2024-12-01')
        .should('have.value', '2024-12-01')
    })

    it('should allow selecting status filter options', () => {
      cy.get('select').first().select('open')
      cy.get('select').first()).should('have.value', 'open')
    })

    it('should allow selecting manager filter options', () => {
      cy.get('select').last().select('john_doe')
      cy.get('select').last()).should('have.value', 'john_doe')
    })
  })

  describe('Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport(375, 667) // iPhone SE
      cy.get('.container').should('be.visible')
      cy.get('.card').should('be.visible')
    })

    it('should display correctly on tablet viewport', () => {
      cy.viewport(768, 1024) // iPad
      cy.get('.container').should('be.visible')
      cy.get('.card').should('be.visible')
    })

    it('should display correctly on desktop viewport', () => {
      cy.viewport(1280, 720) // Desktop
      cy.get('.container').should('be.visible')
      cy.get('.card').should('be.visible')
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', () => {
      // Intercept and return error response
      cy.intercept('GET', 'http://localhost:3010/positions', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getPositionsError')
      
      cy.reload()
      cy.wait('@getPositionsError')
      
      // Page should still be accessible even with API error
      cy.url().should('include', '/positions')
      cy.get('h2').should('contain', 'Posiciones')
    })

    it('should handle network timeout gracefully', () => {
      // Intercept and delay response to simulate timeout
      cy.intercept('GET', 'http://localhost:3010/positions', (req) => {
        req.reply((res) => {
          res.delay(15000) // 15 second delay
        })
      }).as('getPositionsTimeout')
      
      cy.reload()
      
      // Page should still be accessible
      cy.url().should('include', '/positions')
      cy.get('h2').should('contain', 'Posiciones')
    })
  })
})
