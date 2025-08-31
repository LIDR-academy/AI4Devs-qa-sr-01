/**
 * Test for Drag & Drop Between Columns
 * 
 * This test specifically tests moving candidates between different stage columns
 */

describe('Drag & Drop Between Columns', () => {
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
    cy.get('[data-testid="stage-column"]').eq(0).then(($sourceCol) => {
      const sourceRect = $sourceCol[0].getBoundingClientRect()
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($targetCol) => {
        const targetRect = $targetCol[0].getBoundingClientRect()
        
        // Calcular coordenadas para el drag & drop
        const startX = sourceRect.left + sourceRect.width / 2
        const startY = sourceRect.top + sourceRect.height / 2
        const endX = targetRect.left + targetRect.width / 2
        const endY = targetRect.top + targetRect.height / 2
        
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
    cy.get('[data-testid="stage-column"]').eq(0).then(($sourceCol) => {
      const sourceRect = $sourceCol[0].getBoundingClientRect()
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($targetCol) => {
        const targetRect = $targetCol[0].getBoundingClientRect()
        
        // Calcular coordenadas
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

  it('should handle multiple movements', () => {
    // Mover de columna 0 a columna 1
    cy.get('[data-testid="stage-column"]').eq(0).then(($col0) => {
      const rect0 = $col0[0].getBoundingClientRect()
      
      cy.get('[data-testid="stage-column"]').eq(1).then(($col1) => {
        const rect1 = $col1[0].getBoundingClientRect()
        
        // Drag & drop a columna 1
        cy.get('[data-testid="candidate-card"]')
          .first()
          .trigger('mousedown', { button: 0, clientX: rect0.left + rect0.width / 2, clientY: rect0.top + rect0.height / 2 })
          .trigger('mousemove', { clientX: rect1.left + rect1.width / 2, clientY: rect1.top + rect1.height / 2 })
          .trigger('mouseup', { clientX: rect1.left + rect1.width / 2, clientY: rect1.top + rect1.height / 2 })
        
        cy.wait(2000)
        
        // Verificar que está en columna 1
        cy.get('[data-testid="stage-column"]').eq(1)
          .find('[data-testid="candidate-card"]')
          .should('contain', 'John Doe')
        
        // Mover de columna 1 a columna 2
        cy.get('[data-testid="stage-column"]').eq(2).then(($col2) => {
          const rect2 = $col2[0].getBoundingClientRect()
          
          cy.get('[data-testid="candidate-card"]')
            .first()
            .trigger('mousedown', { button: 0, clientX: rect1.left + rect1.width / 2, clientY: rect1.top + rect1.height / 2 })
            .trigger('mousemove', { clientX: rect2.left + rect2.width / 2, clientY: rect2.top + rect2.height / 2 })
            .trigger('mouseup', { clientX: rect2.left + rect2.width / 2, clientY: rect2.top + rect2.height / 2 })
          
          cy.wait(2000)
          
          // Verificar que está en columna 2
          cy.get('[data-testid="stage-column"]').eq(2)
            .find('[data-testid="candidate-card"]')
            .should('contain', 'John Doe')
        })
      })
    })
  })
})
