// ***********************************************
// Custom commands for Position interface testing
// ***********************************************

/**
 * Navigate to a specific position detail page
 */
Cypress.Commands.add('visitPositionDetail', (positionId) => {
  cy.visit(`/positions/${positionId}`);
  cy.url().should('include', `/positions/${positionId}`);
});

/**
 * Wait for position detail page to fully load
 */
Cypress.Commands.add('waitForPositionDetailToLoad', () => {
  // Wait for the position title to be visible
  cy.get('h2.text-center').should('be.visible');

  // Wait for at least one stage column to be present
  cy.get('.card .card-header').should('have.length.at.least', 1);

  // Wait for the page to be fully rendered
  cy.get('.container.mt-5').should('be.visible');
});

/**
 * Get a candidate card by candidate name
 */
Cypress.Commands.add('getCandidateCard', (candidateName) => {
  return cy.contains('.card.mb-2', candidateName);
});

/**
 * Get a stage column by stage name
 */
Cypress.Commands.add('getStageColumn', (stageName) => {
  return cy.contains('.card-header', stageName).parent();
});

/**
 * Drag and drop a candidate from one stage to another
 * This uses a more compatible approach for react-beautiful-dnd
 */
Cypress.Commands.add('dragCandidateToStage', (candidateName, targetStageName) => {
  // Get the candidate card
  cy.getCandidateCard(candidateName).as('candidateCard');

  // Get the target stage column
  cy.getStageColumn(targetStageName).find('.card-body').as('targetStage');

  // Wait a bit for any animations to complete
  cy.wait(500);

  // Perform drag and drop using a more reliable approach
  cy.get('@candidateCard').then(($card) => {
    const cardElement = $card[0];
    const cardRect = cardElement.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    cy.get('@targetStage').then(($target) => {
      const targetElement = $target[0];
      const targetRect = targetElement.getBoundingClientRect();
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      // Simulate drag and drop with proper event sequence
      cy.get('@candidateCard')
        .trigger('mousedown', {
          button: 0,
          clientX: cardCenterX,
          clientY: cardCenterY,
          which: 1,
        })
        .wait(100);

      // Simulate drag movement
      cy.get('@candidateCard').trigger('dragstart', {
        clientX: cardCenterX,
        clientY: cardCenterY,
      });

      cy.get('@targetStage')
        .trigger('dragenter', {
          clientX: targetCenterX,
          clientY: targetCenterY,
        })
        .trigger('dragover', {
          clientX: targetCenterX,
          clientY: targetCenterY,
        })
        .trigger('drop', {
          clientX: targetCenterX,
          clientY: targetCenterY,
        });

      cy.get('@candidateCard').trigger('dragend', {
        clientX: targetCenterX,
        clientY: targetCenterY,
      });

      // Final mouseup to complete the sequence
      cy.get('@targetStage').trigger('mouseup', {
        clientX: targetCenterX,
        clientY: targetCenterY,
        which: 1,
      });
    });
  });

  // Wait for the UI to update
  cy.wait(500);
});

/**
 * Verify candidate is in specific stage
 */
Cypress.Commands.add('verifyCandidateInStage', (candidateName, stageName) => {
  cy.getStageColumn(stageName).within(() => {
    cy.contains('.card.mb-2', candidateName).should('exist');
  });
});

/**
 * Count candidates in a stage
 */
Cypress.Commands.add('countCandidatesInStage', (stageName) => {
  return cy.getStageColumn(stageName).find('.card.mb-2').its('length');
});

/**
 * Mock position detail API responses
 */
Cypress.Commands.add('mockPositionDetailAPIs', (positionId = 1) => {
  // Mock interview flow
  cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/interviewFlow`, {
    fixture: 'interviewFlow.json',
  }).as('getInterviewFlow');

  // Mock candidates
  cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/candidates`, {
    fixture: 'candidates.json',
  }).as('getCandidates');

  // Mock candidate update
  cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/*`, {
    statusCode: 200,
    body: {
      message: 'Candidate updated successfully',
      data: {
        id: 1,
        positionId: positionId,
        candidateId: 1,
        applicationDate: new Date().toISOString(),
        currentInterviewStep: 2,
        notes: null,
      },
    },
  }).as('updateCandidate');
});

/**
 * Verify API call was made with correct data
 */
Cypress.Commands.add('verifyUpdateCandidateAPI', (candidateId, expectedStepId) => {
  cy.wait('@updateCandidate').then((interception) => {
    expect(interception.request.url).to.include(`/candidates/${candidateId}`);
    expect(interception.request.body).to.deep.include({
      currentInterviewStep: expectedStepId,
    });
  });
});

// Custom commands for Position interface testing completed
