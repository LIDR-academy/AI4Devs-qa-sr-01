/**
 * Basic test to debug Position Details page loading
 */

describe('Position Details Basic Loading', () => {
  const testPositionId = 1;
  
  beforeEach(() => {
    // Simple mock for interview flow
    cy.intercept('GET', `**/positions/${testPositionId}/interviewFlow`, {
      statusCode: 200,
      body: {
        interviewFlow: {
          interviewFlow: {
            interviewSteps: [
              { id: 1, name: 'Aplicación Recibida' },
              { id: 2, name: 'Entrevista Inicial' },
              { id: 3, name: 'Entrevista Técnica' },
              { id: 4, name: 'Oferta' }
            ]
          },
          positionName: 'Senior Software Engineer'
        }
      }
    }).as('getInterviewFlow')
    
    // Simple mock for candidates
    cy.intercept('GET', `**/positions/${testPositionId}/candidates`, {
      statusCode: 200,
      body: [
        {
          candidateId: 1,
          fullName: 'John Doe',
          averageScore: 4,
          applicationId: 1,
          currentInterviewStep: 'Aplicación Recibida'
        }
      ]
    }).as('getCandidates')
    
    // Visit the page
    cy.visit(`/positions/${testPositionId}`)
    
    // Wait for API calls
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    
    // Wait for rendering
    cy.wait(2000)
  })

  it('should load the page and show basic elements', () => {
    // Check if page loads
    cy.get('body').should('be.visible')
    
    // Check if title exists (even if not visible)
    cy.get('h2').should('exist')
    
    // Check if any content is loaded
    cy.get('h2').should('contain', 'Senior Software Engineer')
    
    // Check if columns are created
    cy.get('.col-md-3').should('have.length.at.least', 1)
    
    // Check if cards exist
    cy.get('.card').should('have.length.at.least', 4)
  })

  it('should show navigation button', () => {
    cy.get('[data-testid="back-to-positions-button"]')
      .should('exist')
      .and('contain', 'Volver a Posiciones')
  })
})
