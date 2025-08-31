/**
 * Component Test for AddCandidateForm
 * 
 * This file contains component tests for the AddCandidateForm component
 * using Cypress Component Testing.
 */

import React from 'react'
import AddCandidateForm from '../../src/components/AddCandidateForm'

describe('AddCandidateForm.cy.tsx', () => {
  it('should render the form correctly', () => {
    cy.mount(<AddCandidateForm />)
    
    // Verify form elements are present
    cy.get('[data-testid="add-candidate-form"]').should('be.visible')
    cy.get('[data-testid="candidate-first-name"]').should('be.visible')
    cy.get('[data-testid="candidate-last-name"]').should('be.visible')
    cy.get('[data-testid="candidate-email"]').should('be.visible')
  })

  it('should handle form submission', () => {
    cy.mount(<AddCandidateForm />)
    
    // Fill out the form
    cy.get('[data-testid="candidate-first-name"]').type('John')
    cy.get('[data-testid="candidate-last-name"]').type('Doe')
    cy.get('[data-testid="candidate-email"]').type('john.doe@example.com')
    
    // Submit the form
    cy.get('[data-testid="submit-candidate"]').click()
    
    // Verify form submission behavior
    cy.get('[data-testid="form-submitted"]').should('be.visible')
  })

  it('should validate required fields', () => {
    cy.mount(<AddCandidateForm />)
    
    // Try to submit without filling required fields
    cy.get('[data-testid="submit-candidate"]').click()
    
    // Verify validation messages
    cy.get('[data-testid="validation-error"]').should('be.visible')
  })
})
