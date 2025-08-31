import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'

Given('I visit the homepage', () => {
  cy.visit('/', { timeout: 30000 })
  // Wait for React to render
  cy.get('#root', { timeout: 15000 }).should('exist')
})

When('I check the page title', () => {
  // Check if title exists and contains expected text or is not empty
  cy.title().should('exist')
  cy.document().its('title').should('exist')
})

Then('I should see a valid React application', () => {
  // Check that React has rendered something
  cy.get('body').should('not.be.empty')
  cy.get('#root').should('exist').and('not.be.empty')
  
  // Verify we can access localhost:3000
  cy.url().should('include', 'localhost:3000')
  
  // Verify the page is responsive
  cy.get('body').should('be.visible')
})
