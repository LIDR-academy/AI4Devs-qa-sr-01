/**
 * PAGE OBJECT - Dashboard Principal
 * 
 * Encapsula los elementos y acciones del dashboard principal
 * Facilita el mantenimiento y reutilización de código
 */

class DashboardPage {
  // Selectores
  get logo() { return cy.get('img[alt="LTI Logo"]'); }
  get title() { return cy.get('h1').contains('Dashboard del Reclutador'); }
  get addCandidateButton() { return cy.contains('Añadir Nuevo Candidato'); }
  get viewPositionsButton() { return cy.contains('Ir a Posiciones'); }

  // Acciones
  visit() {
    cy.visit('/');
    return this;
  }

  navigateToAddCandidate() {
    this.addCandidateButton.click();
    return this;
  }

  navigateToPositions() {
    this.viewPositionsButton.click();
    return this;
  }

  // Verificaciones
  verifyPageLoaded() {
    this.title.should('be.visible');
    this.logo.should('be.visible');
    this.addCandidateButton.should('be.visible');
    this.viewPositionsButton.should('be.visible');
    return this;
  }
}

export default DashboardPage;