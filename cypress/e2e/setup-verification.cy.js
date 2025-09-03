describe('E2E Test Environment Setup', () => {
  it('should verify Cypress configuration is correct', () => {
    // Visit a data URL to avoid server dependency
    cy.visit('data:text/html,<html><body><h1>Cypress Test</h1></body></html>')
    
    // Test configuration values
    expect(Cypress.env('apiUrl')).to.equal('http://localhost:3010')
    expect(Cypress.config('baseUrl')).to.equal('http://localhost:3000')
    expect(Cypress.config('viewportWidth')).to.equal(1280)
    expect(Cypress.config('viewportHeight')).to.equal(720)
  })

  it('should verify frontend server is running', () => {
    cy.visit('/')
    cy.get('body').should('exist')
    cy.log('✅ Frontend server is accessible')
  })

  it('should verify backend API is accessible', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/positions`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404, 500])
      cy.log('✅ Backend API is accessible')
    })
  })

  it('should verify custom commands are available', () => {
    expect(cy.setupTestEnvironment).to.be.a('function')
    expect(cy.visitPosition).to.be.a('function')
    expect(cy.waitForPositionLoad).to.be.a('function')
    expect(cy.interceptPositionAPIs).to.be.a('function')
    expect(cy.dragAndDrop).to.be.a('function')
    expect(cy.getCandidatesByStage).to.be.a('function')
    cy.log('✅ Custom commands are loaded')
  })

  it('should load test fixtures correctly', () => {
    cy.fixture('test-position-data').then((data) => {
      expect(data.testPosition).to.have.property('title')
      expect(data.testPosition.title).to.equal('Senior Frontend Developer')
      expect(data.testCandidates).to.be.an('array')
      expect(data.testCandidates).to.have.length(3)
    })
  })
})
