// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Comando personalizado para esperar que la aplicación esté lista
Cypress.Commands.add('waitForApp', () => {
  cy.intercept('GET', '**/positions/**').as('getPositionData')
  cy.visit('/')
  cy.get('[data-testid="dashboard-title"]', { timeout: 10000 }).should('be.visible')
})

// Comando para navegar a los detalles de una posición
Cypress.Commands.add('visitPositionDetails', (positionId) => {
  cy.intercept('GET', `**/positions/${positionId}/interviewFlow`).as('getInterviewFlow')
  cy.intercept('GET', `**/positions/${positionId}/candidates`).as('getCandidates')
  cy.visit(`/positions/${positionId}`)
})

// Comando personalizado para drag & drop específico para react-beautiful-dnd
Cypress.Commands.add('dragAndDrop', (draggableSelector, droppableSelector) => {
  cy.get(draggableSelector).should('be.visible').then(($draggable) => {
    cy.get(droppableSelector).should('be.visible').then(($droppable) => {
      const draggable = $draggable[0]
      const droppable = $droppable[0]

      // Obtener coordenadas
      const draggableRect = draggable.getBoundingClientRect()
      const droppableRect = droppable.getBoundingClientRect()

      const startX = draggableRect.left + draggableRect.width / 2
      const startY = draggableRect.top + draggableRect.height / 2
      const endX = droppableRect.left + droppableRect.width / 2
      const endY = droppableRect.top + droppableRect.height / 2

      // Simular el drag & drop paso a paso
      cy.get(draggableSelector)
        .trigger('mousedown', {
          button: 0,
          clientX: startX,
          clientY: startY,
          which: 1
        })
        .wait(200)

      // Simular movimiento
      cy.get('body')
        .trigger('mousemove', {
          clientX: endX,
          clientY: endY
        })
        .wait(100)

      // Soltar en el destino
      cy.get(droppableSelector)
        .trigger('mouseup', {
          clientX: endX,
          clientY: endY
        })
        .wait(200)
    })
  })
})

// Comando específico para react-beautiful-dnd usando eventos drag
Cypress.Commands.add('dragAndDropRBD', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).should('exist').then(($source) => {
    cy.get(targetSelector).should('exist').then(($target) => {
      const source = $source[0]
      const target = $target[0]

      // Crear evento de drag personalizado
      const dragStartEvent = new CustomEvent('dragstart', {
        bubbles: true,
        cancelable: true
      })

      // Asignar dataTransfer mock
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: {
          effectAllowed: 'move',
          dropEffect: 'move',
          types: [],
          data: {},
          setData: function(type, val) { this.data[type] = val },
          getData: function(type) { return this.data[type] }
        }
      })

      // Disparar eventos de drag
      source.dispatchEvent(dragStartEvent)

      const dragOverEvent = new CustomEvent('dragover', {
        bubbles: true,
        cancelable: true
      })

      target.dispatchEvent(dragOverEvent)

      const dropEvent = new CustomEvent('drop', {
        bubbles: true,
        cancelable: true
      })

      target.dispatchEvent(dropEvent)

      const dragEndEvent = new CustomEvent('dragend', {
        bubbles: true,
        cancelable: true
      })

      source.dispatchEvent(dragEndEvent)
    })
  })
})
