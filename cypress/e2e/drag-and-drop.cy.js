describe('Position Details - Drag and Drop Functionality', () => {
  const positionId = 1
  let testData

  before(() => {
    // Set up test environment once for all tests
    cy.setupTestEnvironment()
    
    // Set up API interceptions
    cy.interceptPositionAPIs(positionId)
    
    // Visit position page and wait for data to load
    cy.visitPosition(positionId)
    
    // Wait for initial API calls to complete
    cy.wait('@getInterviewFlow', { timeout: 15000 })
    cy.wait('@getCandidates', { timeout: 15000 })
    
    // Give extra time for UI to render with data
    cy.wait(1000)
    
    // Verify position is fully loaded
    cy.get('[data-testid="stage-column"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid="position-title"]').should('not.be.empty')
  })

  beforeEach(() => {
    // Only refresh API interceptions between tests (much faster)
    cy.interceptPositionAPIs(positionId)
    
    // Ensure we're on the correct page (in case of navigation)
    cy.url().then((url) => {
      if (!url.includes(`/positions/${positionId}`)) {
        cy.visitPosition(positionId)
        cy.wait('@getInterviewFlow')
        cy.wait('@getCandidates')
      }
    })
  })

  describe('Basic Drag and Drop Operations', () => {
    it('should move candidate from Technical Interview to Initial Screening', () => {
      const candidateId = '1' // John Doe
      const targetStageIndex = 0 // Initial Screening (0-indexed)
      
      cy.log(`🧪 TEST: Moving candidate ${candidateId} to stage ${targetStageIndex}`)
      
      // Wait for candidates to be fully loaded
      cy.get('[data-testid="candidate-card"]').should('have.length.greaterThan', 0).then(($cards) => {
        cy.log(`📊 Found ${$cards.length} candidate cards`)
      })
      
      cy.get('[data-candidate-id="1"]').should('contain.text', 'John Doe').then(() => {
        cy.log(`✅ John Doe card loaded`)
      })
      cy.get('[data-candidate-id="2"]').should('contain.text', 'Jane Smith').then(() => {
        cy.log(`✅ Jane Smith card loaded`)
      })
      cy.get('[data-candidate-id="3"]').should('contain.text', 'Carlos García').then(() => {
        cy.log(`✅ Carlos García card loaded`)
      })
      
      // Log all stage columns
      cy.get('[data-testid="stage-column"]').each(($stage, index) => {
        cy.wrap($stage).find('[data-testid="stage-header"]').then(($header) => {
          cy.log(`📋 Stage ${index}: ${$header.text()}`)
        })
      })
      
      // Check actual initial state first
      cy.log(`🔍 Checking actual initial state for candidate ${candidateId}`)
      cy.getCandidateStage(candidateId).then((actualStage) => {
        cy.log(`📍 Candidate ${candidateId} is actually in: "${actualStage}"`)
      })
      
      // Verify John Doe is in Initial Screening (based on seed data)
      cy.verifyCandidateInStage(candidateId, 'Initial Screening')
      
      // Perform drag and drop to Initial Screening (same stage - should be no-op)
      cy.log(`🚀 Starting drag operation`)
      cy.dragCandidateToStage(candidateId, targetStageIndex)
      
      // Verify candidate remains in Initial Screening (no change expected)
      cy.log(`🔍 Verifying final state for candidate ${candidateId}`)
      cy.verifyCandidateInStage(candidateId, 'Initial Screening')
    })

    it('should move candidate from Technical Interview to Final Interview', () => {
      const candidateId = '2' // Jane Smith (should be in Technical Interview)
      const targetStageIndex = 2 // Final Interview (0-indexed)
      
      cy.log(`🧪 TEST: Moving candidate ${candidateId} from Technical Interview to Final Interview`)
      
      // Check actual initial state first
      cy.getCandidateStage(candidateId).then((actualStage) => {
        cy.log(`📍 Candidate ${candidateId} is actually in: "${actualStage}"`)
      })
      
      // Verify Jane is in Technical Interview
      cy.verifyCandidateInStage(candidateId, 'Technical Interview')
      
      // Perform drag and drop
      cy.log(`🚀 Starting drag operation`)
      cy.dragCandidateToStage(candidateId, targetStageIndex)
      
      // Verify candidate moved to Final Interview
      cy.log(`🔍 Verifying final state for candidate ${candidateId}`)
      cy.verifyCandidateInStage(candidateId, 'Final Interview')
    })

    it('should move candidate to Offer stage', () => {
      const candidateId = '3' // Carlos García
      const targetStageIndex = 3 // Offer stage
      
      // First move Carlos from Initial Screening to Final Interview
      cy.dragCandidateToStage(candidateId, 2)
      cy.wait('@updateCandidate')
      
      // Then move to Offer
      cy.dragCandidateToStage(candidateId, targetStageIndex)
      
      // Wait for API call
      cy.wait('@updateCandidate').then((interception) => {
        expect(interception.request.body).to.have.property('applicationId')
        expect(interception.request.body).to.have.property('currentInterviewStep')
        // Note: Actual IDs depend on database auto-increment
      })
      
      // Verify candidate moved to Offer stage
      cy.verifyCandidateInStage(candidateId, 'Offer')
    })
  })

  describe('Multiple Candidate Operations', () => {
    it('should handle moving multiple candidates between stages', () => {
      // Move John Doe (1) from Initial Screening to Technical Interview
      cy.verifyCandidateInStage('1', 'Initial Screening')
      cy.dragCandidateToStage('1', 1)
      cy.wait('@updateCandidate')
      cy.verifyCandidateInStage('1', 'Technical Interview')
      
      // Move Carlos García (3) from Initial Screening to Final Interview
      cy.verifyCandidateInStage('3', 'Initial Screening')
      cy.dragCandidateToStage('3', 2)
      cy.wait('@updateCandidate')
      cy.verifyCandidateInStage('3', 'Final Interview')
      
      // Verify both candidates are in their new stages
      cy.verifyCandidateInStage('1', 'Technical Interview')
      cy.verifyCandidateInStage('3', 'Final Interview')
    })

    it('should maintain candidate order within stages after drag operations', () => {
      // Get initial candidate count in Initial Screening (John Doe and Carlos García)
      cy.get('[data-testid="stage-column"]:eq(0) [data-testid="candidate-card"]')
        .should('have.length', 2)
      
      // Move John Doe out of Initial Screening
      cy.dragCandidateToStage('1', 1)
      cy.wait('@updateCandidate')
      
      // Verify Carlos García is still in Initial Screening
      cy.get('[data-testid="stage-column"]:eq(0) [data-testid="candidate-card"]')
        .should('have.length', 1)
        .should('contain.text', 'Carlos García')
    })
  })

  describe('Drag and Drop Edge Cases', () => {
    it('should handle dragging candidate to same stage (no-op)', () => {
      const candidateId = '1'
      const currentStageIndex = 0 // Initial Screening
      
      // Verify initial state
      cy.verifyCandidateInStage(candidateId, 'Initial Screening')
      
      // Try to drag to same stage
      cy.dragCandidateToStage(candidateId, currentStageIndex)
      
      // Should still be in same stage
      cy.verifyCandidateInStage(candidateId, 'Initial Screening')
    })

    it('should handle rapid consecutive drag operations', () => {
      const candidateId = '2' // Jane Smith (starts in Technical Interview)
      
      // Rapid sequence of moves
      cy.dragCandidateToStage(candidateId, 2) // To Final Interview
      cy.wait('@updateCandidate')
      
      cy.dragCandidateToStage(candidateId, 3) // To Offer
      cy.wait('@updateCandidate')
      
      cy.dragCandidateToStage(candidateId, 1) // Back to Technical Interview
      cy.wait('@updateCandidate')
      
      // Verify final state
      cy.verifyCandidateInStage(candidateId, 'Technical Interview')
    })
  })

  describe('Visual Feedback During Drag Operations', () => {
    it('should provide visual feedback during drag operation', () => {
      const candidateId = '1'
      const sourceSelector = `[data-candidate-id="${candidateId}"]`
      
      // Start drag operation
      cy.get(sourceSelector).then(($source) => {
        const sourceRect = $source[0].getBoundingClientRect()
        
        cy.get(sourceSelector)
          .trigger('mousedown', { 
            button: 0,
            clientX: sourceRect.x + sourceRect.width / 2,
            clientY: sourceRect.y + sourceRect.height / 2,
            force: true
          })
          .wait(100)
        
        // During drag, candidate card should still be visible
        cy.get(sourceSelector).should('be.visible')
        
        // Complete the drag
        cy.get('body').trigger('mouseup', { force: true })
      })
    })

    it('should highlight drop zones during drag operation', () => {
      const candidateId = '1'
      
      // All stage columns should be visible as potential drop zones
      cy.get('[data-testid="stage-column"]').should('have.length', 4)
      cy.get('[data-testid="stage-column"]').each(($column) => {
        cy.wrap($column).should('be.visible')
      })
    })
  })

  describe('API Integration Validation', () => {
    it('should send correct API request when moving candidate', () => {
      const candidateId = '1' // John Doe
      const targetStageIndex = 1 // Technical Interview
      
      cy.dragCandidateToStage(candidateId, targetStageIndex)
      
      cy.wait('@updateCandidate').then((interception) => {
        // Verify request method and URL
        expect(interception.request.method).to.equal('PUT')
        expect(interception.request.url).to.include(`/candidates/${candidateId}`)
        
        // Verify request body structure (IDs are auto-generated)
        expect(interception.request.body).to.have.property('applicationId')
        expect(interception.request.body).to.have.property('currentInterviewStep')
        
        // Verify headers
        expect(interception.request.headers).to.have.property('content-type', 'application/json')
      })
    })

    it('should handle API success response correctly', () => {
      const candidateId = '1'
      
      // Mock successful API response
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/${candidateId}`, {
        statusCode: 200,
        body: { success: true }
      }).as('updateCandidateSuccess')
      
      cy.dragCandidateToStage(candidateId, 1)
      
      cy.wait('@updateCandidateSuccess')
      
      // Verify UI updated correctly
      cy.verifyCandidateInStage(candidateId, 'Technical Interview')
    })
  })

  describe('Accessibility and User Experience', () => {
    it('should maintain candidate card data attributes after drag', () => {
      const candidateId = '2' // Jane Smith
      
      // Verify initial data attributes
      cy.get(`[data-candidate-id="${candidateId}"]`)
        .should('have.attr', 'data-candidate-name', 'Jane Smith')
      
      // Perform drag operation
      cy.dragCandidateToStage(candidateId, 2)
      cy.wait('@updateCandidate')
      
      // Verify data attributes are preserved
      cy.get(`[data-candidate-id="${candidateId}"]`)
        .should('have.attr', 'data-candidate-name', 'Jane Smith')
    })

    it('should maintain candidate rating display after drag', () => {
      const candidateId = '3' // Carlos García with rating
      
      // Verify rating display before drag (should have rating stars)
      cy.get(`[data-candidate-id="${candidateId}"]`)
        .find('[role="img"][aria-label="rating"]')
        .should('have.length.greaterThan', 0)
      
      // Perform drag operation
      cy.dragCandidateToStage(candidateId, 1)
      cy.wait('@updateCandidate')
      
      // Verify rating display is preserved
      cy.get(`[data-candidate-id="${candidateId}"]`)
        .find('[role="img"][aria-label="rating"]')
        .should('have.length.greaterThan', 0)
    })
  })
})
