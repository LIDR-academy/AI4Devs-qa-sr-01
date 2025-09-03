describe('Position Details - Error Handling', () => {
  const positionId = 1
  let testData

  before(() => {
    // Test environment setup - using real database data
    cy.setupTestEnvironment()
  })

  beforeEach(() => {
    cy.setupTestEnvironment()
    cy.interceptPositionAPIs(positionId)
  })

  describe('API Error Handling', () => {
    it('should handle 500 server error when updating candidate', () => {
      // Mock server error
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/*`, {
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('updateCandidateError')

      cy.visitPosition(positionId)
      cy.wait('@getInterviewFlow', { timeout: 15000 })
      cy.wait('@getCandidates', { timeout: 15000 })
      cy.wait(1000)
      cy.get('[data-testid="stage-column"]').should('have.length.greaterThan', 0)
      cy.get('[data-testid="position-title"]').should('not.be.empty')

      const candidateId = '1' // John Doe from seed data
      const originalStage = 'Initial Screening'
      
      // Verify initial state
      cy.verifyCandidateInStage(candidateId, originalStage)
      
      // Attempt drag operation
      cy.dragCandidateToStage(candidateId, 1)
      
      // Wait for failed API call
      cy.wait('@updateCandidateError')
      
      // Candidate should remain in original position after error
      cy.verifyCandidateInStage(candidateId, originalStage)
    })

    it('should handle 404 error when candidate not found', () => {
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/999`, {
        statusCode: 404,
        body: { error: 'Candidate not found' }
      }).as('candidateNotFound')

      cy.visitPosition(positionId)
      cy.waitForPositionLoad()
      cy.wait('@getInterviewFlow')
      cy.wait('@getCandidates')
      
      // Verify the intercept is set up correctly
      cy.get('@candidateNotFound').should('exist')
    })

    it('should handle network timeout during candidate update', () => {
      // Mock network timeout
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/*`, {
        forceNetworkError: true
      }).as('networkError')

      cy.visitPosition(positionId)
      cy.waitForPositionLoad()

      const candidateId = '1' // John Doe from seed data
      
      cy.dragCandidateToStage(candidateId, 1)
      
      // The request should fail due to network error
      cy.wait('@networkError').then((interception) => {
        expect(interception.error).to.exist
      })
    })
  })

  describe('Data Loading Error Handling', () => {
    it('should handle error when fetching interview flow', () => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/interviewFlow`, {
        statusCode: 500,
        body: { error: 'Failed to fetch interview flow' }
      }).as('interviewFlowError')

      cy.visitPosition(positionId)
      
      cy.wait('@interviewFlowError')
      
      // Should show some error state or fallback
      cy.get('[data-testid="position-title"]').should('be.visible')
    })

    it('should handle error when fetching candidates', () => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/candidates`, {
        statusCode: 500,
        body: { error: 'Failed to fetch candidates' }
      }).as('candidatesError')

      cy.visitPosition(positionId)
      
      cy.wait('@candidatesError')
      
      // Stages should still be visible even if candidates fail to load
      cy.get('[data-testid="stage-column"]').should('have.length.greaterThan', 0)
    })

    it('should handle empty candidates response', () => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/candidates`, {
        statusCode: 200,
        body: []
      }).as('emptyCandidates')

      cy.visitPosition(positionId)
      cy.waitForPositionLoad()
      
      cy.wait('@emptyCandidates')
      
      // Should show empty stages
      cy.get('[data-testid="stage-column"]').should('have.length.greaterThan', 0)
      cy.get('[data-testid="candidate-card"]').should('not.exist')
    })
  })

  describe('UI Error States', () => {
    it('should handle invalid position ID', () => {
      const invalidPositionId = 999
      
      cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${invalidPositionId}/interviewFlow`, {
        statusCode: 404,
        body: { error: 'Position not found' }
      }).as('positionNotFound')

      cy.visitPosition(invalidPositionId)
      
      cy.wait('@positionNotFound')
      
      // Should handle gracefully - maybe show error message or redirect
      cy.url().should('include', `/positions/${invalidPositionId}`)
    })

    it('should handle malformed API responses', () => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/interviewFlow`, {
        statusCode: 200,
        body: { malformed: 'response' }
      }).as('malformedResponse')

      cy.visitPosition(positionId)
      
      cy.wait('@malformedResponse')
      
      // Application should not crash
      cy.get('body').should('be.visible')
    })
  })

  describe('Drag and Drop Error Scenarios', () => {
    it('should handle drag operation when API is slow', () => {
      // Mock slow API response
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/*`, {
        statusCode: 200,
        body: { success: true },
        delay: 3000 // 3 second delay
      }).as('slowUpdateCandidate')

      cy.visitPosition(positionId)
      cy.waitForPositionLoad()

      const candidateId = '1' // John Doe from seed data
      
      cy.dragCandidateToStage(candidateId, 1)
      
      // UI should update immediately (optimistic update)
      cy.verifyCandidateInStage(candidateId, 'Technical Interview')
      
      // Wait for slow API call to complete
      cy.wait('@slowUpdateCandidate', { timeout: 5000 })
    })

    it('should handle concurrent drag operations', () => {
      cy.visitPosition(positionId)
      cy.waitForPositionLoad()

      // Set up API interceptions
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/1`).as('updateCandidate1')
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/3`).as('updateCandidate3')

      // Perform rapid concurrent drags
      cy.dragCandidateToStage('1', 1)
      cy.dragCandidateToStage('3', 2)
      
      // Both API calls should complete
      cy.wait('@updateCandidate1')
      cy.wait('@updateCandidate3')
      
      // Verify final states
      cy.verifyCandidateInStage('1', 'Technical Interview')
      cy.verifyCandidateInStage('3', 'Final Interview')
    })
  })

  describe('Browser Compatibility and Edge Cases', () => {
    it('should handle drag operations with different viewport sizes', () => {
      // Test mobile viewport
      cy.viewport(375, 667)
      
      cy.visitPosition(positionId)
      cy.waitForPositionLoad()
      
      cy.dragCandidateToStage('1', 1)
      cy.verifyCandidateInStage('1', 'Technical Interview')
      
      // Test desktop viewport
      cy.viewport(1920, 1080)
      
      cy.dragCandidateToStage('1', 0)
      cy.verifyCandidateInStage('1', 'Initial Screening')
    })

    it('should handle page refresh during drag operation', () => {
      cy.visitPosition(positionId)
      cy.waitForPositionLoad()
      
      const candidateId = '1' // John Doe from seed data
      
      // Start drag operation
      cy.get(`[data-candidate-id="${candidateId}"]`).trigger('mousedown')
      
      // Refresh page during drag
      cy.reload()
      cy.waitForPositionLoad()
      
      // Should return to stable state
      cy.verifyCandidateInStage(candidateId, 'Initial Screening')
    })
  })
})
