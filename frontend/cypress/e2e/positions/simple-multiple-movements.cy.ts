/**
 * Simple Test for Multiple Candidate Movements
 * 
 * This test verifies that multiple candidates can be moved between stages
 */

describe('Simple Multiple Movements', () => {
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
    
    // Mock del endpoint PUT
    cy.intercept('PUT', `**/candidates/1`, {
      statusCode: 200,
      body: { message: 'Success' }
    }).as('updateCandidateStage')
  })

  it('should move two candidates to different stages', () => {
    // Mock de candidatos - 2 candidatos en "Aplicación Recibida"
    cy.intercept('GET', `**/positions/${testPositionId}/candidates`, {
      statusCode: 200,
      body: [
        {
          candidateId: 1,
          fullName: 'John Doe',
          averageScore: 4,
          applicationId: 1,
          currentInterviewStep: 'Aplicación Recibida'
        },
        {
          candidateId: 2,
          fullName: 'Jane Smith',
          averageScore: 5,
          applicationId: 2,
          currentInterviewStep: 'Aplicación Recibida'
        }
      ]
    }).as('getCandidates')
    
    // Navegar a la página
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(3000)
    
    // Verificar estado inicial - 2 candidatos en columna 0
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 2)
    
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
    
    // Mover John Doe a "Entrevista Inicial"
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        // Buscar John Doe específicamente
        cy.get('[data-testid="stage-column"]').eq(0)
          .find('[data-testid="candidate-card"]')
          .contains('John Doe')
          .then(($card) => {
            const draggableId = $card.attr('data-rbd-draggable-id')
            
            const result = {
              draggableId: draggableId,
              type: 'DEFAULT',
              source: { droppableId: droppableId0, index: 0 },
              destination: { droppableId: droppableId1, index: 0 },
              reason: 'DROP'
            }
            
            cy.window().then((win) => {
              win.onDragEnd(result)
            })
          })
      })
    })
    
    cy.wait(3000)
    
    // Verificar que John Doe está en columna 1
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Verificar que Jane Smith sigue en columna 0
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'Jane Smith')
    
    // Verificar que hay 1 candidato en cada columna
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 1)
    
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 1)
    
    // Mover Jane Smith a "Entrevista Inicial" también
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        // Buscar Jane Smith
        cy.get('[data-testid="stage-column"]').eq(0)
          .find('[data-testid="candidate-card"]')
          .contains('Jane Smith')
          .then(($card) => {
            const draggableId = $card.attr('data-rbd-draggable-id')
            
            const result = {
              draggableId: draggableId,
              type: 'DEFAULT',
              source: { droppableId: droppableId0, index: 0 },
              destination: { droppableId: droppableId1, index: 1 }, // Segundo lugar en la columna
              reason: 'DROP'
            }
            
            cy.window().then((win) => {
              win.onDragEnd(result)
            })
          })
      })
    })
    
    cy.wait(3000)
    
    // Verificar estado final
    cy.get('[data-testid="stage-column"]').eq(0) // Aplicación Recibida
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
    
    cy.get('[data-testid="stage-column"]').eq(1) // Entrevista Inicial
      .find('[data-testid="candidate-card"]')
      .should('have.length', 2)
      .and('contain', 'John Doe')
      .and('contain', 'Jane Smith')
  })
})
