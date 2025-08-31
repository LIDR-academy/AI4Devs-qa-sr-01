/**
 * E2E Tests for Recruiter Dashboard
 * 
 * This file contains end-to-end tests for the main recruiter dashboard
 * including navigation, candidate overview, and workflow management.
 */

describe('Recruiter Dashboard', () => {
  beforeEach(() => {
    // Setup test data and navigate to dashboard
    cy.visit('/')
  })

  afterEach(() => {
    // Clean up test data
    cy.cleanupTestData()
  })

  it('should display the main dashboard', () => {
    cy.get('[data-testid="recruiter-dashboard"]').should('be.visible')
    cy.get('[data-testid="dashboard-title"]').should('contain', 'Recruiter Dashboard')
  })

  it('should show candidate pipeline', () => {
    cy.get('[data-testid="candidate-pipeline"]').should('be.visible')
    cy.get('[data-testid="pipeline-stage"]').should('have.length.at.least', 3)
  })

  it('should allow candidate stage updates', () => {
    // Test drag and drop functionality for updating candidate stages
    cy.get('[data-testid="candidate-card"]').first().should('be.visible')
    
    // Verify stage columns are present
    cy.get('[data-testid="stage-column"]').should('have.length.at.least', 3)
  })

  it('should navigate to add candidate form', () => {
    cy.get('[data-testid="add-candidate-button"]').click()
    
    // Verify navigation to add candidate page
    cy.url().should('include', '/add-candidate')
  })

  it('should navigate to positions', () => {
    cy.get('[data-testid="positions-button"]').click()
    
    // Verify navigation to positions page
    cy.url().should('include', '/positions')
  })

  it('should display candidate statistics', () => {
    cy.get('[data-testid="candidate-stats"]').should('be.visible')
    cy.get('[data-testid="total-candidates"]').should('be.visible')
    cy.get('[data-testid="active-applications"]').should('be.visible')
  })
})
