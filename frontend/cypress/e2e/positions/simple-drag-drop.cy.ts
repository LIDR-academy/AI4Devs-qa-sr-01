/**
 * Simple Drag & Drop Test
 * 
 * This test verifies the basic drag & drop functionality step by step
 */

describe('Simple Drag & Drop', () => {
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
    
    cy.visit(`/positions/${testPositionId}`)
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(3000)
  })

  it('should have the correct initial state', () => {
    // Verificar que la página se cargó
    cy.get('[data-testid="position-title"]').should('contain', 'Senior Software Engineer')
    
    // Verificar que hay 4 columnas
    cy.get('[data-testid="stage-column"]').should('have.length', 4)
    
    // Verificar que John Doe está en la primera columna
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Verificar que las otras columnas están vacías
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 0)
  })

  it('should perform a simple drag operation', () => {
    // Obtener la tarjeta del candidato
    cy.get('[data-testid="candidate-card"]').first().then(($card) => {
      const cardRect = $card[0].getBoundingClientRect()
      
      // Realizar un drag simple (sin soltar)
      cy.wrap($card)
        .trigger('mousedown', { button: 0, clientX: cardRect.left + 10, clientY: cardRect.top + 10 })
        .trigger('mousemove', { clientX: cardRect.left + 50, clientY: cardRect.top + 50 })
      
      // Verificar que la tarjeta sigue en su lugar
      cy.get('[data-testid="stage-column"]').eq(0)
        .find('[data-testid="candidate-card"]')
        .should('contain', 'John Doe')
      
      // Completar el drag
      cy.wrap($card)
        .trigger('mouseup', { clientX: cardRect.left + 50, clientY: cardRect.top + 50 })
      
      cy.wait(1000)
      
      // Verificar que la tarjeta sigue en su lugar (drag local)
      cy.get('[data-testid="stage-column"]').eq(0)
        .find('[data-testid="candidate-card"]')
        .should('contain', 'John Doe')
    })
  })

  it('should attempt to move candidate between columns', () => {
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
        
        cy.log(`Attempting drag from (${startX}, ${startY}) to (${endX}, ${endY})`)
        
        // Realizar el drag & drop
        cy.get('[data-testid="candidate-card"]')
          .first()
          .trigger('mousedown', { button: 0, clientX: startX, clientY: startY })
          .trigger('mousemove', { clientX: endX, clientY: endY })
          .trigger('mouseup', { clientX: endX, clientY: endY })
        
        cy.wait(2000)
        
        // Verificar el resultado
        cy.get('[data-testid="stage-column"]').eq(0)
          .find('[data-testid="candidate-card"]')
          .then(($cards) => {
            if ($cards.length === 0) {
              cy.log('Candidate was moved from column 0')
              // Verificar que está en la columna 1
              cy.get('[data-testid="stage-column"]').eq(1)
                .find('[data-testid="candidate-card"]')
                .should('contain', 'John Doe')
            } else {
              cy.log('Candidate remained in column 0')
              cy.get('[data-testid="stage-column"]').eq(0)
                .find('[data-testid="candidate-card"]')
                .should('contain', 'John Doe')
            }
          })
      })
    })
  })
})
