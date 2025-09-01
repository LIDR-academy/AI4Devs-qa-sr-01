/**
 * PAGE OBJECT - Añadir Candidato
 * 
 * Encapsula los elementos y acciones del formulario de candidatos
 */

class AddCandidatePage {
  // Selectores - Campos básicos
  get firstNameInput() { return cy.get('input[name="firstName"]'); }
  get lastNameInput() { return cy.get('input[name="lastName"]'); }
  get emailInput() { return cy.get('input[name="email"]'); }
  get phoneInput() { return cy.get('input[name="phone"]'); }
  get addressInput() { return cy.get('input[name="address"]'); }

  // Selectores - Botones
  get submitButton() { return cy.get('button[type="submit"]'); }
  get addEducationButton() { return cy.contains('Añadir Educación'); }
  get addExperienceButton() { return cy.contains('Añadir Experiencia Laboral'); }

  // Selectores - Educación
  get institutionInput() { return cy.get('input[placeholder="Institución"]'); }
  get titleInput() { return cy.get('input[placeholder="Título"]'); }

  // Selectores - Experiencia
  get companyInput() { return cy.get('input[placeholder="Empresa"]'); }
  get positionInput() { return cy.get('input[placeholder="Puesto"]'); }

  // Selectores - Mensajes
  get successAlert() { return cy.get('.alert-success'); }
  get errorAlert() { return cy.get('.alert-danger'); }

  // Acciones
  visit() {
    cy.visit('/add-candidate');
    return this;
  }

  fillBasicInfo(candidateData) {
    this.firstNameInput.type(candidateData.firstName);
    this.lastNameInput.type(candidateData.lastName);
    this.emailInput.type(candidateData.email);

    if (candidateData.phone) {
      this.phoneInput.type(candidateData.phone);
    }

    if (candidateData.address) {
      this.addressInput.type(candidateData.address);
    }

    return this;
  }

  addEducation(educationData) {
    this.addEducationButton.click();
    this.institutionInput.last().type(educationData.institution);
    this.titleInput.last().type(educationData.title);
    return this;
  }

  addExperience(experienceData) {
    this.addExperienceButton.click();
    this.companyInput.last().type(experienceData.company);
    this.positionInput.last().type(experienceData.position);
    return this;
  }

  submit() {
    this.submitButton.click();
    return this;
  }

  // Verificaciones
  verifyFormVisible() {
    this.firstNameInput.should('be.visible');
    this.lastNameInput.should('be.visible');
    this.emailInput.should('be.visible');
    this.submitButton.should('be.visible');
    return this;
  }

  verifySuccessMessage() {
    this.successAlert.should('contain', 'Candidato añadido con éxito');
    return this;
  }

  verifyErrorMessage(message) {
    this.errorAlert.should('contain', message);
    return this;
  }
}

export default AddCandidatePage;