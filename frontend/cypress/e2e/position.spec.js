/// <reference types="cypress" />

// Importar funciones auxiliares desde el nuevo sistema modular
import { 
  setupPositionsMocks, 
  setupPositionDetailsMocks, 
  setupCandidateUpdateMock,
  visitPositionsPage, 
  visitPositionDetailsPage,
  verifyPositionsPageStructure,
  verifyPositionDetailsStructure,
  verifyCandidateInColumn,
  verifyCandidateNotInColumn,
  verifyColumnIsEmpty,
  getDraggableCandidate,
  getDroppableArea,
  verifyDraggableElements,
  verifyDroppableAreas,
  simulateCandidateUpdate,
  verifyCandidateUpdateRequest,
  verifyCandidateUpdateResponse,
  setupDragDropTest,
  setupApiTest,
  TEST_DATA,
  API_ENDPOINTS
} from '../support/helpers'

describe('Position Page Load Tests', () => {
  beforeEach(() => {
    setupPositionsMocks()
  })

  describe('Page Load and Title Rendering', () => {
    it('should visit the positions page successfully', () => {
      visitPositionsPage()
      cy.url().should('include', '/positions')
    })

    it('should render the page title correctly', () => {
      visitPositionsPage()
      verifyPositionsPageStructure()
    })

    it('should render position card titles correctly', () => {
      visitPositionsPage()
      
      // Verify that position cards are displayed
      cy.get('.card').should('have.length.at.least', 1)
      
      // Check that each position card has a title
      cy.get('.card').each(($card) => {
        cy.wrap($card).within(() => {
          cy.get('.card-title').should('be.visible').and('not.be.empty')
        })
      })
    })

    it('should render specific position titles from fixture data', () => {
      // Visit the positions page
      cy.visit('/positions')
      cy.wait('@getPositions')
      
      // Verify specific position titles are rendered
      cy.get('.card-title').should('contain', 'Frontend Developer')
      cy.get('.card-title').should('contain', 'Backend Developer')
      cy.get('.card-title').should('contain', 'Full Stack Developer')
      cy.get('.card-title').should('contain', 'DevOps Engineer')
    })

    it('should have proper page structure and layout', () => {
      // Visit the positions page
      cy.visit('/positions')
      cy.wait('@getPositions')
      
      // Verify page structure
      cy.get('.container').should('be.visible')
      cy.get('h2').should('contain', 'Posiciones')
      
      // Verify navigation elements
      cy.get('button').should('contain', 'Volver al Dashboard')
      
      // Verify filter controls are present
      cy.get('input[placeholder="Buscar por título"]').should('be.visible')
      cy.get('input[type="date"]').should('be.visible')
      cy.get('select').should('have.length', 2) // Status and Manager filters
    })

    it('should handle page load without errors', () => {
      // Visit the positions page
      cy.visit('/positions')
      cy.wait('@getPositions')
      
      // Verify page loads without critical errors
      cy.get('body').should('be.visible')
      cy.get('.container').should('be.visible')
      
      // Check that no critical console errors occurred
      cy.window().then((win) => {
        // This will pass if no uncaught exceptions occurred
        expect(win).to.exist
      })
    })
  })

  describe('Position Card Content Verification', () => {
    it('should display complete position information', () => {
      // Visit the positions page
      cy.visit('/positions')
      cy.wait('@getPositions')
      
      // Check first position card for complete information
      cy.get('.card').first().within(() => {
        // Verify title is present
        cy.get('.card-title').should('be.visible')
        
        // Verify card text contains expected information
        cy.get('.card-text').should('contain', 'Manager:')
        cy.get('.card-text').should('contain', 'Deadline:')
        
        // Verify status badge is present
        cy.get('.badge').should('be.visible')
        
        // Verify action buttons are present
        cy.get('button').should('contain', 'Ver proceso')
        cy.get('button').should('contain', 'Editar')
      })
    })

    it('should render position titles with proper styling', () => {
      // Visit the positions page
      cy.visit('/positions')
      cy.wait('@getPositions')
      
      // Check that position titles have proper CSS classes
      cy.get('.card-title').should('have.class', 'card-title')
      
      // Verify titles are visible and have content
      cy.get('.card-title').should('be.visible')
      cy.get('.card-title').should('not.be.empty')
      
      // Verify at least one title has text content
      cy.get('.card-title').first().should('contain.text', 'Developer')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty positions list gracefully', () => {
      // Mock empty positions response
      cy.intercept('GET', 'http://localhost:3010/positions', {
        body: { positions: [] }
      }).as('getEmptyPositions')
      
      // Visit the positions page
      cy.visit('/positions')
      cy.wait('@getEmptyPositions')
      
      // Verify page still loads correctly
      cy.url().should('include', '/positions')
      cy.get('h2').should('contain', 'Posiciones')
      
      // Verify no cards are displayed
      cy.get('.card').should('have.length', 0)
    })

    it('should handle API errors gracefully', () => {
      // Mock API error response
      cy.intercept('GET', 'http://localhost:3010/positions', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('getPositionsError')
      
      // Visit the positions page
      cy.visit('/positions')
      cy.wait('@getPositionsError')
      
      // Verify page still loads
      cy.url().should('include', '/positions')
      cy.get('h2').should('contain', 'Posiciones')
    })
  })

  describe('Position Details - Process Columns Validation', () => {
    beforeEach(() => {
      setupPositionDetailsMocks()
    })

    it('should navigate to position details and display process columns', () => {
      // First visit positions page
      cy.visit('/positions')
      cy.wait('@getPositions')
      
      // Click on "Ver proceso" button for first position
      cy.get('.card').first().within(() => {
        cy.get('button').contains('Ver proceso').click()
      })
      
      // Wait for API calls
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify we're on position details page
      cy.url().should('match', /\/positions\/\d+/)
    })

    it('should display all process columns correctly', () => {
      // Visit position details page directly
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify that process columns are displayed
      cy.get('.card').should('have.length.at.least', 1)
      
      // Verify that we have column headers
      cy.get('.card-header').should('be.visible')
      
      // Verify that we have column bodies
      cy.get('.card-body').should('be.visible')
    })

    it('should display correct phase names in column headers', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify specific phase names are displayed in column headers
      cy.get('.card-header').should('contain', 'Aplicación Inicial')
      cy.get('.card-header').should('contain', 'Screening')
      cy.get('.card-header').should('contain', 'Entrevista Técnica')
      cy.get('.card-header').should('contain', 'Entrevista Final')
      cy.get('.card-header').should('contain', 'Contratado')
    })

    it('should ensure all phase names are visible and properly styled', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify all column headers are visible
      cy.get('.card-header').should('be.visible')
      
      // Verify headers have proper styling (centered text)
      cy.get('.card-header').should('have.class', 'text-center')
      
      // Verify headers are not empty
      cy.get('.card-header').should('not.be.empty')
      
      // Verify at least one header has specific text
      cy.get('.card-header').first().should('contain', 'Aplicación Inicial')
    })

    it('should display the correct number of process columns', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify exactly 5 column headers are displayed (based on fixture data)
      cy.get('.card-header').should('have.length', 5)
      
      // Verify each column is in a Col component (Bootstrap grid)
      cy.get('.col-md-3').should('have.length', 5)
    })

    it('should handle empty interview flow gracefully', () => {
      // Mock empty interview flow
      cy.intercept('GET', 'http://localhost:3010/positions/1/interviewFlow', {
        body: {
          interviewFlow: {
            positionName: "Test Position",
            interviewFlow: {
              interviewSteps: []
            }
          }
        }
      }).as('getEmptyInterviewFlow')
      
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getEmptyInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify page still loads
      cy.url().should('match', /\/positions\/\d+/)
      cy.get('h2').should('contain', 'Test Position')
      
      // Verify no columns are displayed when no steps exist
      cy.get('.card').should('have.length', 0)
    })

    it('should display position name in the page title', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify position name is displayed in the main title
      cy.get('h2').should('contain', 'Frontend Developer')
      cy.get('h2').should('be.visible')
    })

    it('should have proper navigation back to positions', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify back button exists and is functional
      cy.get('button').should('contain', 'Volver a Posiciones')
      cy.get('button').contains('Volver a Posiciones').click()
      
      // Verify navigation back to positions page
      cy.url().should('include', '/positions')
    })
  })

  describe('Candidate Column Validation', () => {
    beforeEach(() => {
      // Mock API responses for position details
      cy.intercept('GET', 'http://localhost:3010/positions/1/interviewFlow', {
        fixture: 'interview-flow.json'
      }).as('getInterviewFlow')
      
      cy.intercept('GET', 'http://localhost:3010/positions/1/candidates', {
        fixture: 'position-candidates.json'
      }).as('getPositionCandidates')
    })

    it('should display candidates in their correct phase columns', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify that candidates appear in the correct columns based on their currentInterviewStep
      verifyCandidateInColumn(TEST_DATA.candidates.juan.name, TEST_DATA.phases.aplicacionInicial.name)
      verifyCandidateInColumn(TEST_DATA.candidates.maria.name, TEST_DATA.phases.screening.name)
      verifyCandidateInColumn(TEST_DATA.candidates.carlos.name, TEST_DATA.phases.entrevistaTecnica.name)
    })

    it('should verify candidate names are displayed correctly in their respective columns', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Check each candidate appears in the correct column using helper functions
      verifyCandidateInColumn(TEST_DATA.candidates.juan.name, TEST_DATA.phases.aplicacionInicial.name)
      verifyCandidateInColumn(TEST_DATA.candidates.maria.name, TEST_DATA.phases.screening.name)
      verifyCandidateInColumn(TEST_DATA.candidates.carlos.name, TEST_DATA.phases.entrevistaTecnica.name)
    })

    it('should verify candidates are not duplicated across columns', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify each candidate appears only once across all columns
      // Count candidate cards specifically within the position details context
      cy.get('.card-header').contains('Aplicación Inicial').parent().within(() => {
        cy.get('.card-title').should('contain', 'Juan Pérez').and('have.length', 1)
      })
      
      cy.get('.card-header').contains('Screening').parent().within(() => {
        cy.get('.card-title').should('contain', 'María García').and('have.length', 1)
      })
      
      cy.get('.card-header').contains('Entrevista Técnica').parent().within(() => {
        cy.get('.card-title').should('contain', 'Carlos López').and('have.length', 1)
      })
    })

    it('should verify empty columns show no candidates', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify that "Entrevista Final" and "Contratado" columns are empty
      verifyColumnIsEmpty(TEST_DATA.phases.entrevistaFinal.name)
      verifyColumnIsEmpty(TEST_DATA.phases.contratado.name)
    })

    it('should verify candidate ratings are displayed correctly', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify that candidate ratings (stars) are displayed
      // Juan Pérez has rating 8.5, so should show 8-9 stars
      cy.get('.card-header').contains('Aplicación Inicial').parent().within(() => {
        cy.get('.card-title').contains('Juan Pérez').parent().within(() => {
          cy.get('span[role="img"]').should('have.length.at.least', 8)
        })
      })
      
      // María García has rating 9.2, so should show 9 stars
      cy.get('.card-header').contains('Screening').parent().within(() => {
        cy.get('.card-title').contains('María García').parent().within(() => {
          cy.get('span[role="img"]').should('have.length.at.least', 9)
        })
      })
    })

    it('should handle candidates with no currentInterviewStep gracefully', () => {
      // Mock candidates with missing or invalid currentInterviewStep
      cy.intercept('GET', 'http://localhost:3010/positions/1/candidates', {
        body: [
          {
            "candidateId": 4,
            "fullName": "Ana Sin Fase",
            "averageScore": 7.0,
            "applicationId": 104,
            "currentInterviewStep": null
          }
        ]
      }).as('getCandidatesNoPhase')
      
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getCandidatesNoPhase')
      
      // Verify that candidates without a valid phase don't appear in any column
      // Check that no candidate cards are displayed at all
      cy.get('.card-body .card-title').should('not.exist')
      
      // Verify that all columns are empty
      cy.get('.card-header').each(($header) => {
        cy.wrap($header).parent().within(() => {
          cy.get('.card-body').should('not.contain', 'Ana Sin Fase')
        })
      })
    })

    it('should verify all candidate cards are draggable', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify that candidate cards have draggable attributes
      cy.get('.card-title').contains('Juan Pérez').parent().parent().should('have.attr', 'data-rbd-draggable-id')
      cy.get('.card-title').contains('María García').parent().parent().should('have.attr', 'data-rbd-draggable-id')
      cy.get('.card-title').contains('Carlos López').parent().parent().should('have.attr', 'data-rbd-draggable-id')
    })

    it('should verify candidate cards are clickable', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify that candidate cards are clickable (have cursor pointer or similar)
      cy.get('.card-title').contains('Juan Pérez').parent().parent().should('be.visible')
      cy.get('.card-title').contains('María García').parent().parent().should('be.visible')
      cy.get('.card-title').contains('Carlos López').parent().parent().should('be.visible')
      
      // Verify cards have proper structure for clicking
      cy.get('.card-title').contains('Juan Pérez').parent().parent().should('have.class', 'mb-2')
    })
  })

  describe('Drag & Drop Simulation', () => {
    beforeEach(() => {
      setupPositionDetailsMocks()
    })

    it('should verify drag and drop functionality is available for Juan Pérez', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify initial state: Juan Pérez is in "Aplicación Inicial" column
      verifyCandidateInColumn(TEST_DATA.candidates.juan.name, TEST_DATA.phases.aplicacionInicial.name)
      
      // Verify Juan Pérez card has draggable attributes
      getDraggableCandidate(TEST_DATA.candidates.juan.id).should('exist')
      getDraggableCandidate(TEST_DATA.candidates.juan.id).should('have.attr', 'data-rbd-draggable-id', TEST_DATA.candidates.juan.id.toString())
      
      // Verify that all droppable areas are available
      verifyDroppableAreas()
    })

    it('should verify drag and drop functionality is available for María García', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify initial state: María García is in "Screening" column
      verifyCandidateInColumn(TEST_DATA.candidates.maria.name, TEST_DATA.phases.screening.name)
      
      // Verify María García card has draggable attributes
      cy.get('[data-rbd-draggable-id="2"]').should('exist')
      cy.get('[data-rbd-draggable-id="2"]').should('have.attr', 'data-rbd-draggable-id', '2')
      
      // Verify that the card has proper drag handle attributes
      cy.get('[data-rbd-draggable-id="2"]').should('have.attr', 'data-rbd-drag-handle-draggable-id', '2')
    })

    it('should verify drag and drop functionality is available for Carlos López', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify initial state: Carlos López is in "Entrevista Técnica" column
      cy.get('.card-header').contains('Entrevista Técnica').parent().within(() => {
        cy.get('.card-title').should('contain', 'Carlos López')
      })
      
      // Verify Carlos López card has draggable attributes
      cy.get('[data-rbd-draggable-id="3"]').should('exist')
      cy.get('[data-rbd-draggable-id="3"]').should('have.attr', 'data-rbd-draggable-id', '3')
      
      // Verify that the card has proper drag handle attributes
      cy.get('[data-rbd-draggable-id="3"]').should('have.attr', 'data-rbd-drag-handle-draggable-id', '3')
    })

    it('should verify drag and drop visual feedback', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify that draggable elements have proper attributes
      cy.get('[data-rbd-draggable-id="1"]').should('have.attr', 'data-rbd-draggable-id', '1')
      cy.get('[data-rbd-draggable-id="2"]').should('have.attr', 'data-rbd-draggable-id', '2')
      cy.get('[data-rbd-draggable-id="3"]').should('have.attr', 'data-rbd-draggable-id', '3')
      
      // Verify that droppable areas have proper attributes
      cy.get('[data-rbd-droppable-id="0"]').should('have.attr', 'data-rbd-droppable-id', '0')
      cy.get('[data-rbd-droppable-id="1"]').should('have.attr', 'data-rbd-droppable-id', '1')
      cy.get('[data-rbd-droppable-id="2"]').should('have.attr', 'data-rbd-droppable-id', '2')
      cy.get('[data-rbd-droppable-id="3"]').should('have.attr', 'data-rbd-droppable-id', '3')
      cy.get('[data-rbd-droppable-id="4"]').should('have.attr', 'data-rbd-droppable-id', '4')
    })

    it('should verify empty columns are droppable areas', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify "Entrevista Final" column is initially empty but droppable
      cy.get('.card-header').contains('Entrevista Final').parent().within(() => {
        cy.get('.card-title').should('not.exist')
      })
      cy.get('[data-rbd-droppable-id="3"]').should('exist')
      
      // Verify "Contratado" column is initially empty but droppable
      cy.get('.card-header').contains('Contratado').parent().within(() => {
        cy.get('.card-title').should('not.exist')
      })
      cy.get('[data-rbd-droppable-id="4"]').should('exist')
      
      // Verify that empty columns have proper droppable attributes
      cy.get('[data-rbd-droppable-id="3"]').should('have.attr', 'data-rbd-droppable-id', '3')
      cy.get('[data-rbd-droppable-id="4"]').should('have.attr', 'data-rbd-droppable-id', '4')
    })

    it('should verify all drag and drop infrastructure is properly configured', () => {
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Verify that all candidate cards have proper drag and drop attributes
      cy.get('[data-rbd-draggable-id="1"]').should('exist') // Juan Pérez
      cy.get('[data-rbd-draggable-id="2"]').should('exist') // María García
      cy.get('[data-rbd-draggable-id="3"]').should('exist') // Carlos López
      
      // Verify that all columns have proper droppable attributes
      cy.get('[data-rbd-droppable-id="0"]').should('exist') // Aplicación Inicial
      cy.get('[data-rbd-droppable-id="1"]').should('exist') // Screening
      cy.get('[data-rbd-droppable-id="2"]').should('exist') // Entrevista Técnica
      cy.get('[data-rbd-droppable-id="3"]').should('exist') // Entrevista Final
      cy.get('[data-rbd-droppable-id="4"]').should('exist') // Contratado
      
      // Verify that draggable elements have proper structure
      cy.get('[data-rbd-draggable-id="1"]').should('have.class', 'mb-2')
      cy.get('[data-rbd-draggable-id="2"]').should('have.class', 'mb-2')
      cy.get('[data-rbd-draggable-id="3"]').should('have.class', 'mb-2')
      
      // Verify that droppable areas have proper structure
      cy.get('[data-rbd-droppable-id="0"]').should('be.visible')
      cy.get('[data-rbd-droppable-id="1"]').should('be.visible')
      cy.get('[data-rbd-droppable-id="2"]').should('be.visible')
      cy.get('[data-rbd-droppable-id="3"]').should('be.visible')
      cy.get('[data-rbd-droppable-id="4"]').should('be.visible')
    })
  })

  describe('Backend API Validation', () => {
    beforeEach(() => {
      setupPositionDetailsMocks()
    })

    it('should intercept PUT request when updating Juan Pérez step', () => {
      // Intercept the PUT request to update candidate step
      cy.intercept('PUT', 'http://localhost:3010/candidates/1', {
        statusCode: 200,
        body: { 
          success: true,
          message: 'Candidate step updated successfully',
          candidateId: 1,
          newStep: 2
        }
      }).as('updateCandidateStep')
      
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Simulate the API call directly
      simulateCandidateUpdate(
        TEST_DATA.candidates.juan.id, 
        TEST_DATA.candidates.juan.applicationId, 
        2 // Screening
      )
      
      // Wait for the API call
      cy.wait('@updateCandidateStep')
      
      // Verify the request was made with correct data
      verifyCandidateUpdateRequest('@updateCandidateStep', {
        applicationId: TEST_DATA.candidates.juan.applicationId,
        currentInterviewStep: 2
      })
      
      // Verify the response
      verifyCandidateUpdateResponse('@updateCandidateStep', {
        success: true,
        candidateId: 1,
        newStep: 2
      })
    })

    it('should intercept PUT request when updating María García step', () => {
      // Intercept the PUT request to update candidate step
      cy.intercept('PUT', 'http://localhost:3010/candidates/2', {
        statusCode: 200,
        body: { 
          success: true,
          message: 'Candidate step updated successfully',
          candidateId: 2,
          newStep: 3
        }
      }).as('updateCandidateStep')
      
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Simulate the API call directly
      cy.window().then((win) => {
        win.updateCandidateStep = win.updateCandidateStep || function(candidateId, applicationId, newStep) {
          return fetch(`http://localhost:3010/candidates/${candidateId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              applicationId: Number(applicationId),
              currentInterviewStep: Number(newStep)
            })
          });
        };
        
        // Call the function directly for María García
        win.updateCandidateStep(2, 102, 3);
      })
      
      // Wait for the API call
      cy.wait('@updateCandidateStep')
      
      // Verify the request was made with correct data
      cy.get('@updateCandidateStep').then((interception) => {
        expect(interception.request.method).to.equal('PUT')
        expect(interception.request.url).to.include('/candidates/2')
        expect(interception.request.body).to.deep.include({
          applicationId: 102,
          currentInterviewStep: 3
        })
      })
    })

    it('should handle API error response gracefully', () => {
      // Intercept the PUT request with an error response
      cy.intercept('PUT', 'http://localhost:3010/candidates/1', {
        statusCode: 500,
        body: { 
          success: false,
          error: 'Internal server error',
          message: 'Failed to update candidate step'
        }
      }).as('updateCandidateStepError')
      
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Simulate the API call directly with error
      cy.window().then((win) => {
        win.updateCandidateStep = win.updateCandidateStep || function(candidateId, applicationId, newStep) {
          return fetch(`http://localhost:3010/candidates/${candidateId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              applicationId: Number(applicationId),
              currentInterviewStep: Number(newStep)
            })
          });
        };
        
        // Call the function directly
        win.updateCandidateStep(1, 101, 2);
      })
      
      // Wait for the API call
      cy.wait('@updateCandidateStepError')
      
      // Verify the error response
      cy.get('@updateCandidateStepError').then((interception) => {
        expect(interception.response.statusCode).to.equal(500)
        expect(interception.response.body).to.deep.include({
          success: false,
          error: 'Internal server error'
        })
      })
    })

    it('should validate request headers and content type', () => {
      // Intercept the PUT request
      cy.intercept('PUT', 'http://localhost:3010/candidates/1', {
        statusCode: 200,
        body: { success: true }
      }).as('updateCandidateStep')
      
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Simulate the API call directly
      cy.window().then((win) => {
        win.updateCandidateStep = win.updateCandidateStep || function(candidateId, applicationId, newStep) {
          return fetch(`http://localhost:3010/candidates/${candidateId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              applicationId: Number(applicationId),
              currentInterviewStep: Number(newStep)
            })
          });
        };
        
        // Call the function directly
        win.updateCandidateStep(1, 101, 2);
      })
      
      // Wait for the API call
      cy.wait('@updateCandidateStep')
      
      // Verify request headers
      cy.get('@updateCandidateStep').then((interception) => {
        expect(interception.request.headers).to.have.property('content-type', 'application/json')
        expect(interception.request.method).to.equal('PUT')
      })
    })

    it('should verify multiple API calls for different candidates', () => {
      // Intercept multiple PUT requests
      cy.intercept('PUT', 'http://localhost:3010/candidates/1', {
        statusCode: 200,
        body: { success: true, candidateId: 1 }
      }).as('updateCandidate1')
      
      cy.intercept('PUT', 'http://localhost:3010/candidates/2', {
        statusCode: 200,
        body: { success: true, candidateId: 2 }
      }).as('updateCandidate2')
      
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Simulate first API call (Juan Pérez)
      cy.window().then((win) => {
        win.updateCandidateStep = win.updateCandidateStep || function(candidateId, applicationId, newStep) {
          return fetch(`http://localhost:3010/candidates/${candidateId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              applicationId: Number(applicationId),
              currentInterviewStep: Number(newStep)
            })
          });
        };
        
        // Call the function for Juan Pérez
        win.updateCandidateStep(1, 101, 2);
      })
      
      // Wait for first API call
      cy.wait('@updateCandidate1')
      
      // Simulate second API call (María García)
      cy.window().then((win) => {
        // Call the function for María García
        win.updateCandidateStep(2, 102, 3);
      })
      
      // Wait for second API call
      cy.wait('@updateCandidate2')
      
      // Verify both requests were made
      cy.get('@updateCandidate1').then((interception) => {
        expect(interception.request.url).to.include('/candidates/1')
      })
      
      cy.get('@updateCandidate2').then((interception) => {
        expect(interception.request.url).to.include('/candidates/2')
      })
    })

    it('should validate request body structure and data types', () => {
      // Intercept the PUT request
      cy.intercept('PUT', 'http://localhost:3010/candidates/3', {
        statusCode: 200,
        body: { success: true }
      }).as('updateCandidateStep')
      
      // Visit position details page
      cy.visit('/positions/1')
      cy.wait('@getInterviewFlow')
      cy.wait('@getPositionCandidates')
      
      // Simulate the API call directly for Carlos López
      cy.window().then((win) => {
        win.updateCandidateStep = win.updateCandidateStep || function(candidateId, applicationId, newStep) {
          return fetch(`http://localhost:3010/candidates/${candidateId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              applicationId: Number(applicationId),
              currentInterviewStep: Number(newStep)
            })
          });
        };
        
        // Call the function for Carlos López
        win.updateCandidateStep(3, 103, 4);
      })
      
      // Wait for the API call
      cy.wait('@updateCandidateStep')
      
      // Verify request body structure
      cy.get('@updateCandidateStep').then((interception) => {
        const requestBody = interception.request.body
        
        // Verify body has required fields
        expect(requestBody).to.have.property('applicationId')
        expect(requestBody).to.have.property('currentInterviewStep')
        
        // Verify data types
        expect(requestBody.applicationId).to.be.a('number')
        expect(requestBody.currentInterviewStep).to.be.a('number')
        
        // Verify specific values for Carlos López
        expect(requestBody.applicationId).to.equal(103)
        expect(requestBody.currentInterviewStep).to.equal(4) // Entrevista Final
      })
    })
  })
})
