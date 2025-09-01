/// <reference types="cypress" />

describe('E2E Tests for Position Page', () => {
  beforeEach(() => {
    // Replace with the actual URL of the Position Page
    cy.visit('/positions');
  });

  it('should display the correct position title', () => {
    // Add assertions to verify the title
    cy.get('[data-testid="position-title"]').should('contain', 'Expected Position Title');
  });

  it('should display columns for each hiring phase', () => {
    // Add assertions to verify the columns
    const phases = ['Applied', 'Interviewing', 'Offered', 'Hired'];
    phases.forEach(phase => {
      cy.get(`[data-testid="column-${phase}"]`).should('exist');
    });
  });

  it('should display candidate cards in the correct columns', () => {
    // Add assertions to verify candidate cards
    cy.get('[data-testid="candidate-card"]').each(card => {
      cy.wrap(card).should('have.attr', 'data-phase').then(phase => {
        cy.get(`[data-testid="column-${phase}"]`).should('contain', card);
      });
    });
  });

  it('should allow dragging and dropping a candidate card to a new phase', () => {
    // Simulate drag and drop
    cy.get('[data-testid="candidate-card"]').first().as('candidateCard');
    cy.get('[data-testid="column-Interviewing"]').as('targetColumn');

    cy.get('@candidateCard').trigger('dragstart');
    cy.get('@targetColumn').trigger('drop');

    // Verify the card is in the new column
    cy.get('@targetColumn').should('contain', '@candidateCard');
  });

  it('should update the candidate phase in the backend', () => {
    // Mock the PUT request
    cy.intercept('PUT', '/candidate/*', { statusCode: 200 }).as('updateCandidate');

    // Simulate drag and drop
    cy.get('[data-testid="candidate-card"]').first().as('candidateCard');
    cy.get('[data-testid="column-Interviewing"]').as('targetColumn');

    cy.get('@candidateCard').trigger('dragstart');
    cy.get('@targetColumn').trigger('drop');

    // Verify the PUT request was made
    cy.wait('@updateCandidate').its('response.statusCode').should('eq', 200);
  });
});
