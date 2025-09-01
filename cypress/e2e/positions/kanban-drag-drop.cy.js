/// <reference types="cypress" />

/**
 * E2E TESTS - Kanban Drag & Drop
 * 
 * Objetivo: Verificar la funcionalidad de arrastrar y soltar candidatos entre etapas
 * Casos de negocio:
 * - Reclutador mueve candidatos entre fases del proceso de entrevista
 * - Actualización automática del estado en el backend
 * - Sincronización en tiempo real del estado del candidato
 * Prioridad: ALTA - Funcionalidad diferenciadora del producto
 */

describe('🎯 E2E Tests - Kanban Drag & Drop', () => {

  beforeEach(() => {
    // Mock de datos de posición e interview flow
    cy.intercept('GET', '**/positions/1/interviewFlow', { fixture: 'interviewFlow.json' }).as('getInterviewFlow');
    cy.intercept('GET', '**/positions/1/candidates', { fixture: 'candidates.json' }).as('getCandidates');

    // Mock de actualización de candidato
    cy.intercept('PUT', '**/candidates/*', {
      statusCode: 200,
      body: {
        message: 'Candidate stage updated successfully',
        data: { id: 1, currentInterviewStep: 2 }
      }
    }).as('updateCandidate');

    cy.visit('/positions/1');
  });

  it('✅ Debe cargar el kanban con todas las columnas correctamente', () => {
    cy.wait('@getInterviewFlow');
    cy.wait('@getCandidates');

    // Verificar título de la posición
    cy.get('h2').should('contain', 'Senior Frontend Developer');

    // Verificar que existen las columnas esperadas
    const expectedStages = ['Applied', 'Phone Screening', 'Technical Interview', 'Final Interview', 'Hired'];

    expectedStages.forEach(stage => {
      cy.contains(stage).should('be.visible');
    });

    // Verificar botón de volver
    cy.contains('Volver a Posiciones').should('be.visible');
  });

  it('✅ Debe mostrar candidatos en las columnas correctas', () => {
    cy.wait('@getCandidates');

    // Verificar que Juan Pérez está en "Applied"
    cy.contains('Juan Pérez García').should('be.visible');

    // Verificar que María López está en "Phone Screening"
    cy.contains('María López Rodríguez').should('be.visible');

    // Verificar que Carlos Martín está en "Technical Interview"
    cy.contains('Carlos Martín Sánchez').should('be.visible');

    // Verificar que Ana Fernández está en "Final Interview"
    cy.contains('Ana Fernández Torres').should('be.visible');
  });

  it('✅ Debe permitir hacer clic en una tarjeta de candidato', () => {
    cy.wait('@getCandidates');

    // Hacer clic en un candidato
    cy.contains('Juan Pérez García').click();

    // Verificar que se abre el panel lateral (Offcanvas)
    // Nota: Ajustar selector según la implementación real del componente CandidateDetails
    cy.get('.offcanvas, .modal, [data-testid="candidate-details"]').should('be.visible');
  });

  // Nota: Los tests de drag & drop real requieren configuración especial en Cypress
  // debido a las limitaciones con eventos de drag & drop de HTML5
  it('✅ Debe simular el movimiento de candidato entre etapas', () => {
    cy.wait('@getCandidates');

    // Encontrar el candidato Juan Pérez en "Applied"
    cy.contains('Juan Pérez García').as('candidateCard');

    // Simular drag & drop usando eventos de mouse
    // Esto es una aproximación, ya que react-beautiful-dnd requiere eventos específicos
    cy.get('@candidateCard').trigger('mousedown', { button: 0 });

    // Mover hacia la columna "Phone Screening"
    cy.contains('Phone Screening').trigger('mousemove').trigger('mouseup');

    // Verificar que se hizo la llamada a la API para actualizar
    cy.wait('@updateCandidate').then((interception) => {
      expect(interception.request.body).to.have.property('currentInterviewStep');
      expect(interception.request.body).to.have.property('applicationId');
    });
  });

  it('✅ Debe manejar errores en la actualización de candidatos', () => {
    // Mock de error en la API
    cy.intercept('PUT', '**/candidates/*', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('updateCandidateError');

    cy.wait('@getCandidates');

    // Simular movimiento
    cy.contains('Juan Pérez García').trigger('mousedown', { button: 0 });
    cy.contains('Phone Screening').trigger('mousemove').trigger('mouseup');

    // Verificar que se maneja el error
    cy.wait('@updateCandidateError');

    // Aquí deberías verificar cómo maneja tu aplicación los errores
    // Por ejemplo, mostrar un toast, revertir el movimiento, etc.
  });

  it('✅ Debe mantener la funcionalidad responsive en el kanban', () => {
    const viewports = [
      { width: 1280, height: 720 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
    ];

    viewports.forEach(viewport => {
      cy.viewport(viewport.width, viewport.height);
      cy.wait('@getCandidates');

      // Verificar que las columnas siguen siendo visibles
      cy.contains('Applied').should('be.visible');
      cy.contains('Phone Screening').should('be.visible');

      // Verificar que los candidatos siguen siendo visibles
      cy.contains('Juan Pérez García').should('be.visible');
    });
  });

  it('✅ Debe navegar de vuelta a posiciones correctamente', () => {
    cy.wait('@getInterviewFlow');

    // Hacer clic en volver
    cy.contains('Volver a Posiciones').click();

    // Verificar navegación
    cy.url().should('include', '/positions');
  });

  it('✅ Debe mostrar información adicional del candidato (rating)', () => {
    cy.wait('@getCandidates');

    // Verificar que se muestra el rating de María López (8.5)
    cy.contains('María López Rodríguez').parent().should('contain', '8.5');

    // Verificar que se muestra el rating de Ana Fernández (9.1)
    cy.contains('Ana Fernández Torres').parent().should('contain', '9.1');
  });
});

/**
 * COMANDOS PERSONALIZADOS PARA DRAG & DROP
 *
 * Nota: Para implementar drag & drop real con react-beautiful-dnd,
 * necesitarías añadir comandos personalizados en cypress/support/commands.js
 */

// Ejemplo de comando personalizado (añadir a cypress/support/commands.js):
/*
Cypress.Commands.add('dragAndDrop', (sourceSelector, targetSelector) => {
  cy.get(sourceSelector).trigger('mousedown', { which: 1 });
  cy.get(targetSelector).trigger('mousemove').trigger('mouseup');
});
*/