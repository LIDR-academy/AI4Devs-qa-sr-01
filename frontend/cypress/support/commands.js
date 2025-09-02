// Custom commands for the recruitment app

// Command to navigate to positions page
Cypress.Commands.add('visitPositions', () => {
  cy.visit('/positions')
})

// Command to navigate to a specific position details page
Cypress.Commands.add('visitPositionDetails', (positionId) => {
  cy.visit(`/positions/${positionId}`)
})

// Command to wait for candidate cards to load
Cypress.Commands.add('waitForCandidateCards', () => {
  cy.get('[data-testid="candidate-card"]', { timeout: 10000 }).should('exist')
})

// Command to get candidate cards in a specific stage
Cypress.Commands.add('getCandidateCardsInStage', (stageIndex) => {
  return cy.get(`[data-testid="stage-column-${stageIndex}"] [data-testid="candidate-card"]`)
})

// Command to drag and drop a candidate card using react-beautiful-dnd
Cypress.Commands.add('dragCandidateCard', (sourceStageIndex, candidateIndex, targetStageIndex) => {
  cy.get(`[data-testid="stage-column-${sourceStageIndex}"] [data-testid="candidate-card"]`)
    .eq(candidateIndex)
    .as('draggedCard')
  
  cy.get(`[data-testid="stage-column-${targetStageIndex}"]`)
    .as('targetColumn')
  
  cy.get('@draggedCard')
    .trigger('mousedown', { button: 0, force: true })
    .trigger('mousemove', { clientX: 300, clientY: 0, force: true })
    .wait(300)
    .get('@targetColumn')
    .trigger('mouseover', { force: true })
    .trigger('mouseup', { force: true })
})
