// Helpers específicos para las pruebas de posiciones

/**
 * Función helper para agregar data-cy attributes a los componentes
 * Esta función es útil durante el desarrollo para marcar elementos para testing
 */
export const addTestAttributes = () => {
  // Marcar columnas de etapas
  cy.get('.col-md-3').each(($el, index) => {
    cy.wrap($el).invoke('attr', 'data-cy', 'stage-column')
  })
  
  // Marcar tarjetas de candidatos
  cy.get('.mb-2').each(($el, index) => {
    cy.wrap($el).invoke('attr', 'data-cy', 'candidate-card')
  })
}

/**
 * Helper para setup de datos de prueba mockeados
 */
export const setupMockData = () => {
  // Mock para interview flow
  cy.fixture('interviewFlow').then((interviewFlow) => {
    cy.intercept('GET', '**/positions/1/interviewFlow', {
      statusCode: 200,
      body: interviewFlow
    }).as('mockInterviewFlow')
  })
  
  // Mock para candidates
  cy.fixture('candidates').then((candidates) => {
    cy.intercept('GET', '**/positions/1/candidates', {
      statusCode: 200,
      body: candidates
    }).as('mockCandidates')
  })
  
  // Mock para updates
  cy.intercept('PUT', '**/candidates/**', {
    statusCode: 200,
    body: { success: true, message: 'Candidate updated successfully' }
  }).as('mockUpdate')
}

/**
 * Helper para verificar la estructura completa de la página
 */
export const verifyPageStructure = () => {
  // Verificar elementos principales
  cy.get('h2').should('exist') // Título
  cy.get('[data-cy="stage-column"]').should('have.length.at.least', 3) // Columnas
  cy.get('[data-cy="candidate-card"]').should('exist') // Candidatos
  
  // Verificar navegación
  cy.contains('Volver a Posiciones').should('exist')
}

/**
 * Helper para generar reportes de testing
 */
export const generateTestReport = (testName, result) => {
  const timestamp = new Date().toISOString()
  const report = {
    test: testName,
    result: result,
    timestamp: timestamp,
    url: Cypress.config('baseUrl')
  }
  
  // En un entorno real, esto podría enviarse a un servicio de reporting
  cy.log(`Test Report: ${JSON.stringify(report)}`)
}

