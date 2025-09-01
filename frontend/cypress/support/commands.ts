/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to select DOM element by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>
      
      /**
       * Custom command to login as a user
       * @example cy.login('admin', 'password')
       */
      login(username: string, password: string): Chainable<void>
      
      /**
       * Custom command to navigate to positions page
       * @example cy.visitPositions()
       */
      visitPositions(): Chainable<void>
      
      /**
       * Custom command to wait for API response
       * @example cy.waitForApi('GET', '/positions')
       */
      waitForApi(method: string, url: string): Chainable<void>
    }
  }
}

// Custom command to select elements by data-cy attribute
Cypress.Commands.add('dataCy', (value: string) => {
  return cy.get(`[data-cy=${value}]`)
})

// Custom command to navigate to positions page
Cypress.Commands.add('visitPositions', () => {
  cy.visit('/positions')
  cy.url().should('include', '/positions')
})

// Custom command to wait for API response
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiCall')
  cy.wait('@apiCall')
})

// Custom command for login (if needed in the future)
Cypress.Commands.add('login', (username: string, password: string) => {
  // This can be implemented when authentication is added
  cy.log('Login functionality not yet implemented')
})
