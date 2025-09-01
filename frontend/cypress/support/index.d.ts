/// <reference types="cypress" />

declare namespace Cypress {
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
