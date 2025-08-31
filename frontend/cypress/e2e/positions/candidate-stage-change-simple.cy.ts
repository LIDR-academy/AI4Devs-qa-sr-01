/**
 * Simplified Candidate Stage Change Test using Custom Commands
 * 
 * This test demonstrates the use of custom commands for drag & drop operations
 */

describe('Candidate Stage Change - Simplified', () => {
  const testPositionId = 1;
  
  beforeEach(() => {
    // Setup básico
    cy.createTestPosition()
    cy.createTestCandidate()
    
    // Mock del flujo de entrevistas
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
    
    // Mock de candidatos
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
    
    // Mock del endpoint PUT
    cy.intercept('PUT', `**/candidates/1`, {
      statusCode: 200,
      body: { message: 'Success' }
    }).as('updateCandidateStage')
    
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(2000)
  })

  afterEach(() => {
    cy.cleanupTestData()
  })

  it('should move candidate using custom drag & drop command', () => {
    // Verificar posición inicial
    cy.verifyCandidateInStage('John Doe', 'Aplicación Recibida')
    
    // Mover candidato usando comando personalizado
    cy.dragCandidateToStage('John Doe', 'Entrevista Inicial')
    
    // Esperar a que se complete la operación
    cy.wait(1000)
    
    // Verificar nueva posición
    cy.verifyCandidateInStage('John Doe', 'Entrevista Inicial')
    
    // Verificar que se llamó a la API
    cy.wait('@updateCandidateStage')
  })

  it('should move candidate through multiple stages', () => {
    // Mover de Aplicación Recibida a Entrevista Inicial
    cy.dragCandidateToStage('John Doe', 'Entrevista Inicial')
    cy.wait(1000)
    cy.verifyCandidateInStage('John Doe', 'Entrevista Inicial')
    
    // Mover de Entrevista Inicial a Entrevista Técnica
    cy.dragCandidateToStage('John Doe', 'Entrevista Técnica')
    cy.wait(1000)
    cy.verifyCandidateInStage('John Doe', 'Entrevista Técnica')
    
    // Mover de Entrevista Técnica a Oferta
    cy.dragCandidateToStage('John Doe', 'Oferta')
    cy.wait(1000)
    cy.verifyCandidateInStage('John Doe', 'Oferta')
  })

  it('should handle invalid stage names gracefully', () => {
    // Intentar mover a una etapa que no existe
    cy.dragCandidateToStage('John Doe', 'Etapa Inexistente')
    
    // Verificar que el candidato permanece en su posición original
    cy.verifyCandidateInStage('John Doe', 'Aplicación Recibida')
  })
})
