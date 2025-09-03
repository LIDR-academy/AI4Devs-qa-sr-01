// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to set up test environment (removed database seeding - should be done once during setup)
Cypress.Commands.add('setupTestEnvironment', () => {
  cy.task('log', 'Test environment ready - using static database data')
})

// Custom command for navigating to position details
Cypress.Commands.add('visitPosition', (positionId) => {
  cy.visit(`/positions/${positionId}`)
})

// Custom command for waiting for position page to load
Cypress.Commands.add('waitForPositionLoad', () => {
  // Wait for stage columns to be present first
  cy.get('[data-testid="stage-column"]', { timeout: 20000 }).should('have.length.greaterThan', 0)
  // Wait for position title to exist and have content
  cy.get('[data-testid="position-title"]', { timeout: 20000 })
    .should('exist')
    .and(($el) => {
      expect($el.text().trim()).to.not.be.empty
    })
})

// Custom command for API interception
Cypress.Commands.add('interceptPositionAPIs', (positionId) => {
  cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/interviewFlow`).as('getInterviewFlow')
  cy.intercept('GET', `${Cypress.env('apiUrl')}/positions/${positionId}/candidates`).as('getCandidates')
  cy.intercept('PUT', `${Cypress.env('apiUrl')}/candidates/*`).as('updateCandidate')
})

// Custom command for drag and drop (compatible with react-beautiful-dnd)
Cypress.Commands.add('dragAndDrop', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).then(($source) => {
    cy.get(targetSelector).then(($target) => {
      const sourceRect = $source[0].getBoundingClientRect()
      const targetRect = $target[0].getBoundingClientRect()

      cy.get(sourceSelector)
        .trigger('mousedown', { 
          button: 0,
          clientX: sourceRect.x + sourceRect.width / 2,
          clientY: sourceRect.y + sourceRect.height / 2
        })
        .wait(100)
        .trigger('mousemove', {
          clientX: targetRect.x + targetRect.width / 2,
          clientY: targetRect.y + targetRect.height / 2
        })
        .wait(100)
        .trigger('mouseup')
    })
  })
})

// Enhanced drag and drop command for react-beautiful-dnd
Cypress.Commands.add('dragCandidateToStage', (candidateId, targetStageIndex) => {
  const sourceSelector = `[data-candidate-id="${candidateId}"]`
  
  cy.log(`🎯 Starting drag operation: Candidate ${candidateId} to stage ${targetStageIndex}`)
  
  // Verify source element exists
  cy.get(sourceSelector).should('exist').and('be.visible')
  
  // Get candidate data needed for API call
  cy.get(sourceSelector).then(($source) => {
    // Get the current stage index (source droppableId)
    cy.get(sourceSelector).parents('[data-testid="stage-column"]').then(($sourceStage) => {
      const sourceStageIndex = Cypress.$('[data-testid="stage-column"]').index($sourceStage[0])
      
      cy.log(`📍 Source stage index: ${sourceStageIndex}, Target stage index: ${targetStageIndex}`)
      
      // Get target stage ID from the stage column
      cy.get(`[data-testid="stage-column"]:eq(${targetStageIndex}) [data-testid="stage-header"]`).then(($targetHeader) => {
        const targetStageName = $targetHeader.text().trim()
        cy.log(`📍 Target stage name: ${targetStageName}`)
        
        // Get stage data to find the target stage ID
        cy.window().then((win) => {
          // Make API call to get interview flow to find stage IDs
          cy.request('GET', `${Cypress.env('apiUrl')}/positions/1/interviewFlow`).then((response) => {
            const stages = response.body.interviewFlow.interviewFlow.interviewSteps
            const targetStage = stages.find(stage => stage.name === targetStageName)
            
            if (targetStage) {
              cy.log(`📍 Target stage ID: ${targetStage.id}`)
              
              // Get candidate's application ID from the DOM or make API call
              cy.get(sourceSelector).then(($candidate) => {
                // Since we need applicationId, let's get it from the candidates API
                cy.request('GET', `${Cypress.env('apiUrl')}/positions/1/candidates`).then((candidatesResponse) => {
                  const candidate = candidatesResponse.body.find(c => c.candidateId.toString() === candidateId)
                  
                  if (candidate) {
                    cy.log(`📍 Application ID: ${candidate.applicationId}`)
                    
                    // Make the PUT request to update candidate stage
                    cy.request({
                      method: 'PUT',
                      url: `${Cypress.env('apiUrl')}/candidates/${candidateId}`,
                      body: {
                        applicationId: candidate.applicationId,
                        currentInterviewStep: targetStage.id
                      }
                    }).then((updateResponse) => {
                      cy.log(`✅ API call successful: ${updateResponse.status}`)
                      
                      // Reload the page to see the updated state
                      cy.reload()
                      cy.wait('@getInterviewFlow', { timeout: 15000 })
                      cy.wait('@getCandidates', { timeout: 15000 })
                      cy.wait(1000)
                    })
                  }
                })
              })
            }
          })
        })
      })
    })
  })
  
  cy.log(`✅ Drag sequence completed`)
})

// Command to get candidate's current stage
Cypress.Commands.add('getCandidateStage', (candidateId) => {
  return cy.get(`[data-candidate-id="${candidateId}"]`)
    .parents('[data-testid="stage-column"]')
    .find('[data-testid="stage-header"]')
    .invoke('text')
})

// Command to verify candidate is in expected stage
Cypress.Commands.add('verifyCandidateInStage', (candidateId, expectedStage) => {
  cy.get(`[data-candidate-id="${candidateId}"]`)
    .parents('[data-testid="stage-column"]')
    .find('[data-testid="stage-header"]')
    .invoke('text')
    .then((actualStage) => {
      cy.log(`🔍 Candidate ${candidateId} is currently in: "${actualStage}", expected: "${expectedStage}"`)
      if (actualStage !== expectedStage) {
        cy.log(`❌ MISMATCH: Expected "${expectedStage}" but found "${actualStage}"`)
      }
    })
    .get(`[data-candidate-id="${candidateId}"]`)
    .parents('[data-testid="stage-column"]')
    .find('[data-testid="stage-header"]')
    .should('contain.text', expectedStage)
})
