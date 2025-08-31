/**
 * Working Drag & Drop Test
 * 
 * This test verifies that drag & drop works correctly between columns
 */

describe('Working Drag & Drop', () => {
  const testPositionId = 1;
  
  beforeEach(() => {
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
    cy.wait(3000)
  })

  it('should move candidate from first to second column', () => {
    // Verificar estado inicial
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
    
    // Obtener las posiciones de las columnas
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const col0Rect = $col0[0].getBoundingClientRect()
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const col1Rect = $col1[0].getBoundingClientRect()
        
        // Calcular coordenadas para el drag & drop
        const startX = col0Rect.left + col0Rect.width / 2
        const startY = col0Rect.top + col0Rect.height / 2
        const endX = col1Rect.left + col1Rect.width / 2
        const endY = col1Rect.top + col1Rect.height / 2
        
        cy.log(`Drag from: (${startX}, ${startY}) to (${endX}, ${endY})`)
        
        // Realizar el drag & drop
        cy.get('[data-testid="candidate-card"]')
          .first()
          .trigger('mousedown', { button: 0, clientX: startX, clientY: startY })
          .trigger('mousemove', { clientX: endX, clientY: endY })
          .trigger('mouseup', { clientX: endX, clientY: endY })
        
        cy.wait(2000)
        
        // Verificar que el candidato se movió
        cy.get('[data-testid="stage-column"]').eq(1)
          .find('[data-testid="candidate-card"]')
          .should('contain', 'John Doe')
        
        // Verificar que la columna original está vacía
        cy.get('[data-testid="stage-column"]').eq(0)
          .find('[data-testid="candidate-card"]')
          .should('have.length', 0)
      })
    })
  })

  it('should call API when candidate moves', () => {
    // Obtener las posiciones de las columnas
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const col0Rect = $col0[0].getBoundingClientRect()
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const col1Rect = $col1[0].getBoundingClientRect()
        
        // Calcular coordenadas
        const startX = col0Rect.left + col0Rect.width / 2
        const startY = col0Rect.top + col0Rect.height / 2
        const endX = col1Rect.left + col1Rect.width / 2
        const endY = col1Rect.top + col1Rect.height / 2
        
        // Realizar el drag & drop
        cy.get('[data-testid="candidate-card"]')
          .first()
          .trigger('mousedown', { button: 0, clientX: startX, clientY: startY })
          .trigger('mousemove', { clientX: endX, clientY: endY })
          .trigger('mouseup', { clientX: endX, clientY: endY })
        
        cy.wait(2000)
        
        // Verificar que se llamó a la API
        cy.wait('@updateCandidateStage')
        
        // Verificar el contenido de la llamada
        cy.get('@updateCandidateStage').its('request.body').should('deep.equal', {
          applicationId: 1,
          currentInterviewStep: 2
        })
      })
    })
  })
})
