describe('Position Page', () => {
  const mockPositionName = 'Software Engineer'
  const mockStages = [
    { id: 1, name: 'Initial Screening' },
    { id: 2, name: 'Technical Interview' },
    { id: 3, name: 'Manager Interview' }
  ]
  const mockCandidates = [
    {
      candidateId: 1,
      fullName: 'John Doe',
      averageScore: 4,
      applicationId: 1,
      currentInterviewStep: 'Initial Screening'
    },
    {
      candidateId: 2,
      fullName: 'Jane Smith',
      averageScore: 3,
      applicationId: 3,
      currentInterviewStep: 'Technical Interview'
    }
  ]

  beforeEach(() => {
    // Intercept API calls to provide mock data
    cy.intercept('GET', 'http://localhost:3010/positions/*/interviewFlow', {
      statusCode: 200,
      body: {
        interviewFlow: {
          interviewFlow: {
            interviewSteps: mockStages
          },
          positionName: mockPositionName
        }
      }
    }).as('getInterviewFlow')

    cy.intercept('GET', 'http://localhost:3010/positions/*/candidates', {
      statusCode: 200,
      body: mockCandidates
    }).as('getCandidates')
  })

  it('should display position page with correct title and phase columns', () => {
    // Navigate to position details page
    cy.visitPositionDetails(1)

    // Wait for API calls to complete
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')

    // Assert page title is correct
    cy.get('[data-testid="position-title"]')
      .should('be.visible')
      .and('have.text', mockPositionName)

    // Assert all phase columns are visible
    cy.get('[data-testid="stage-column-0"]').should('be.visible')
    cy.get('[data-testid="stage-column-1"]').should('be.visible')
    cy.get('[data-testid="stage-column-2"]').should('be.visible')

    // Assert phase column titles
    cy.get('[data-testid="stage-title-0"]').should('have.text', mockStages[0].name)
    cy.get('[data-testid="stage-title-1"]').should('have.text', mockStages[1].name)
    cy.get('[data-testid="stage-title-2"]').should('have.text', mockStages[2].name)
  })

  it('should display candidate cards in the correct columns', () => {
    // Navigate to position details page
    cy.visitPositionDetails(1)

    // Wait for API calls to complete
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')

    // Wait for candidate cards to load
    cy.waitForCandidateCards()

    // Assert candidate cards are displayed in the correct column
    // John Doe should be in "Initial Screening" column (index 0)
    cy.get('[data-testid="stage-column-0"]')
      .find('[data-testid="candidate-card"]')
      .should('contain', mockCandidates[0].fullName)

    // Jane Smith should be in "Technical Interview" column (index 1)
    cy.get('[data-testid="stage-column-1"]')
      .find('[data-testid="candidate-card"]')
      .should('contain', mockCandidates[1].fullName)

    // Assert candidate ratings are displayed
    cy.get('[data-testid="stage-column-0"] [data-testid="candidate-card"]')
      .find('[role="img"]')
      .should('have.length', mockCandidates[0].averageScore) // John Doe has rating 4

    cy.get('[data-testid="stage-column-1"] [data-testid="candidate-card"]')
      .find('[role="img"]')
      .should('have.length', mockCandidates[1].averageScore) // Jane Smith has rating 3
  })
})
