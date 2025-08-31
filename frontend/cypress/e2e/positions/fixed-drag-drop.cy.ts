/**
 * Fixed Drag & Drop Test
 * 
 * This test uses the correct approach to test react-beautiful-dnd
 */

describe('Fixed Drag & Drop', () => {
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

  it('should move candidate from first to second column using proper drag & drop', () => {
    // Verificar estado inicial
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
    
    // Obtener información de las columnas
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      cy.log(`Column 0 droppable ID: ${droppableId0}`)
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        cy.log(`Column 1 droppable ID: ${droppableId1}`)
        
        // Obtener información de la tarjeta
        cy.get('[data-testid="candidate-card"]').first().then(($card) => {
          const draggableId = $card.attr('data-rbd-draggable-id')
          cy.log(`Card draggable ID: ${draggableId}`)
          
          // Simular el drag & drop usando la API de react-beautiful-dnd
          // Esto simula exactamente lo que hace react-beautiful-dnd internamente
          cy.window().then((win) => {
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
            
            cy.log('Simulating drag & drop with result:', result)
            
            // Llamar directamente a onDragEnd
            // Necesitamos acceder al componente React
            cy.get('[data-testid="stage-column"]').eq(0).then(() => {
              // Simular el drag & drop disparando el evento onDragEnd
              // Esto es más confiable que simular eventos del mouse
              cy.get('body').then(($body) => {
                // Crear y disparar un evento personalizado que el componente pueda escuchar
                const dragEndEvent = new CustomEvent('dragEnd', { detail: result })
                $body[0].dispatchEvent(dragEndEvent)
                
                // Alternativa: usar la API de react-beautiful-dnd directamente
                // Esto requiere que el componente exponga la función onDragEnd
                cy.window().then((win) => {
                  // Intentar acceder a la función onDragEnd del componente
                  if (win.onDragEnd) {
                    win.onDragEnd(result)
                  } else {
                    // Si no está disponible, usar el enfoque alternativo
                    cy.log('onDragEnd not available, using alternative approach')
                  }
                })
              })
            })
          })
        })
      })
    })
    
    // Esperar a que se complete la operación
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

  it('should call API when candidate moves', () => {
    // Obtener información de las columnas
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        // Obtener información de la tarjeta
        cy.get('[data-testid="candidate-card"]').first().then(($card) => {
          const draggableId = $card.attr('data-rbd-draggable-id')
          
          // Simular el drag & drop
          cy.window().then((win) => {
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
            
            // Llamar a onDragEnd directamente
            if (win.onDragEnd) {
              win.onDragEnd(result)
            }
          })
        })
      })
    })
    
    // Esperar a que se complete la operación
    cy.wait(2000)
    
    // Verificar que se llamó a la API
    cy.wait('@updateCandidateStage')
    
    // Verificar el contenido de la llamada
    cy.get('@updateCandidateStage').its('request.body').should('deep.equal', {
      applicationId: 1,
      currentInterviewStep: 2
    })
  })

  it('should handle multiple movements correctly', () => {
    // Mover de columna 0 a columna 1
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const droppableId0 = $col0.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const droppableId1 = $col1.attr('data-rbd-droppable-id')
        
        cy.get('[data-testid="candidate-card"]').first().then(($card) => {
          const draggableId = $card.attr('data-rbd-draggable-id')
          
          // Primera movida
          cy.window().then((win) => {
            const result1 = {
              draggableId: draggableId,
              type: 'DEFAULT',
              source: { droppableId: droppableId0, index: 0 },
              destination: { droppableId: droppableId1, index: 0 },
              reason: 'DROP'
            }
            
            if (win.onDragEnd) {
              win.onDragEnd(result1)
            }
          })
        })
      })
    })
    
    cy.wait(2000)
    
    // Verificar que está en columna 1
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Mover de columna 1 a columna 2
    cy.get('[data-testid="stage-column"]').eq(2).then(($col2) => {
      const droppableId2 = $col2.attr('data-rbd-droppable-id')
      
      cy.get('[data-testid="candidate-card"]').first().then(($card) => {
        const draggableId = $card.attr('data-rbd-draggable-id')
        
        // Segunda movida
        cy.window().then((win) => {
          const result2 = {
            draggableId: draggableId,
            type: 'DEFAULT',
            source: { droppableId: 'stage-2', index: 0 }, // Columna 1
            destination: { droppableId: droppableId2, index: 0 },
            reason: 'DROP'
          }
          
          if (win.onDragEnd) {
            win.onDragEnd(result2)
          }
        })
      })
    })
    
    cy.wait(2000)
    
    // Verificar que está en columna 2
    cy.get('[data-testid="stage-column"]').eq(2)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
  })
})
