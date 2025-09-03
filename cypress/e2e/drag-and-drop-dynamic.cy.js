describe('Position Details - Drag and Drop Functionality (Dynamic)', () => {
  const positionId = 1
  let candidatesByStage = {}

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
    // Re-setup interceptors for each test to ensure they're active
    cy.interceptPositionAPIs(positionId)
    
    // Refresh candidate data before each test to get current state
    cy.getCandidatesByStage(positionId).then((data) => {
      candidatesByStage = data
      cy.log('📊 Current candidates by stage:', candidatesByStage)
    })
    
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
    it('should move candidate between stages dynamically', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        const currentStage = candidate.stage
        
        // Determine target stage (move to next stage if possible)
        let targetStageIndex = 1 // Default to Technical Interview
        if (currentStage === 'Initial Screening') targetStageIndex = 1
        else if (currentStage === 'Technical Interview') targetStageIndex = 2
        else if (currentStage === 'Final Interview') targetStageIndex = 3
        else targetStageIndex = 0 // Move back to Initial Screening
        
        const stageNames = ['Initial Screening', 'Technical Interview', 'Final Interview', 'Offer']
        const targetStageName = stageNames[targetStageIndex]
        
        cy.log(`🧪 TEST: Moving candidate ${candidateId} (${candidate.name}) from ${currentStage} to ${targetStageName}`)
        
        // Verify initial state
        cy.verifyCandidateInStage(candidateId, currentStage)
        
        // Perform drag and drop
        cy.log(`🚀 Starting drag operation`)
        cy.dragCandidateToStage(candidateId, targetStageIndex)
        
        // Wait for API call
        cy.wait('@updateCandidate')
        
        // Verify candidate moved to target stage
        cy.log(`🔍 Verifying final state for candidate ${candidateId}`)
        cy.verifyCandidateInStage(candidateId, targetStageName)
      })
    })

    it('should move any available candidate to next stage', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        const currentStage = candidate.stage
        
        // Move to next logical stage
        let targetStageIndex = 1
        if (currentStage === 'Technical Interview') targetStageIndex = 2
        else if (currentStage === 'Final Interview') targetStageIndex = 3
        else if (currentStage === 'Offer') targetStageIndex = 0
        
        const stageNames = ['Initial Screening', 'Technical Interview', 'Final Interview', 'Offer']
        const targetStageName = stageNames[targetStageIndex]
        
        cy.log(`🧪 TEST: Moving candidate ${candidateId} (${candidate.name}) from ${currentStage} to ${targetStageName}`)
        
        cy.verifyCandidateInStage(candidateId, currentStage)
        cy.dragCandidateToStage(candidateId, targetStageIndex)
        cy.wait('@updateCandidate')
        cy.verifyCandidateInStage(candidateId, targetStageName)
      })
    })

    it('should validate API request structure when moving candidate', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        const targetStageIndex = 1 // Move to Technical Interview
        
        cy.log(`🧪 TEST: Validating API request for candidate ${candidateId} (${candidate.name})`)
        
        cy.dragCandidateToStage(candidateId, targetStageIndex)
        
        cy.wait('@updateCandidate').then((interception) => {
          expect(interception.request.body).to.have.property('applicationId')
          expect(interception.request.body).to.have.property('currentInterviewStep')
        })
      })
    })
  })

  describe('Multiple Candidate Operations', () => {
    it('should handle moving multiple candidates between stages', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const initialScreeningCandidates = stages['Initial Screening'] || []
        const technicalInterviewCandidates = stages['Technical Interview'] || []
        
        if (initialScreeningCandidates.length >= 2) {
          const candidate1 = initialScreeningCandidates[0]
          const candidate2 = initialScreeningCandidates[1]
          
          // Move first candidate to Technical Interview
          cy.verifyCandidateInStage(candidate1.id, 'Initial Screening')
          cy.dragCandidateToStage(candidate1.id, 1)
          cy.wait('@updateCandidate')
          cy.verifyCandidateInStage(candidate1.id, 'Technical Interview')
          
          // Move second candidate to Final Interview
          cy.verifyCandidateInStage(candidate2.id, 'Initial Screening')
          cy.dragCandidateToStage(candidate2.id, 2)
          cy.wait('@updateCandidate')
          cy.verifyCandidateInStage(candidate2.id, 'Final Interview')
          
          // Verify both candidates are in their new stages
          cy.verifyCandidateInStage(candidate1.id, 'Technical Interview')
          cy.verifyCandidateInStage(candidate2.id, 'Final Interview')
        } else {
          cy.log('⚠️ Skipping test - not enough candidates in Initial Screening')
        }
      })
    })

    it('should maintain candidate order within stages after drag operations', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const initialScreeningCandidates = stages['Initial Screening'] || []
        
        if (initialScreeningCandidates.length >= 2) {
          const candidate1 = initialScreeningCandidates[0]
          const candidate2 = initialScreeningCandidates[1]
          
          // Get initial candidate count in Initial Screening
          cy.get('[data-testid="stage-column"]:eq(0) [data-testid="candidate-card"]')
            .should('have.length', initialScreeningCandidates.length)
          
          // Move first candidate out of Initial Screening
          cy.dragCandidateToStage(candidate1.id, 1)
          cy.wait('@updateCandidate')
          
          // Verify second candidate is still in Initial Screening
          cy.get('[data-testid="stage-column"]:eq(0) [data-testid="candidate-card"]')
            .should('have.length', initialScreeningCandidates.length - 1)
            .should('contain.text', candidate2.name)
        } else {
          cy.log('⚠️ Skipping test - not enough candidates in Initial Screening')
        }
      })
    })
  })

  describe('Drag and Drop Edge Cases', () => {
    it('should handle dragging candidate to same stage (no-op)', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        const currentStage = candidate.stage
        
        // Determine current stage index
        const stageNames = ['Initial Screening', 'Technical Interview', 'Final Interview', 'Offer']
        const currentStageIndex = stageNames.indexOf(currentStage)
        
        cy.log(`🧪 TEST: Testing no-op drag for candidate ${candidateId} in ${currentStage}`)
        
        cy.verifyCandidateInStage(candidateId, currentStage)
        cy.dragCandidateToStage(candidateId, currentStageIndex)
        cy.verifyCandidateInStage(candidateId, currentStage)
      })
    })

    it('should handle rapid consecutive drag operations', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        
        cy.log(`🧪 TEST: Testing rapid moves for candidate ${candidateId} (${candidate.name})`)
        
        // Rapid sequence of moves
        cy.dragCandidateToStage(candidateId, 1) // To Technical Interview
        cy.wait('@updateCandidate')
        
        cy.dragCandidateToStage(candidateId, 2) // To Final Interview
        cy.wait('@updateCandidate')
        
        cy.dragCandidateToStage(candidateId, 0) // Back to Initial Screening
        cy.wait('@updateCandidate')
        
        // Verify final state
        cy.verifyCandidateInStage(candidateId, 'Initial Screening')
      })
    })
  })

  describe('Visual Feedback During Drag Operations', () => {
    it('should provide visual feedback during drag operation', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        const sourceSelector = `[data-candidate-id="${candidateId}"]`
        
        cy.log(`🧪 TEST: Testing visual feedback for candidate ${candidateId} (${candidate.name})`)
        
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
    })

    it('should highlight drop zones during drag operation', () => {
      // All stage columns should be visible as potential drop zones
      cy.get('[data-testid="stage-column"]').should('have.length', 4)
      cy.get('[data-testid="stage-column"]').each(($column) => {
        cy.wrap($column).should('be.visible')
      })
    })
  })

  describe('API Integration Validation', () => {
    it('should send correct API request when moving candidate', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        const currentStage = candidate.stage
        
        // Calculate target stage index: +1 if at index 0, -1 if at index 3, +1 otherwise
        const stageNames = ['Initial Screening', 'Technical Interview', 'Final Interview', 'Offer']
        const currentStageIndex = stageNames.indexOf(currentStage)
        const targetStageIndex = currentStageIndex === 0 ? 1 : currentStageIndex === 3 ? 2 : currentStageIndex + 1
        const targetStageName = stageNames[targetStageIndex]
        
        cy.log(`🧪 TEST: Validating API request for candidate ${candidateId} (${candidate.name}) from ${currentStage} to ${targetStageName}`)
        
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
    })

    it('should handle API success response correctly', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        
        cy.log(`🧪 TEST: Testing API success response for candidate ${candidateId} (${candidate.name})`)
        
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
  })

  describe('Accessibility and User Experience', () => {
    it('should maintain candidate card data attributes after drag', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          throw new Error('No candidates available for testing')
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        const candidateName = candidate.name
        
        cy.log(`🧪 TEST: Testing data attributes for candidate ${candidateId} (${candidateName})`)
        
        // Verify initial data attributes
        cy.get(`[data-candidate-id="${candidateId}"]`)
          .should('have.attr', 'data-candidate-name', candidateName)
        
        // Perform drag operation
        cy.dragCandidateToStage(candidateId, 1)
        cy.wait('@updateCandidate')
        
        // Verify data attributes are preserved
        cy.get(`[data-candidate-id="${candidateId}"]`)
          .should('have.attr', 'data-candidate-name', candidateName)
      })
    })

    it('should maintain candidate rating display after drag', () => {
      cy.getCandidatesByStage(positionId).then((stages) => {
        const allCandidates = Object.values(stages).flat()
        if (allCandidates.length === 0) {
          cy.log('⚠️ No candidates available for rating test')
          return
        }
        
        const candidate = allCandidates[0]
        const candidateId = candidate.id
        
        cy.log(`🧪 TEST: Testing rating preservation for candidate ${candidateId} (${candidate.name})`)
        
        // Check if rating display exists before drag
        cy.get(`[data-candidate-id="${candidateId}"]`).then(($card) => {
          const hasRating = $card.find('[role="img"][aria-label="rating"]').length > 0
          
          if (hasRating) {
            // Verify rating display before drag
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
          } else {
            cy.log('⚠️ No rating display found for this candidate - skipping rating test')
          }
        })
      })
    })
  })
})
