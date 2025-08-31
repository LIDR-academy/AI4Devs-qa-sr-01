/**
 * Component Test for RecruiterDashboard
 * 
 * This file contains component tests for the RecruiterDashboard component
 * using Cypress Component Testing.
 */

import React from 'react'
import RecruiterDashboard from '../../src/components/RecruiterDashboard'

describe('RecruiterDashboard.cy.tsx', () => {
  it('should render the dashboard correctly', () => {
    cy.mount(<RecruiterDashboard />)
    
    // Verify dashboard elements are present
    cy.get('[data-testid="recruiter-dashboard"]').should('be.visible')
    cy.get('[data-testid="dashboard-title"]').should('contain', 'Recruiter Dashboard')
  })

  it('should display candidate pipeline', () => {
    cy.mount(<RecruiterDashboard />)
    
    // Verify pipeline components are present
    cy.get('[data-testid="candidate-pipeline"]').should('be.visible')
    cy.get('[data-testid="pipeline-stage"]').should('have.length.at.least', 3)
  })

  it('should show navigation buttons', () => {
    cy.mount(<RecruiterDashboard />)
    
    // Verify navigation buttons are present
    cy.get('[data-testid="add-candidate-button"]').should('be.visible')
    cy.get('[data-testid="positions-button"]').should('be.visible')
  })

  it('should display candidate statistics', () => {
    cy.mount(<RecruiterDashboard />)
    
    // Verify statistics are displayed
    cy.get('[data-testid="candidate-stats"]').should('be.visible')
    cy.get('[data-testid="total-candidates"]').should('be.visible')
  })
})
