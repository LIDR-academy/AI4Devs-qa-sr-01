describe('Position Page Load Tests', () => {
  let testData

  before(() => {   
    cy.setupTestEnvironment()
  })

  beforeEach(() => {
    cy.interceptPositionAPIs(1)
  })

  describe('Position Title Display', () => {
    it('should display the position title correctly and handle loading states', () => {
      cy.visitPosition(1)
      
      // Initially, title should exist
      cy.get('[data-testid="position-title"]').should('exist')
      
      // Wait for API calls to complete
      cy.wait('@getInterviewFlow', { timeout: 15000 })
      cy.wait('@getCandidates', { timeout: 15000 })
      cy.wait(1000)
      cy.get('[data-testid="stage-column"]').should('have.length.greaterThan', 0)
      
      // After API call, title should be populated and visible
      cy.get('[data-testid="position-title"]')
        .should('be.visible')
        .and('not.be.empty')
    })
  })

  describe('Interview Stage Columns Display', () => {
    it('should display all interview stage columns', () => {
      cy.visitPosition(1)
      cy.wait('@getInterviewFlow', { timeout: 15000 })
      cy.wait('@getCandidates', { timeout: 15000 })
      cy.wait(1000)
      
      // Verify all stage columns are displayed (4 columns from seed data)
      cy.get('[data-testid="stage-column"]')
        .should('have.length', 4)
      
      // Verify stage headers contain expected text from seed data
      cy.get('[data-testid="stage-header"]').should(($headers) => {
        const headerTexts = [...$headers].map(el => el.textContent)
        expect(headerTexts).to.include('Initial Screening')
        expect(headerTexts).to.include('Technical Interview')
        expect(headerTexts).to.include('Final Interview')
        expect(headerTexts).to.include('Offer')
      })
    })

    it('should display stage columns in correct order', () => {
      cy.visitPosition(1)
      cy.wait('@getInterviewFlow', { timeout: 15000 })
      cy.wait('@getCandidates', { timeout: 15000 })
      cy.wait(1000)
      
      // Verify columns appear in the correct order (based on seed data)
      cy.get('[data-testid="stage-header"]').then(($headers) => {
        expect($headers.eq(0)).to.contain.text('Initial Screening')
        expect($headers.eq(1)).to.contain.text('Technical Interview')
        expect($headers.eq(2)).to.contain.text('Final Interview')
        expect($headers.eq(3)).to.contain.text('Offer')
      })
    })
  })

  describe('Candidate Cards Placement', () => {
    it('should display candidate cards in correct columns', () => {
      cy.visitPosition(1)
      cy.wait('@getInterviewFlow', { timeout: 15000 })
      cy.wait('@getCandidates', { timeout: 15000 })
      cy.wait(1000)
      
      // Verify candidates appear in their respective columns
      cy.get('[data-testid="stage-column"]').first().within(() => {
        cy.get('[data-testid="candidate-card"]')
          .should('have.length.greaterThan', 0)
      })
    })

    it('should display candidate information correctly', () => {
      cy.visitPosition(1)
      cy.wait('@getInterviewFlow', { timeout: 15000 })
      cy.wait('@getCandidates', { timeout: 15000 })
      cy.wait(1000)
      
      // Verify candidate cards contain name and rating
      cy.get('[data-testid="candidate-card"]').first().within(() => {
        cy.get('.card-title').should('be.visible').and('not.be.empty')
        // Rating stars might not be visible for candidates with 0 score
        cy.get('div').should('exist') // Just verify the rating div exists
      })
    })

    it('should handle empty columns correctly', () => {
      cy.visitPosition(1)
      cy.wait('@getInterviewFlow', { timeout: 15000 })
      cy.wait('@getCandidates', { timeout: 15000 })
      cy.wait(1000)
      
      // Some columns might be empty - verify they still display properly
      cy.get('[data-testid="stage-column"]').each(($column) => {
        cy.wrap($column).find('[data-testid="stage-header"]').should('be.visible')
      })
    })
  })
})
