/**
 * Fixed E2E Tests for Candidate Stage Change
 * 
 * Each test is completely independent and doesn't rely on previous test state
 */

describe('Candidate Stage Change - Fixed', () => {
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
  })

  it('should move candidate from first to second column', () => {
    // Mock de candidatos - solo John Doe en "Aplicación Recibida"
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
    
    // Navegar a la página
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(3000)
    
    // Verificar estado inicial
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
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
    
    // Verificar que John Doe se movió
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Verificar que la columna original está vacía
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
  })

  it('should call API when candidate moves', () => {
    // Mock de candidatos - solo John Doe en "Aplicación Recibida"
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
    
    // Navegar a la página
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(3000)
    
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
    
    // Verificar que se llamó a la API
    cy.wait('@updateCandidateStage')
    
    // Verificar el contenido de la llamada
    cy.get('@updateCandidateStage').its('request.body').should('deep.equal', {
      applicationId: 1,
      currentInterviewStep: 2
    })
  })

  it('should handle multiple movements correctly', () => {
    // Mock de candidatos con múltiples candidatos
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
    
    // Navegar a la página
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(3000)
    
    // Verificar estado inicial
    cy.get('[data-testid="stage-column"]').eq(0) // Aplicación Recibida
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    cy.get('[data-testid="stage-column"]').eq(1) // Entrevista Inicial
      .find('[data-testid="candidate-card"]')
      .should('contain', 'Jane Smith')
    
    cy.get('[data-testid="stage-column"]').eq(2) // Entrevista Técnica
      .find('[data-testid="candidate-card"]')
      .should('contain', 'Bob Johnson')
    
    // Mover John Doe de "Aplicación Recibida" a "Entrevista Inicial"
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        // Buscar específicamente la tarjeta de John Doe
        cy.get('[data-testid="stage-column"]').eq(0)
          .find('[data-testid="candidate-card"]')
          .contains('John Doe')
          .then(($card) => {
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
    
    // Verificar que John Doe está en columna 1
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Verificar que la columna 0 está vacía
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
    
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
    
    // Verificar el estado final
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
    // Mock de candidatos con 2 candidatos en "Aplicación Recibida"
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
    }).as('getCandidates')
    
    // Navegar a la página
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
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
            source: { droppableId: droppableId0, index: 1 },
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
    // Mock de candidatos - solo John Doe
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
    
    // Navegar a la página
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(3000)
    
    // Intentar arrastrar a un área no válida
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
    // Mock de candidatos - solo John Doe
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
    
    // Navegar a la página
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(3000)
    
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
