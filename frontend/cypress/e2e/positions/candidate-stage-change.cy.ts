/**
 * E2E Tests for Candidate Stage Change
 * 
 * This test verifies the drag & drop functionality for changing candidate stages:
 * 1. Drag a candidate card from one column to another
 * 2. Verify the card moves to the new column
 * 3. Verify the backend API is called correctly
 */

describe('Candidate Stage Change', () => {
  const testPositionId = 1;
  
  beforeEach(() => {
    // Mock de la respuesta del flujo de entrevistas
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
    
    // Mock de la respuesta de candidatos - John Doe en "Aplicación Recibida"
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
          currentInterviewStep: 'Entrevista Inicial'
        },
        {
          candidateId: 3,
          fullName: 'Bob Johnson',
          averageScore: 3,
          applicationId: 3,
          currentInterviewStep: 'Entrevista Técnica'
        }
      ]
    }).as('getCandidates')
    
    // Mock del endpoint PUT para actualizar la fase del candidato
    cy.intercept('PUT', `**/candidates/1`, {
      statusCode: 200,
      body: {
        message: 'Candidate stage updated successfully',
        data: {
          id: 1,
          positionId: testPositionId,
          candidateId: 1,
          applicationDate: '2024-01-15T10:00:00Z',
          currentInterviewStep: 2, // Nueva fase: Entrevista Inicial
          notes: null,
          interviews: []
        }
      }
    }).as('updateCandidateStage')
    
    // Navegar a la página de detalles de la posición
    cy.visit(`/positions/${testPositionId}`)
    
    // Esperar a que se carguen las respuestas de la API
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    
    // Esperar a que la página se renderice completamente
    cy.wait(3000)
  })

  it('should allow dragging a candidate card between stages', () => {
    // Verificar que John Doe está inicialmente en "Aplicación Recibida"
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Verificar que la columna "Entrevista Inicial" no tiene candidatos
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
    
    // Obtener los IDs de las columnas
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        // Obtener el ID de la tarjeta
        cy.get('[data-testid="candidate-card"]').first().then(($card) => {
          const draggableId = $card.attr('data-rbd-draggable-id')
          
          // Crear el objeto result que espera onDragEnd
          const result = {
            draggableId: draggableId,
            type: 'DEFAULT',
            source: {
              droppableId: droppableId0,
              index: 0
            },
            destination: {
              droppableId: droppableId1,
              index: 0
            },
            reason: 'DROP'
          }
          
          // Llamar a la función onDragEnd expuesta globalmente
          cy.window().then((win) => {
            win.onDragEnd(result)
          })
        })
      })
    })
    
    // Esperar a que se complete la operación
    cy.wait(3000)
    
    // Verificar que John Doe se movió a "Entrevista Inicial"
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Verificar que "Aplicación Recibida" ya no tiene candidatos
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
  })

  it('should call the backend API when candidate stage changes', () => {
    // Obtener los IDs de las columnas
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        // Obtener el ID de la tarjeta
        cy.get('[data-testid="candidate-card"]').first().then(($card) => {
          const draggableId = $card.attr('data-rbd-draggable-id')
          
          // Crear el objeto result
          const result = {
            draggableId: draggableId,
            type: 'DEFAULT',
            source: {
              droppableId: droppableId0,
              index: 0
            },
            destination: {
              droppableId: droppableId1,
              index: 0
            },
            reason: 'DROP'
          }
          
          // Llamar a onDragEnd
          cy.window().then((win) => {
            win.onDragEnd(result)
          })
        })
      })
    })
    
    // Esperar a que se complete la operación
    cy.wait(3000)
    
    // Verificar que se llamó al endpoint PUT /candidates/:id
    cy.wait('@updateCandidateStage')
    
    // Verificar que la llamada a la API tiene los datos correctos
    cy.get('@updateCandidateStage').its('request.body').should('deep.equal', {
      applicationId: 1,
      currentInterviewStep: 2 // ID de la nueva fase
    })
  })

  it('should handle multiple candidate movements correctly', () => {
    // Mover John Doe de "Aplicación Recibida" a "Entrevista Inicial"
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        cy.get('[data-testid="candidate-card"]').first().then(($card) => {
          const draggableId = $card.attr('data-rbd-draggable-id')
          
          const result1 = {
            draggableId: draggableId,
            type: 'DEFAULT',
            source: { droppableId: droppableId0, index: 0 },
            destination: { droppableId: droppableId1, index: 0 },
            reason: 'DROP'
          }
          
          cy.window().then((win) => {
            win.onDragEnd(result1)
          })
        })
      })
    })
    
    cy.wait(3000)
    
    // Verificar que está en columna 1
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Mover Jane Smith de "Entrevista Inicial" a "Entrevista Técnica"
    cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
      const droppableId1 = $col1.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(2).then(($col2) => {
        const droppableId2 = $col2.attr('data-rbd-droppable-id')
        
        // Buscar Jane Smith en la columna 1
        cy.get('[data-testid="stage-column"]').eq(1)
          .find('[data-testid="candidate-card"]')
          .contains('Jane Smith')
          .then(($card) => {
            const draggableId = $card.attr('data-rbd-draggable-id')
            
            const result2 = {
              draggableId: draggableId,
              type: 'DEFAULT',
              source: { droppableId: droppableId1, index: 0 },
              destination: { droppableId: droppableId2, index: 0 },
              reason: 'DROP'
            }
            
            cy.window().then((win) => {
              win.onDragEnd(result2)
            })
          })
      })
    })
    
    cy.wait(3000)
    
    // Verificar el estado final de las columnas
    cy.get('[data-testid="stage-column"]').eq(0) // Aplicación Recibida
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
    
    cy.get('[data-testid="stage-column"]').eq(1) // Entrevista Inicial
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    cy.get('[data-testid="stage-column"]').eq(2) // Entrevista Técnica
      .find('[data-testid="candidate-card"]')
      .should('contain', 'Jane Smith')
      .and('contain', 'Bob Johnson')
  })

  it('should maintain candidate order within columns', () => {
    // Agregar un candidato más a "Aplicación Recibida" para probar el orden
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
          candidateId: 4,
          fullName: 'Alice Brown',
          averageScore: 5,
          applicationId: 4,
          currentInterviewStep: 'Aplicación Recibida'
        }
      ]
    }).as('getCandidatesUpdated')
    
    cy.reload()
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidatesUpdated')
    cy.wait(3000)
    
    // Verificar que hay 2 candidatos en "Aplicación Recibida"
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 2)
    
    // Mover Alice Brown a "Entrevista Inicial"
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        cy.get('[data-testid="candidate-card"]').eq(1).then(($card) => {
          const draggableId = $card.attr('data-rbd-draggable-id')
          
          const result = {
            draggableId: draggableId,
            type: 'DEFAULT',
            source: { droppableId: droppableId0, index: 1 }, // Alice Brown (segundo candidato)
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
    
    // Verificar que Alice Brown está en "Entrevista Inicial"
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'Alice Brown')
    
    // Verificar que John Doe sigue en "Aplicación Recibida"
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
  })

  it('should handle invalid drag operations gracefully', () => {
    // Intentar arrastrar a un área no válida (fuera de las columnas)
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="candidate-card"]').first().then(($card) => {
        const draggableId = $card.attr('data-rbd-draggable-id')
        
        // Crear un result sin destination (operación inválida)
        const result = {
          draggableId: draggableId,
          type: 'DEFAULT',
          source: {
            droppableId: droppableId0,
            index: 0
          },
          destination: null, // Sin destino = operación inválida
          reason: 'DROP'
        }
        
        // Llamar a onDragEnd
        cy.window().then((win) => {
          win.onDragEnd(result)
        })
      })
    })
    
    cy.wait(3000)
    
    // Verificar que el candidato permanece en su posición original
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Verificar que no se llamó al endpoint de actualización
    cy.get('@updateCandidateStage').should('not.exist')
  })

  it('should update the UI immediately after successful drag & drop', () => {
    // Obtener los IDs de las columnas
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        // Obtener el ID de la tarjeta
        cy.get('[data-testid="candidate-card"]').first().then(($card) => {
          const draggableId = $card.attr('data-rbd-draggable-id')
          
          // Crear el objeto result
          const result = {
            draggableId: draggableId,
            type: 'DEFAULT',
            source: {
              droppableId: droppableId0,
              index: 0
            },
            destination: {
              droppableId: droppableId1,
              index: 0
            },
            reason: 'DROP'
          }
          
          // Llamar a onDragEnd
          cy.window().then((win) => {
            win.onDragEnd(result)
          })
        })
      })
    })
    
    // Esperar a que se complete la operación
    cy.wait(3000)
    
    // Verificar que la UI se actualiza inmediatamente
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
      .and('be.visible')
    
    // Verificar que la columna original está vacía
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
  })
})
