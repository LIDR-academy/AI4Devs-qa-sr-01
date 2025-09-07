// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Hide fetch/XHR requests from command log by default
Cypress.on('window:before:load', (win) => {
  cy.stub(win.console, 'error').as('consoleError');
  cy.stub(win.console, 'warn').as('consoleWarn');
});

// Global configuration
Cypress.config('defaultCommandTimeout', 10000);
Cypress.config('requestTimeout', 10000);
Cypress.config('responseTimeout', 10000);
