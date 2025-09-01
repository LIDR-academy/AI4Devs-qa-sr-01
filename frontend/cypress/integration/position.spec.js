// cypress/integration/position.spec.js

// Ajusta si tu página de "position" no es la home:
const POSITION_PATH = '/positions/1'; // Página de detalles de la posición con ID 1

// Cambia estos encabezados a los reales de tus columnas:
const PHASES = ['Initial Screening', 'Technical Interview', 'Manager Interview'];

// Cambia por un candidato que exista en tu UI:
const CANDIDATE_NAME = 'John Doe';

// A qué fase lo moveremos:
const TARGET_PHASE = 'Interview';

describe('Position Page E2E', () => {
  beforeEach(() => {
    cy.visit(POSITION_PATH);
  });

  it('Carga de la página: muestra título, columnas y tarjetas en columna correcta', () => {
    // Título (ajusta si tu H1 es otro texto)
    cy.contains('Posiciones').should('be.visible');

    // Columnas visibles
    PHASES.forEach((phase) => {
      cy.contains(phase).should('be.visible');
    });

    // Alguna tarjeta visible (ajusta a tu caso real)
    cy.contains(CANDIDATE_NAME).should('be.visible');
  });

  it('Cambio de fase de un candidato: arrastre + PUT /candidate/:id', () => {
    // Solo para diagnosticar - ver qué elementos existen
    cy.get('[data-rbd-draggable-id]').should('exist');
    cy.get('[data-rbd-droppable-id]').should('exist');
    
    // Ver qué IDs están disponibles
    cy.get('[data-rbd-droppable-id]').each(($el) => {
      cy.log('Droppable ID:', $el.attr('data-rbd-droppable-id'));
    });
  });
});
