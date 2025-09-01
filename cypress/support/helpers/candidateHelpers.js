/**
 * HELPERS - Candidatos
 * 
 * Funciones de utilidad para tests relacionados con candidatos
 */

/**
 * Genera datos de candidato aleatorios para tests
 */
export const generateRandomCandidate = () => {
  const firstNames = ['Juan', 'María', 'Carlos', 'Ana', 'Luis', 'Carmen', 'José', 'Isabel'];
  const lastNames = ['García', 'López', 'Martín', 'Sánchez', 'Pérez', 'Rodríguez', 'Fernández'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const randomNum = Math.floor(Math.random() * 1000);

  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@test.com`,
    phone: `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
    address: `Calle Test ${randomNum}, Madrid`
  };
};

/**
 * Datos de candidato válido para tests
 */
export const validCandidateData = {
  firstName: 'Juan',
  lastName: 'Pérez García',
  email: 'juan.perez@test.com',
  phone: '+34 666 777 888',
  address: 'Calle Mayor 123, Madrid'
};

/**
 * Datos de educación de ejemplo
 */
export const sampleEducation = {
  institution: 'Universidad Complutense Madrid',
  title: 'Ingeniería Informática'
};

/**
 * Datos de experiencia de ejemplo
 */
export const sampleExperience = {
  company: 'Tech Solutions S.L.',
  position: 'Desarrollador Frontend Senior'
};

/**
 * Configura interceptores comunes para tests de candidatos
 */
export const setupCandidateInterceptors = () => {
  cy.intercept('POST', '**/candidates', {
    statusCode: 201,
    body: { id: '123', message: 'Candidate created successfully' }
  }).as('createCandidate');

  cy.intercept('POST', '**/upload', {
    statusCode: 200,
    body: {
      filePath: 'uploads/test-cv.pdf',
      fileType: 'application/pdf'
    }
  }).as('uploadFile');
};

/**
 * Verifica que una llamada a la API contiene los datos esperados
 */
export const verifyCandidateApiCall = (interception, expectedData) => {
  const body = interception.request.body;

  expect(body.firstName).to.equal(expectedData.firstName);
  expect(body.lastName).to.equal(expectedData.lastName);
  expect(body.email).to.equal(expectedData.email);

  if (expectedData.phone) {
    expect(body.phone).to.equal(expectedData.phone);
  }

  if (expectedData.address) {
    expect(body.address).to.equal(expectedData.address);
  }
};