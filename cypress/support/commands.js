// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

/**
 * Comando para esperar a que se carguen los datos de la página de posición
 */
Cypress.Commands.add('waitForPositionPageLoad', () => {
  cy.wait('@getInterviewFlow', { timeout: 10000 })
  cy.wait('@getCandidates', { timeout: 10000 })
  
  // Esperar a que aparezcan las columnas y candidatos
  cy.get('[data-cy="stage-column"]', { timeout: 10000 }).should('exist')
  cy.get('h2').should('be.visible') // Título de la posición
})

/**
 * Comando personalizado para verificar la estructura de una columna de etapa
 */
Cypress.Commands.add('verifyStageColumn', (columnIndex, expectedTitle, expectedCandidateCount) => {
  cy.get('[data-cy="stage-column"]').eq(columnIndex).within(() => {
    // Verificar título de la columna
    cy.get('.card-header').should('contain.text', expectedTitle)
    
    // Verificar número de candidatos si se especifica
    if (expectedCandidateCount !== undefined) {
      cy.get('[data-cy="candidate-card"]').should('have.length', expectedCandidateCount)
    }
  })
})

/**
 * Comando para realizar drag and drop con react-beautiful-dnd
 * Este es más complejo porque react-beautiful-dnd usa eventos personalizados
 */
Cypress.Commands.add('dragCandidateCard', (sourceSelector, targetColumnIndex) => {
  // Obtener el elemento fuente
  cy.get(sourceSelector).then($source => {
    const sourceElement = $source[0]
    
    // Obtener el elemento destino (la columna)
    cy.get('[data-cy="stage-column"]').eq(targetColumnIndex).find('.card-body').then($target => {
      const targetElement = $target[0]
      
      // Simular el drag and drop usando eventos de mouse
      const dataTransfer = new DataTransfer()
      
      // Evento dragstart
      sourceElement.dispatchEvent(new DragEvent('dragstart', {
        dataTransfer,
        bubbles: true
      }))
      
      // Evento dragenter en target
      targetElement.dispatchEvent(new DragEvent('dragenter', {
        dataTransfer,
        bubbles: true
      }))
      
      // Evento dragover en target
      targetElement.dispatchEvent(new DragEvent('dragover', {
        dataTransfer,
        bubbles: true
      }))
      
      // Evento drop en target
      targetElement.dispatchEvent(new DragEvent('drop', {
        dataTransfer,
        bubbles: true
      }))
      
      // Evento dragend en source
      sourceElement.dispatchEvent(new DragEvent('dragend', {
        dataTransfer,
        bubbles: true
      }))
    })
  })
})

/**
 * Comando alternativo para drag and drop usando coordenadas de mouse
 * Más compatible con react-beautiful-dnd
 */
Cypress.Commands.add('dragToColumn', (candidateSelector, targetColumnIndex) => {
  // Obtener posición del candidato
  cy.get(candidateSelector).then($candidate => {
    const candidateElement = $candidate[0]
    const candidateRect = candidateElement.getBoundingClientRect()
    
    // Obtener posición de la columna destino
    cy.get('[data-cy="stage-column"]').eq(targetColumnIndex).find('.card-body').then($targetColumn => {
      const targetElement = $targetColumn[0]
      const targetRect = targetElement.getBoundingClientRect()
      
      // Simular el arrastre paso a paso - usar first() para asegurar un solo elemento
      cy.get(candidateSelector).first()
        .trigger('mousedown', {
          button: 0,
          clientX: candidateRect.x + candidateRect.width / 2,
          clientY: candidateRect.y + candidateRect.height / 2
        })
        .wait(100)
        
      // Mover a la posición destino
      cy.get('body')
        .trigger('mousemove', {
          clientX: targetRect.x + targetRect.width / 2,
          clientY: targetRect.y + targetRect.height / 2
        })
        .wait(100)
        
      // Soltar
      cy.get('[data-cy="stage-column"]').eq(targetColumnIndex).find('.card-body')
        .trigger('mouseup')
    })
  })
})

/**
 * Comando para verificar que un candidato específico está en una columna específica
 */
Cypress.Commands.add('verifyCandidateInColumn', (candidateName, columnIndex) => {
  cy.get('[data-cy="stage-column"]').eq(columnIndex).within(() => {
    cy.contains('[data-cy="candidate-card"] .card-title', candidateName).should('exist')
  })
})

/**
 * Comando para verificar que se realizó correctamente la llamada PUT al backend
 */
Cypress.Commands.add('verifyBackendUpdate', (candidateId, expectedStep) => {
  cy.wait('@updateCandidate').then((interception) => {
    expect(interception.response.statusCode).to.eq(200)
    expect(interception.request.url).to.include(`/candidates/${candidateId}`)
    
    if (expectedStep) {
      expect(interception.request.body.currentInterviewStep).to.eq(expectedStep)
    }
  })
})

/**
 * Comando para obtener datos de candidatos desde la API
 */
Cypress.Commands.add('getCandidatesFromAPI', (positionId) => {
  return cy.request(`${Cypress.env('api_url')}/positions/${positionId}/candidates`)
    .then((response) => {
      expect(response.status).to.eq(200)
      return response.body
    })
})

/**
 * Comando para configurar datos de prueba (mock)
 */
Cypress.Commands.add('setupTestData', () => {
  // Interceptar y mockear respuestas API si es necesario
  cy.fixture('interviewFlow').then((interviewFlow) => {
    cy.intercept('GET', '**/positions/*/interviewFlow', interviewFlow).as('mockedInterviewFlow')
  })
  
  cy.fixture('candidates').then((candidates) => {
    cy.intercept('GET', '**/positions/*/candidates', candidates).as('mockedCandidates')
  })
})

