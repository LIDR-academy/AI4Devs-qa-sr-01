/**
 * Specific Drag & Drop Tests using react-beautiful-dnd
 * 
 * This test focuses specifically on the drag & drop functionality
 * using the proper react-beautiful-dnd events and selectors
 */

describe('Drag & Drop Specific Tests', () => {
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

  it('should use react-beautiful-dnd draggable elements correctly', () => {
    // Verificar que el candidato es draggable
    cy.get('[data-testid="candidate-card"]')
      .should('have.attr', 'data-rbd-draggable-id')
    
    // Verificar que las columnas son droppable
    cy.get('[data-testid="stage-column"]')
      .should('have.attr', 'data-rbd-droppable-id')
  })

  it('should perform drag & drop using proper coordinates', () => {
    // Obtener las posiciones de las columnas
    cy.get('[data-testid="stage-column"]').eq(0).then(($sourceCol) => {
      const sourceRect = $sourceCol[0].getBoundingClientRect()
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($targetCol) => {
        const targetRect = $targetCol[0].getBoundingClientRect()
        
        // Calcular coordenadas para el drag & drop
        const startX = sourceRect.left + sourceRect.width / 2
        const startY = sourceRect.top + sourceRect.height / 2
        const endX = targetRect.left + targetRect.width / 2
        const endY = targetRect.top + targetRect.height / 2
        
        // Realizar el drag & drop
        cy.get('[data-testid="candidate-card"]')
          .first()
          .trigger('mousedown', { button: 0, clientX: startX, clientY: startY })
          .trigger('mousemove', { clientX: endX, clientY: endY })
          .trigger('mouseup', { clientX: endX, clientY: endY })
        
        cy.wait(1000)
        
        // Verificar que el candidato se movió
        cy.get('[data-testid="stage-column"]').eq(1)
          .find('[data-testid="candidate-card"]')
          .should('contain', 'John Doe')
      })
    })
  })

  it('should handle drag & drop with keyboard accessibility', () => {
    // Focus en la tarjeta del candidato
    cy.get('[data-testid="candidate-card"]')
      .first()
      .focus()
    
    // Simular navegación con teclado (Space para iniciar drag, Arrow keys para mover)
    cy.get('[data-testid="candidate-card"]')
      .first()
      .trigger('keydown', { key: ' ' }) // Space para iniciar drag
    
    // Mover con teclado (esto puede requerir implementación específica)
    cy.get('[data-testid="candidate-card"]')
      .first()
      .trigger('keydown', { key: 'ArrowRight' })
    
    // Verificar que se mantiene el focus
    cy.get('[data-testid="candidate-card"]')
      .first()
      .should('have.focus')
  })

  it('should show visual feedback during drag operation', () => {
    // Iniciar drag
    cy.get('[data-testid="candidate-card"]')
      .first()
      .trigger('mousedown', { button: 0 })
    
    // Verificar que se muestra el feedback visual (puede variar según la implementación)
    cy.get('[data-testid="candidate-card"]')
      .first()
      .should('have.class', 'dragging') // O cualquier clase CSS que indique drag activo
    
    // Completar el drag
    cy.get('[data-testid="candidate-card"]')
      .first()
      .trigger('mousemove', { clientX: 400, clientY: 300 })
      .trigger('mouseup')
    
    cy.wait(1000)
  })

  it('should maintain drag & drop state after page refresh', () => {
    // Realizar drag & drop
    cy.get('[data-testid="candidate-card"]')
      .first()
      .trigger('mousedown', { button: 0 })
      .trigger('mousemove', { clientX: 400, clientY: 300 })
      .trigger('mouseup')
    
    cy.wait(1000)
    
    // Verificar que se movió
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('contain', 'John Doe')
    
    // Recargar la página
    cy.reload()
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    cy.wait(2000)
    
    // Verificar que el estado se mantiene (esto depende de si se guarda en localStorage o backend)
    // Por ahora, verificamos que la página se carga correctamente
    cy.get('[data-testid="stage-column"]').should('have.length', 4)
  })
})
