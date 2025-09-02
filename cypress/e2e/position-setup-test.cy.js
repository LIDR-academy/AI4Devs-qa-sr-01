describe('Cypress Setup Verification', () => {
  it('should verify Cypress configuration is working', () => {
    // Test basic Cypress functionality without requiring servers
    expect(Cypress.env('apiUrl')).to.equal('http://localhost:3010')
    expect(Cypress.config('baseUrl')).to.equal('http://localhost:3000')
    expect(Cypress.config('viewportWidth')).to.equal(1280)
  })

  // This test requires servers to be running - will be used later
  it.skip('should verify frontend server connectivity', () => {
    cy.visit('/')
    cy.contains('LTI').should('be.visible')
  })

  // This test requires servers to be running - will be used later  
  it.skip('should verify API connectivity', () => {
    cy.request({
      method: 'GET',
      url: `${Cypress.env('apiUrl')}/positions`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.be.oneOf([200, 404, 500])
    })
  })
})
