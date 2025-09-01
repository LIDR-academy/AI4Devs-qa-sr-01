/// <reference types="cypress" />

/**
 * E2E TESTS - Añadir Candidato
 * 
 * Objetivo: Verificar el flujo completo de creación de candidatos
 * Casos de negocio: 
 * - Reclutador añade un nuevo candidato al sistema
 * - Validación de formularios y campos obligatorios
 * - Subida de CV y manejo de archivos
 * Prioridad: ALTA - Funcionalidad core del negocio
 */

describe('👤 E2E Tests - Añadir Candidato', () => {

  beforeEach(() => {
    // Mock de la API de upload de archivos
    cy.intercept('POST', '**/upload', {
      statusCode: 200,
      body: {
        filePath: 'uploads/test-cv.pdf',
        fileType: 'application/pdf'
      }
    }).as('uploadFile');

    // Mock de la API de creación de candidatos
    cy.intercept('POST', '**/candidates', {
      statusCode: 201,
      body: {
        id: '123',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com'
      }
    }).as('createCandidate');

    cy.visit('/add-candidate');
  });

  it('✅ Debe mostrar todos los campos del formulario correctamente', () => {
    // Verificar campos básicos
    cy.get('input[name="firstName"]').should('be.visible');
    cy.get('input[name="lastName"]').should('be.visible');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="phone"]').should('be.visible');
    cy.get('input[name="address"]').should('be.visible');

    // Verificar botones de añadir secciones
    cy.contains('Añadir Educación').should('be.visible');
    cy.contains('Añadir Experiencia Laboral').should('be.visible');

    // Verificar botón de envío
    cy.get('button[type="submit"]').should('contain', 'Enviar');
  });

  it('✅ Debe validar campos obligatorios', () => {
    // Intentar enviar formulario vacío
    cy.get('button[type="submit"]').click();

    // Verificar que los campos requeridos muestran validación
    cy.get('input[name="firstName"]:invalid').should('exist');
    cy.get('input[name="lastName"]:invalid').should('exist');
    cy.get('input[name="email"]:invalid').should('exist');
  });

  it('✅ Debe crear un candidato básico exitosamente', () => {
    // Llenar campos obligatorios
    cy.get('input[name="firstName"]').type('Juan');
    cy.get('input[name="lastName"]').type('Pérez García');
    cy.get('input[name="email"]').type('juan.perez@email.com');
    cy.get('input[name="phone"]').type('+34 666 777 888');
    cy.get('input[name="address"]').type('Calle Mayor 123, Madrid');

    // Enviar formulario
    cy.get('button[type="submit"]').click();

    // Verificar llamada a la API
    cy.wait('@createCandidate').then((interception) => {
      expect(interception.request.body).to.deep.include({
        firstName: 'Juan',
        lastName: 'Pérez García',
        email: 'juan.perez@email.com',
        phone: '+34 666 777 888',
        address: 'Calle Mayor 123, Madrid'
      });
    });

    // Verificar mensaje de éxito
    cy.get('.alert-success').should('contain', 'Candidato añadido con éxito');
  });

  it('✅ Debe añadir y gestionar educación correctamente', () => {
    // Añadir una educación
    cy.contains('Añadir Educación').click();

    // Verificar que aparecen los campos
    cy.get('input[placeholder="Institución"]').should('be.visible');
    cy.get('input[placeholder="Título"]').should('be.visible');

    // Llenar datos de educación
    cy.get('input[placeholder="Institución"]').type('Universidad Complutense Madrid');
    cy.get('input[placeholder="Título"]').type('Ingeniería Informática');

    // Añadir otra educación
    cy.contains('Añadir Educación').click();
    cy.get('input[placeholder="Institución"]').eq(1).type('Máster en Desarrollo Web');

    // Eliminar la segunda educación
    cy.get('button').contains('Eliminar').last().click();

    // Verificar que solo queda una educación
    cy.get('input[placeholder="Institución"]').should('have.length', 1);
  });

  it('✅ Debe añadir y gestionar experiencia laboral correctamente', () => {
    // Añadir experiencia laboral
    cy.contains('Añadir Experiencia Laboral').click();

    // Verificar campos de experiencia
    cy.get('input[placeholder="Empresa"]').should('be.visible');
    cy.get('input[placeholder="Puesto"]').should('be.visible');

    // Llenar datos
    cy.get('input[placeholder="Empresa"]').type('Tech Solutions S.L.');
    cy.get('input[placeholder="Puesto"]').type('Desarrollador Frontend Senior');

    // Verificar que se puede eliminar
    cy.get('button').contains('Eliminar').should('be.visible');
  });

  it('✅ Debe crear un candidato completo con toda la información', () => {
    // Datos básicos
    cy.get('input[name="firstName"]').type('María');
    cy.get('input[name="lastName"]').type('López Rodríguez');
    cy.get('input[name="email"]').type('maria.lopez@email.com');
    cy.get('input[name="phone"]').type('+34 655 444 333');
    cy.get('input[name="address"]').type('Avenida de la Paz 45, Barcelona');

    // Añadir educación
    cy.contains('Añadir Educación').click();
    cy.get('input[placeholder="Institución"]').type('UPC - Universidad Politécnica de Cataluña');
    cy.get('input[placeholder="Título"]').type('Ingeniería de Software');

    // Añadir experiencia laboral
    cy.contains('Añadir Experiencia Laboral').click();
    cy.get('input[placeholder="Empresa"]').type('Innovate Digital');
    cy.get('input[placeholder="Puesto"]').type('Full Stack Developer');

    // Enviar formulario
    cy.get('button[type="submit"]').click();

    // Verificar datos enviados
    cy.wait('@createCandidate').then((interception) => {
      const body = interception.request.body;

      // Verificar datos básicos
      expect(body.firstName).to.equal('María');
      expect(body.lastName).to.equal('López Rodríguez');

      // Verificar educación
      expect(body.educations).to.have.length(1);
      expect(body.educations[0].institution).to.equal('UPC - Universidad Politécnica de Cataluña');

      // Verificar experiencia
      expect(body.workExperiences).to.have.length(1);
      expect(body.workExperiences[0].company).to.equal('Innovate Digital');
    });

    cy.get('.alert-success').should('be.visible');
  });

  it('❌ Debe manejar errores de la API correctamente', () => {
    // Mock de error en la API
    cy.intercept('POST', '**/candidates', {
      statusCode: 400,
      body: { message: 'Email ya existe en el sistema' }
    }).as('createCandidateError');

    // Llenar formulario
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('existing@email.com');

    // Enviar
    cy.get('button[type="submit"]').click();

    // Verificar mensaje de error
    cy.wait('@createCandidateError');
    cy.get('.alert-danger').should('contain', 'Email ya existe en el sistema');
  });

  it('✅ Debe validar formato de email', () => {
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('input[name="email"]').type('email-invalido');

    cy.get('button[type="submit"]').click();

    // Verificar validación HTML5 de email
    cy.get('input[name="email"]:invalid').should('exist');
  });
});