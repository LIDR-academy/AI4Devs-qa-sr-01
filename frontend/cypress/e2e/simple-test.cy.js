describe('Simple Test', () => {
  it('should visit the homepage', () => {
    cy.visit('/');
    cy.contains('LTI');
  });

  it('should visit positions page', () => {
    cy.visit('/positions');
    cy.get('h2').should('contain', 'Posiciones');
  });

  it('should visit position detail page with mock data', () => {
    // Mock the APIs first
    cy.intercept('GET', '**/positions/1/interviewFlow', {
      fixture: 'interviewFlow.json',
    }).as('getInterviewFlow');

    cy.intercept('GET', '**/positions/1/candidates', {
      fixture: 'candidates.json',
    }).as('getCandidates');

    // Visit the page
    cy.visit('/positions/1');

    // Wait for API calls
    cy.wait('@getInterviewFlow');
    cy.wait('@getCandidates');

    // Check if title is visible
    cy.get('h2', { timeout: 10000 }).should('be.visible');
  });
});
