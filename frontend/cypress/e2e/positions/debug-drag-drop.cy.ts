/**
 * Debug Test for Drag & Drop
 * 
 * This test helps debug the drag & drop functionality step by step
 */

describe('Debug Drag & Drop', () => {
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
    cy.wait(3000) // Esperar más tiempo para el renderizado
  })

  it('should load the page correctly', () => {
    // Verificar que la página se carga
    cy.get('[data-testid="position-title"]').should('contain', 'Senior Software Engineer')
    
    // Verificar que hay 4 columnas de etapas
    cy.get('[data-testid="stage-column"]').should('have.length', 4)
    
    // Verificar que la primera columna tiene el título correcto
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="stage-header"]')
      .should('contain', 'Aplicación Recibida')
    
    // Verificar que hay un candidato en la primera columna
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 1)
      .and('contain', 'John Doe')
  })

  it('should have proper react-beautiful-dnd attributes', () => {
    // Verificar que las columnas tienen atributos de droppable
    cy.get('[data-testid="stage-column"]').each(($column, index) => {
      cy.wrap($column).should('have.attr', 'data-rbd-droppable-id')
      cy.log(`Column ${index} has droppable ID: ${$column.attr('data-rbd-droppable-id')}`)
    })
    
    // Verificar que las tarjetas tienen atributos de draggable
    cy.get('[data-testid="candidate-card"]').each(($card, index) => {
      cy.wrap($card).should('have.attr', 'data-rbd-draggable-id')
      cy.log(`Card ${index} has draggable ID: ${$card.attr('data-rbd-draggable-id')}`)
    })
  })

  it('should attempt basic drag operation', () => {
    // Obtener la tarjeta del candidato
    cy.get('[data-testid="candidate-card"]').first().then(($card) => {
      const cardRect = $card[0].getBoundingClientRect()
      cy.log(`Card position: ${cardRect.left}, ${cardRect.top}`)
      
      // Intentar un drag simple
      cy.wrap($card)
        .trigger('mousedown', { button: 0, clientX: cardRect.left + 10, clientY: cardRect.top + 10 })
        .trigger('mousemove', { clientX: cardRect.left + 50, clientY: cardRect.top + 50 })
        .trigger('mouseup', { clientX: cardRect.left + 50, clientY: cardRect.top + 50 })
      
      cy.wait(1000)
      
      // Verificar que la tarjeta sigue en su lugar (drag local)
      cy.get('[data-testid="stage-column"]').eq(0)
        .find('[data-testid="candidate-card"]')
        .should('contain', 'John Doe')
    })
  })

  it('should show page structure', () => {
    // Log de la estructura de la página para debugging
    cy.get('body').then(($body) => {
      cy.log('Page HTML structure:')
      cy.log($body.html())
    })
    
    // Verificar que no hay errores en la consola
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError')
    })
    
    // Esperar un poco y verificar que no hay errores
    cy.wait(1000)
    cy.get('@consoleError').should('not.be.called')
  })
})
