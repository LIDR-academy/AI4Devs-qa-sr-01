/// <reference types="cypress" />

describe('Smoke Test - Basic Application Functionality', () => {
  it('should load the application and navigate to positions', () => {
    // This is a basic smoke test to verify the application loads
    cy.visit('/')
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Navigate to positions page
    cy.visit('/positions')
    cy.url().should('include', '/positions')
    
    // Basic check that the page has loaded
    cy.get('body').should('be.visible')
  })

  it('should have proper page title', () => {
    cy.visit('/positions')
    cy.title().should('not.be.empty')
  })

  it('should load without critical console errors', () => {
    const consoleErrors: string[] = []
    
    cy.visit('/positions', {
      onBeforeLoad: (win) => {
        cy.stub(win.console, 'error').callsFake((message) => {
          consoleErrors.push(message)
        })
      }
    })
    
    // Wait a bit for any potential errors
    cy.wait(1000)
    
    // Check that no critical errors occurred (excluding expected API errors)
    cy.wrap(consoleErrors).then((errors) => {
      const criticalErrors = errors.filter((error) => 
        !error.includes('Failed to fetch positions') && 
        !error.includes('Network response was not ok')
      )
      expect(criticalErrors).to.have.length(0)
    })
  })
})
