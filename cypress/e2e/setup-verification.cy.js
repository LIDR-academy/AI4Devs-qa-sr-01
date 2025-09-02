describe('E2E Test Environment Setup', () => {
  before(() => {
    // This test verifies that both servers are running
    cy.log('Verifying test environment is ready...')
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

  it('should verify test fixtures are loaded', () => {
    cy.fixture('test-data').then((data) => {
      expect(data.position).to.have.property('name')
      expect(data.candidates).to.be.an('array')
      cy.log('✅ Test fixtures are working')
    })
  })

  it('should verify custom commands are available', () => {
    expect(cy.visitPosition).to.be.a('function')
    expect(cy.waitForPositionLoad).to.be.a('function')
    expect(cy.interceptPositionAPIs).to.be.a('function')
    cy.log('✅ Custom commands are loaded')
  })
})
