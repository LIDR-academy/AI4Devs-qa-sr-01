/**
 * E2E Tests for Position Details Page Loading
 * 
 * This test verifies that the Position Details page loads correctly and displays:
 * 1. Position title correctly
 * 2. Interview stage columns for each phase
 * 3. Candidate cards in the correct columns based on their current stage
 */

describe('Position Details Page Loading', () => {
  const testPositionId = 1; // ID de posición de prueba
  
  beforeEach(() => {
    // Setup: Crear datos de prueba y navegar a la página de detalles
    cy.createTestPosition()
    cy.createTestCandidate()
    
    // Mock de la respuesta del flujo de entrevistas usando fixture
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
    
    // Mock de la respuesta de candidatos usando fixture
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
        },
        {
          candidateId: 4,
          fullName: 'Alice Brown',
          averageScore: 5,
          applicationId: 4,
          currentInterviewStep: 'Oferta'
        }
      ]
    }).as('getCandidates')
    
    // Navegar a la página de detalles de la posición
    cy.visit(`/positions/${testPositionId}`)
    
    // Esperar a que se carguen las respuestas de la API
    cy.wait('@getInterviewFlow')
    cy.wait('@getCandidates')
    
    // Esperar a que la página se renderice completamente
    cy.wait(1000)
  })

  afterEach(() => {
    // Clean up test data
    cy.cleanupTestData()
  })

  it('should display the position title correctly', () => {
    // Verificar que el título de la posición se muestra correctamente
    cy.get('[data-testid="position-title"]')
      .should('be.visible')
      .and('contain', 'Senior Software Engineer')
    
    // Verificar que el título está centrado
    cy.get('[data-testid="position-title"]')
      .should('have.class', 'text-center')
  })

  it('should display interview stage columns for each phase', () => {
    // Verificar que se muestran las columnas correspondientes a cada fase
    cy.get('[data-testid="stage-column"]').should('have.length', 4)
    
    // Verificar que cada columna tiene el título correcto
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="stage-header"]')
      .should('contain', 'Aplicación Recibida')
    
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="stage-header"]')
      .should('contain', 'Entrevista Inicial')
    
    cy.get('[data-testid="stage-column"]').eq(2)
      .find('[data-testid="stage-header"]')
      .should('contain', 'Entrevista Técnica')
    
    cy.get('[data-testid="stage-column"]').eq(3)
      .find('[data-testid="stage-header"]')
      .should('contain', 'Oferta')
    
    // Verificar que cada columna tiene la estructura correcta
    cy.get('[data-testid="stage-column"]').each(($column) => {
      cy.wrap($column).within(() => {
        // Verificar que tiene un header
        cy.get('[data-testid="stage-header"]').should('be.visible')
        
        // Verificar que tiene un body para los candidatos
        cy.get('[data-testid="stage-body"]').should('be.visible')
      })
    })
  })

  it('should display candidate cards in the correct columns based on their current stage', () => {
    // Verificar que las tarjetas de candidatos se muestran en la columna correcta
    
    // Columna 1: Aplicación Recibida - Debe tener 1 candidato
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 1)
      .and('contain', 'John Doe')
    
    // Columna 2: Entrevista Inicial - Debe tener 1 candidato
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 1)
      .and('contain', 'Jane Smith')
    
    // Columna 3: Entrevista Técnica - Debe tener 1 candidato
    cy.get('[data-testid="stage-column"]').eq(2)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 1)
      .and('contain', 'Bob Johnson')
    
    // Columna 4: Oferta - Debe tener 1 candidato
    cy.get('[data-testid="stage-column"]').eq(3)
      .find('[data-testid="candidate-card"]')
      .should('have.length', 1)
      .and('contain', 'Alice Brown')
    
    // Verificar que cada tarjeta de candidato tiene la información correcta
    cy.get('[data-testid="candidate-card"]').each(($card) => {
      cy.wrap($card).within(() => {
        // Verificar que tiene el nombre del candidato
        cy.get('[data-testid="candidate-name"]').should('be.visible')
        
        // Verificar que tiene el rating (estrellas)
        cy.get('[data-testid="candidate-rating"]').should('be.visible')
      })
    })
  })

  it('should handle empty candidate lists gracefully', () => {
    // Mock de respuesta sin candidatos para probar el manejo de listas vacías
    cy.intercept('GET', `**/positions/${testPositionId}/candidates`, {
      statusCode: 200,
      body: []
    }).as('getEmptyCandidates')
    
    // Recargar la página
    cy.reload()
    cy.wait('@getEmptyCandidates')
    cy.wait(1000) // Esperar a que se renderice
    
    // Verificar que las columnas se muestran pero sin candidatos
    cy.get('[data-testid="stage-column"]').should('have.length', 4)
    
    cy.get('[data-testid="stage-column"]').each(($column) => {
      cy.wrap($column).within(() => {
        cy.get('[data-testid="candidate-card"]').should('have.length', 0)
      })
    })
  })

  it('should display navigation elements correctly', () => {
    // Verificar que el botón de volver está presente
    cy.get('[data-testid="back-to-positions-button"]')
      .should('be.visible')
      .and('contain', 'Volver a Posiciones')
    
    // Verificar que el botón navega correctamente
    cy.get('[data-testid="back-to-positions-button"]').click()
    cy.url().should('include', '/positions')
  })

  it('should display candidate ratings correctly', () => {
    // Verificar que los ratings se muestran correctamente
    
    // John Doe tiene rating 4 - debe mostrar 4 estrellas
    cy.get('[data-testid="stage-column"]').eq(0)
      .find('[data-testid="candidate-card"]')
      .find('[data-testid="candidate-rating"]')
      .find('span')
      .should('have.length', 4)
    
    // Jane Smith tiene rating 5 - debe mostrar 5 estrellas
    cy.get('[data-testid="stage-column"]').eq(1)
      .find('[data-testid="candidate-card"]')
      .find('[data-testid="candidate-rating"]')
      .find('span')
      .should('have.length', 5)
    
    // Bob Johnson tiene rating 3 - debe mostrar 3 estrellas
    cy.get('[data-testid="stage-column"]').eq(2)
      .find('[data-testid="candidate-card"]')
      .find('[data-testid="candidate-rating"]')
      .find('span')
      .should('have.length', 3)
  })
})
