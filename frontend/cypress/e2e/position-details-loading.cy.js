describe('Position Details - Carga de la Página', () => {
  beforeEach(() => {
    // Interceptar las llamadas a la API para controlar los datos de prueba
    cy.intercept('GET', '**/positions/*/interviewFlow', {
      fixture: 'interviewFlow.json'
    }).as('getInterviewFlow')

    cy.intercept('GET', '**/positions/*/candidates', {
      fixture: 'candidates.json'
    }).as('getCandidates')
  })

  it('debería cargar la página de position correctamente', () => {
    // Visitar la página de detalles de position
    cy.visit('/positions/1')

    // Esperar a que las llamadas a la API se completen
    cy.wait(['@getInterviewFlow', '@getCandidates'])

    // Verificar que el contenedor principal se carga
    cy.get('[data-testid="position-details-container"]')
      .should('be.visible')

    // Verificar que el botón de "Volver a Posiciones" está presente
    cy.get('[data-testid="back-to-positions-btn"]')
      .should('be.visible')
      .and('contain.text', 'Volver a Posiciones')
  })

  it('debería mostrar el título de la posición correctamente', () => {
    cy.visit('/positions/1')
    cy.wait(['@getInterviewFlow', '@getCandidates'])

    // Verificar que el título de la posición se muestra correctamente
    cy.get('[data-testid="position-title"]')
      .should('be.visible')
      .and('not.be.empty')
      .and('contain.text', 'Desarrollador Frontend React')
  })

  it('debería mostrar las columnas correspondientes a cada fase del proceso de contratación', () => {
    cy.visit('/positions/1')
    cy.wait(['@getInterviewFlow', '@getCandidates'])

    // Verificar que el contenedor de etapas de entrevista está presente
    cy.get('[data-testid="interview-stages-row"]')
      .should('be.visible')

    // Verificar que se muestran las columnas de cada fase
    const expectedStages = ['Screening inicial', 'Entrevista técnica', 'Entrevista final', 'Contratado']

    expectedStages.forEach((stage, index) => {
      // Verificar que cada columna de etapa está presente
      cy.get(`[data-testid="stage-column-${index}"]`)
        .should('be.visible')

      // Verificar que el header de cada etapa muestra el nombre correcto
      cy.get(`[data-testid="stage-header-${index}"]`)
        .should('be.visible')
        .and('contain.text', stage)

      // Verificar que el body de cada etapa está presente
      cy.get(`[data-testid="stage-body-${index}"]`)
        .should('be.visible')
    })
  })

  it('debería mostrar las tarjetas de los candidatos en la columna correcta según su fase actual', () => {
    cy.visit('/positions/1')
    cy.wait(['@getInterviewFlow', '@getCandidates'])

    // Verificar que hay candidatos en la primera etapa (Screening inicial)
    cy.get('[data-testid="stage-body-0"]')
      .within(() => {
        cy.get('[data-testid^="candidate-card-"]')
          .should('have.length.at.least', 1)
      })

    // Verificar que al menos una tarjeta de candidato está visible
    cy.get('[data-testid^="candidate-card-"]')
      .first()
      .should('be.visible')
      .within(() => {
        // Verificar que el nombre del candidato se muestra
        cy.get('[data-testid^="candidate-name-"]')
          .should('be.visible')
          .and('not.be.empty')

        // Verificar que el rating del candidato se muestra
        cy.get('[data-testid^="candidate-rating-"]')
          .should('be.visible')
      })
  })

  it('debería mostrar candidatos específicos en las etapas correctas', () => {
    cy.visit('/positions/1')
    cy.wait(['@getInterviewFlow', '@getCandidates'])

    // Verificar candidatos en "Screening inicial" (etapa 0)
    cy.get('[data-testid="stage-body-0"]')
      .within(() => {
        cy.get('[data-testid="candidate-card-1"]')
          .should('exist')
          .within(() => {
            cy.get('[data-testid="candidate-name-1"]')
              .should('contain.text', 'Juan Pérez')
          })
      })

    // Verificar candidatos en "Entrevista técnica" (etapa 1)
    cy.get('[data-testid="stage-body-1"]')
      .within(() => {
        cy.get('[data-testid="candidate-card-2"]')
          .should('exist')
          .within(() => {
            cy.get('[data-testid="candidate-name-2"]')
              .should('contain.text', 'María García')
          })
      })
  })

  it('debería manejar el estado de carga cuando no hay datos', () => {
    // Interceptar con respuesta vacía
    cy.intercept('GET', '**/positions/*/interviewFlow', {
      interviewFlow: {
        positionName: '',
        interviewFlow: {
          interviewSteps: []
        }
      }
    }).as('getEmptyInterviewFlow')

    cy.intercept('GET', '**/positions/*/candidates', []).as('getEmptyCandidates')

    cy.visit('/positions/1')
    cy.wait(['@getEmptyInterviewFlow', '@getEmptyCandidates'])

    // Verificar que el contenedor principal sigue siendo visible
    cy.get('[data-testid="position-details-container"]')
      .should('be.visible')

    // Verificar que no hay columnas de etapas cuando no hay datos
    cy.get('[data-testid^="stage-column-"]')
      .should('not.exist')
  })
})

