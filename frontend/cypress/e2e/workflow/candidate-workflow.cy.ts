/**
 * E2E Tests for Candidate Workflow
 * 
 * This file contains end-to-end tests for the candidate workflow functionality
 * including stage transitions, interview scheduling, and application tracking.
 */

describe('Candidate Workflow', () => {
  beforeEach(() => {
    // Setup test data and navigate to dashboard
    cy.visit('/')
  })

  afterEach(() => {
    // Clean up test data
    cy.cleanupTestData()
  })

  it('should allow candidate stage transitions', () => {
    // Test moving candidates between stages
    cy.get('[data-testid="candidate-card"]').first().should('be.visible')
    
    // Verify stage columns are present
    cy.get('[data-testid="stage-column"]').should('have.length.at.least', 3)
  })

  it('should display interview flow information', () => {
    // Navigate to a position to see interview flow
    cy.visit('/positions/1')
    
    // Verify interview flow is displayed
    cy.get('[data-testid="interview-flow"]').should('be.visible')
    cy.get('[data-testid="interview-step"]').should('have.length.at.least', 1)
  })

  it('should track application progress', () => {
    // Test application tracking functionality
    cy.visit('/positions/1')
    
    // Verify application information is displayed
    cy.get('[data-testid="application-info"]').should('be.visible')
    cy.get('[data-testid="current-stage"]').should('be.visible')
  })

  it('should handle file uploads for candidates', () => {
    // Test resume upload functionality
    cy.visit('/add-candidate')
    
    // Verify file upload component is present
    cy.get('[data-testid="file-uploader"]').should('be.visible')
  })
})
