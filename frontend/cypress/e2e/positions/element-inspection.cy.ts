/**
 * Element Inspection Test
 * 
 * This test inspects all elements on the page to understand what's actually rendered
 */

describe('Element Inspection', () => {
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
    cy.wait(5000) // Esperar más tiempo
  })

  it('should inspect all elements on the page', () => {
    // Log de toda la página
    cy.get('body').then(($body) => {
      cy.log('=== FULL PAGE HTML ===')
      cy.log($body.html())
    })
    
    // Verificar elementos básicos
    cy.get('h2').then(($h2s) => {
      cy.log(`Found ${$h2s.length} h2 elements:`)
      $h2s.each((i, el) => {
        cy.log(`H2 ${i}: ${el.textContent}`)
      })
    })
    
    // Verificar columnas
    cy.get('[data-testid="stage-column"]').then(($columns) => {
      cy.log(`Found ${$columns.length} stage columns:`)
      $columns.each((i, col) => {
        cy.log(`Column ${i}: ${col.outerHTML}`)
      })
    })
    
    // Verificar tarjetas de candidatos
    cy.get('[data-testid="candidate-card"]').then(($cards) => {
      cy.log(`Found ${$cards.length} candidate cards:`)
      $cards.each((i, card) => {
        cy.log(`Card ${i}: ${card.outerHTML}`)
      })
    })
    
    // Verificar todos los elementos con data-testid
    cy.get('[data-testid]').then(($elements) => {
      cy.log(`Found ${$elements.length} elements with data-testid:`)
      $elements.each((i, el) => {
        const testId = el.getAttribute('data-testid')
        const tagName = el.tagName
        const text = el.textContent?.substring(0, 100) || 'No text'
        cy.log(`Element ${i}: ${tagName}[data-testid="${testId}"] - "${text}"`)
      })
    })
    
    // Verificar elementos de react-beautiful-dnd
    cy.get('[data-rbd-droppable-id]').then(($droppables) => {
      cy.log(`Found ${$droppables.length} droppable elements:`)
      $droppables.each((i, el) => {
        const id = el.getAttribute('data-rbd-droppable-id')
        cy.log(`Droppable ${i}: ${id}`)
      })
    })
    
    cy.get('[data-rbd-draggable-id]').then(($draggables) => {
      cy.log(`Found ${$draggables.length} draggable elements:`)
      $draggables.each((i, el) => {
        const id = el.getAttribute('data-rbd-draggable-id')
        cy.log(`Draggable ${i}: ${id}`)
      })
    })
    
    // Verificar estructura de Bootstrap
    cy.get('.col-md-3').then(($cols) => {
      cy.log(`Found ${$cols.length} Bootstrap columns`)
    })
    
    cy.get('.card').then(($cards) => {
      cy.log(`Found ${$cards.length} Bootstrap cards`)
    })
  })

  it('should check for console errors', () => {
    // Verificar errores en la consola
    cy.window().then((win) => {
      cy.spy(win.console, 'error').as('consoleError')
      cy.spy(win.console, 'warn').as('consoleWarn')
    })
    
    // Esperar y verificar
    cy.wait(2000)
    cy.get('@consoleError').should('not.be.called')
    cy.get('@consoleWarn').should('not.be.called')
  })

  it('should verify data flow', () => {
    // Verificar que los datos se cargaron correctamente
    cy.get('[data-testid="position-title"]').should('contain', 'Senior Software Engineer')
    
    // Verificar que hay columnas
    cy.get('[data-testid="stage-column"]').should('have.length.at.least', 1)
    
    // Verificar que hay candidatos
    cy.get('[data-testid="candidate-card"]').should('have.length.at.least', 1)
  })
})
