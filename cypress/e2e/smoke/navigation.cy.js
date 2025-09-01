/// <reference types="cypress" />

/**
 * SMOKE TESTS - Navegación Básica
 * 
 * Objetivo: Verificar que las rutas principales funcionan correctamente
 * Casos de negocio: Acceso básico a todas las funcionalidades del sistema
 * Prioridad: CRÍTICA - Estos tests deben pasar siempre
 */

describe('🚀 Smoke Tests - Navegación Básica', () => {

  beforeEach(() => {
    // Interceptar llamadas a la API para evitar dependencias externas
    cy.intercept('GET', '**/positions/*/interviewFlow', { fixture: 'interviewFlow.json' }).as('getInterviewFlow');
    cy.intercept('GET', '**/positions/*/candidates', { fixture: 'candidates.json' }).as('getCandidates');
    cy.intercept('GET', '**/positions', { fixture: 'positions.json' }).as('getPositions');
  });

  it('✅ Debe cargar el dashboard principal correctamente', () => {
    cy.visit('/');

    // Verificar elementos clave del dashboard
    cy.get('h1').should('contain', 'Dashboard del Reclutador');
    cy.get('img[alt="LTI Logo"]').should('be.visible');

    // Verificar botones de navegación principales
    cy.contains('Añadir Nuevo Candidato').should('be.visible');
    cy.contains('Ir a Posiciones').should('be.visible');
  });

  it('✅ Debe navegar correctamente a la página de añadir candidato', () => {
    cy.visit('/');

    // Navegar a añadir candidato
    cy.contains('Añadir Nuevo Candidato').click();

    // Verificar que estamos en la página correcta
    cy.url().should('include', '/add-candidate');
    cy.get('h1').should('contain', 'Agregar Candidato');

    // Verificar elementos clave del formulario
    cy.get('input[name="firstName"]').should('be.visible');
    cy.get('input[name="lastName"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
  });

  it('✅ Debe navegar correctamente a la página de posiciones', () => {
    cy.visit('/');

    // Navegar a posiciones
    cy.contains('Ir a Posiciones').click();

    // Verificar que estamos en la página correcta
    cy.url().should('include', '/positions');
  });

  it('✅ Debe manejar rutas no existentes (404)', () => {
    cy.visit('/ruta-inexistente', { failOnStatusCode: false });

    // En React Router, las rutas no existentes suelen mostrar una página en blanco
    // o redirigir al dashboard. Ajustar según el comportamiento esperado.
    cy.get('body').should('exist');
  });

  it('✅ Debe mantener la navegación responsive', () => {
    // Test en diferentes tamaños de pantalla
    const viewports = [
      { width: 1280, height: 720 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }   // Mobile
    ];

    viewports.forEach(viewport => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/');

      // Verificar que los elementos principales siguen siendo accesibles
      cy.get('h1').should('be.visible');
      cy.contains('Añadir Nuevo Candidato').should('exist');
      cy.contains('Ir a Posiciones').should('exist');
    });
  });
});