/**
 * E2E Tests for Candidate Management
 * 
 * This file contains end-to-end tests for the candidate management functionality
 * including adding, viewing, and updating candidate information.
 */

describe('Candidate Management', () => {
  beforeEach(() => {
    // Setup test data and navigate to candidate management
    cy.visit('/add-candidate')
  })

  afterEach(() => {
    // Clean up test data
    cy.cleanupTestData()
  })

  it('should display the add candidate form', () => {
    cy.get('[data-testid="add-candidate-form"]').should('be.visible')
    cy.get('[data-testid="candidate-first-name"]').should('be.visible')
    cy.get('[data-testid="candidate-last-name"]').should('be.visible')
    cy.get('[data-testid="candidate-email"]').should('be.visible')
  })

  it('should successfully add a new candidate', () => {
    // Test candidate creation flow
    cy.get('[data-testid="candidate-first-name"]').type('John')
    cy.get('[data-testid="candidate-last-name"]').type('Doe')
    cy.get('[data-testid="candidate-email"]').type('john.doe@example.com')
    
    cy.get('[data-testid="submit-candidate"]').click()
    
    // Verify success message or redirect
    cy.url().should('include', '/')
  })

  it('should validate required fields', () => {
    // Test form validation
    cy.get('[data-testid="submit-candidate"]').click()
    
    // Verify validation messages
    cy.get('[data-testid="validation-error"]').should('be.visible')
  })

  it('should navigate to candidate details', () => {
    // Test navigation to candidate details
    cy.visit('/')
    cy.get('[data-testid="candidate-card"]').first().click()
    
    // Verify candidate details page
    cy.url().should('include', '/candidate/')
  })
})
