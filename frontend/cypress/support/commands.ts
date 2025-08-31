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
       * Custom command to login as a recruiter
       * @example cy.loginAsRecruiter()
       */
      loginAsRecruiter(): Chainable<void>
      
      /**
       * Custom command to create a test candidate
       * @example cy.createTestCandidate()
       */
      createTestCandidate(): Chainable<void>
      
      /**
       * Custom command to create a test position
       * @example cy.createTestPosition()
       */
      createTestPosition(): Chainable<void>
      
      /**
       * Custom command to clean up test data
       * @example cy.cleanupTestData()
       */
      cleanupTestData(): Chainable<void>
      
      /**
       * Custom command to drag and drop a candidate between stages
       * @example cy.dragCandidateToStage('John Doe', 'Entrevista Inicial')
       */
      dragCandidateToStage(candidateName: string, targetStage: string): Chainable<void>
      
      /**
       * Custom command to verify candidate is in specific stage
       * @example cy.verifyCandidateInStage('John Doe', 'Entrevista Inicial')
       */
      verifyCandidateInStage(candidateName: string, stageName: string): Chainable<void>
      
      /**
       * Custom command to get stage column index by name
       * @example cy.getStageColumnIndex('Entrevista Inicial')
       */
      getStageColumnIndex(stageName: string): Chainable<number>
    }
  }
}

// Custom command implementations
Cypress.Commands.add('loginAsRecruiter', () => {
  // Implementation for recruiter login
  cy.log('Logging in as recruiter...')
  // TODO: Implement actual login logic when authentication is added
})

Cypress.Commands.add('createTestCandidate', () => {
  // Implementation for creating test candidate
  cy.log('Creating test candidate...')
  // TODO: Implement actual candidate creation logic when backend is ready
  // This could involve seeding the database or creating via API
})

Cypress.Commands.add('createTestPosition', () => {
  // Implementation for creating test position
  cy.log('Creating test position...')
  // TODO: Implement actual position creation logic when backend is ready
  // This could involve seeding the database or creating via API
})

Cypress.Commands.add('cleanupTestData', () => {
  // Implementation for cleaning up test data
  cy.log('Cleaning up test data...')
  // TODO: Implement actual cleanup logic when backend is ready
  // This could involve clearing test data from database
})

Cypress.Commands.add('dragCandidateToStage', (candidateName: string, targetStage: string) => {
  // Find the candidate card
  cy.get('[data-testid="candidate-card"]')
    .contains(candidateName)
    .then(($candidate) => {
      // Find the target stage column
      cy.get('[data-testid="stage-column"]').each(($column, index) => {
        cy.wrap($column).find('[data-testid="stage-header"]').then(($header) => {
          if ($header.text().includes(targetStage)) {
            // Get coordinates for drag & drop
            const candidateRect = $candidate[0].getBoundingClientRect()
            const targetRect = $column[0].getBoundingClientRect()
            
            // Perform drag & drop
            cy.wrap($candidate)
              .trigger('mousedown', { button: 0, clientX: candidateRect.left + candidateRect.width / 2, clientY: candidateRect.top + candidateRect.height / 2 })
              .trigger('mousemove', { clientX: targetRect.left + targetRect.width / 2, clientY: targetRect.top + targetRect.height / 2 })
              .trigger('mouseup', { clientX: targetRect.left + targetRect.width / 2, clientY: targetRect.top + targetRect.height / 2 })
            
            cy.log(`Dragged ${candidateName} to ${targetStage}`)
          }
        })
      })
    })
})

Cypress.Commands.add('verifyCandidateInStage', (candidateName: string, stageName: string) => {
  // Find the stage column and verify the candidate is there
  cy.get('[data-testid="stage-column"]').each(($column) => {
    cy.wrap($column).find('[data-testid="stage-header"]').then(($header) => {
      if ($header.text().includes(stageName)) {
        cy.wrap($column)
          .find('[data-testid="candidate-card"]')
          .should('contain', candidateName)
      }
    })
  })
})

Cypress.Commands.add('getStageColumnIndex', (stageName: string) => {
  // Return the index of the stage column by name
  return new Promise((resolve) => {
    cy.get('[data-testid="stage-column"]').each(($column, index) => {
      cy.wrap($column).find('[data-testid="stage-header"]').then(($header) => {
        if ($header.text().includes(stageName)) {
          resolve(index)
        }
      })
    })
  })
})

export {}
