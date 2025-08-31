# **Guía de Tests E2E con Cypress - Proyecto LTI**

## **Descripción General**

Esta guía documenta la implementación de tests end-to-end (E2E) usando Cypress para el sistema de gestión de candidatos y entrevistas LTI. Los tests están diseñados siguiendo las mejores prácticas de testing y la arquitectura Domain-Driven Design (DDD) del proyecto.

## **Estructura de Directorios**

```
cypress/
├── component/                    # Tests de componentes individuales
│   ├── AddCandidateForm.cy.tsx
│   └── RecruiterDashboard.cy.tsx
├── e2e/                         # Tests end-to-end
│   ├── candidates/              # Tests de gestión de candidatos
│   │   └── candidate-management.cy.ts
│   ├── dashboard/               # Tests del dashboard principal
│   │   └── recruiter-dashboard.cy.ts
│   ├── positions/               # Tests de gestión de posiciones
│   │   ├── position-management.cy.ts
│   │   └── position-details-loading.cy.ts    # ✅ IMPLEMENTADO
│   └── workflow/                # Tests de flujo de trabajo
│       └── candidate-workflow.cy.ts
├── fixtures/                    # Datos de prueba
│   ├── test-data.json
│   └── position-details.json   # ✅ NUEVO - Datos para Position Details
├── plugins/                     # Configuración de plugins
│   └── index.ts
├── support/                     # Archivos de soporte
│   ├── commands.ts              # Comandos personalizados
│   ├── component.ts             # Soporte para tests de componentes
│   └── e2e.ts                  # Soporte para tests e2e
├── types/                       # Definiciones de tipos TypeScript
│   └── index.d.ts
├── cypress.config.ts            # Configuración principal de Cypress
└── README.md                    # Esta documentación
```

## **Tests Implementados**

### **✅ Position Details Loading (`position-details-loading.cy.ts`)**

Este test verifica la carga correcta de la página de detalles de una posición:

**Funcionalidades Verificadas:**
1. **Título de la Posición**: Verifica que el título se muestra correctamente y está centrado
2. **Columnas de Fases**: Verifica que se muestran las 4 columnas del proceso de contratación
3. **Tarjetas de Candidatos**: Verifica que los candidatos aparecen en la columna correcta según su fase actual
4. **Ratings**: Verifica que los ratings se muestran correctamente (estrellas)
5. **Navegación**: Verifica que el botón de volver funciona correctamente
6. **Manejo de Listas Vacías**: Verifica el comportamiento cuando no hay candidatos

**Estructura del Test:**
```typescript
describe('Position Details Page Loading', () => {
  // Setup con mocks de API
  beforeEach(() => {
    cy.intercept('GET', '**/positions/1/interviewFlow', { fixture: 'position-details.json' })
    cy.intercept('GET', '**/positions/1/candidates', { fixture: 'position-details.json' })
    cy.visit('/positions/1')
  })
  
  // Tests individuales para cada funcionalidad
  it('should display the position title correctly')
  it('should display interview stage columns for each phase')
  it('should display candidate cards in the correct columns')
  it('should handle empty candidate lists gracefully')
  it('should display navigation elements correctly')
  it('should display candidate ratings correctly')
})
```

**Datos de Prueba:**
- **Posición**: Senior Software Engineer
- **Fases**: Aplicación Recibida, Entrevista Inicial, Entrevista Técnica, Oferta
- **Candidatos**: 4 candidatos distribuidos en diferentes fases con ratings variados

## **Configuración de Cypress**

### **Archivo de Configuración Principal (`cypress.config.ts`)**

```typescript
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',        // URL del frontend
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    env: {
      apiUrl: 'http://localhost:3001'        // URL del backend
    }
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts'
  }
})
```

### **Variables de Entorno**

- **Frontend**: `http://localhost:3000` (React development server)
- **Backend**: `http://localhost:3001` (Express server)
- **Base de Datos**: PostgreSQL (configurada en docker-compose)

## **Tipos de Tests**

### **1. Tests E2E (End-to-End)**

Los tests E2E simulan el comportamiento completo del usuario a través de toda la aplicación:

- **`candidate-management.cy.ts`**: Gestión completa de candidatos
- **`position-management.cy.ts`**: Gestión de posiciones y ofertas
- **`position-details-loading.cy.ts`**: ✅ **IMPLEMENTADO** - Carga de página de detalles de posición
- **`recruiter-dashboard.cy.ts`**: Dashboard principal del reclutador
- **`candidate-workflow.cy.ts`**: Flujo de trabajo de candidatos

### **2. Tests de Componentes**

Los tests de componentes verifican el comportamiento individual de cada componente:

- **`AddCandidateForm.cy.tsx`**: Formulario de agregar candidatos
- **`RecruiterDashboard.cy.tsx`**: Dashboard principal

## **Comandos Personalizados**

### **Comandos Disponibles**

```typescript
// Autenticación
cy.loginAsRecruiter()

// Gestión de datos de prueba
cy.createTestCandidate()
cy.createTestPosition()
cy.cleanupTestData()
```

### **Implementación de Comandos**

Los comandos personalizados se implementan en `cypress/support/commands.ts` y pueden incluir:

- Operaciones de base de datos
- Autenticación y autorización
- Creación y limpieza de datos de prueba
- Operaciones comunes de la aplicación

## **Datos de Prueba**

### **Estructura de Fixtures**

```json
{
  "candidates": {
    "valid": { /* datos válidos */ },
    "invalid": { /* datos inválidos */ }
  },
  "positions": {
    "valid": { /* datos válidos */ }
  },
  "companies": {
    "valid": { /* datos válidos */ }
  }
}
```

### **Fixture Específico: `position-details.json`**

```json
{
  "interviewFlow": {
    "interviewFlow": {
      "interviewFlow": {
        "interviewSteps": [
          { "id": 1, "name": "Aplicación Recibida" },
          { "id": 2, "name": "Entrevista Inicial" },
          { "id": 3, "name": "Entrevista Técnica" },
          { "id": 4, "name": "Oferta" }
        ]
      },
      "positionName": "Senior Software Engineer"
    }
  },
  "candidates": [
    {
      "candidateId": 1,
      "fullName": "John Doe",
      "averageScore": 4,
      "currentInterviewStep": "Aplicación Recibida"
    }
    // ... más candidatos
  ]
}
```

### **Gestión de Datos de Prueba**

- **Setup**: Crear datos necesarios antes de cada test
- **Teardown**: Limpiar datos después de cada test
- **Isolación**: Cada test debe ser independiente

## **Patrones de Testing**

### **1. Page Object Model (POM)**

```typescript
class CandidatePage {
  // Elementos de la página
  get firstNameInput() { return cy.get('[data-testid="candidate-first-name"]') }
  get lastNameInput() { return cy.get('[data-testid="candidate-last-name"]') }
  
  // Acciones de la página
  fillCandidateForm(candidate: TestCandidate) {
    this.firstNameInput.type(candidate.firstName)
    this.lastNameInput.type(candidate.lastName)
  }
}
```

### **2. Data-Driven Testing**

```typescript
const testCandidates = [
  { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
  { firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' }
]

testCandidates.forEach(candidate => {
  it(`should create candidate ${candidate.firstName}`, () => {
    // Test implementation
  })
})
```

### **3. API Testing**

```typescript
// Verificar respuestas de API
cy.request('POST', '/api/candidates', candidateData)
  .its('status')
  .should('eq', 201)

// Mock de respuestas de API
cy.intercept('GET', '/api/candidates', { fixture: 'candidates.json' })
```

## **Mejores Prácticas**

### **1. Nomenclatura y Organización**

- **Archivos de test**: `feature-name.cy.ts`
- **Describe blocks**: Describir la funcionalidad que se está probando
- **Test cases**: Usar nombres descriptivos que expliquen el comportamiento esperado

### **2. Selectores**

```typescript
// ✅ Bueno: Usar data-testid
cy.get('[data-testid="submit-button"]')

// ❌ Malo: Usar selectores frágiles
cy.get('.btn-primary')
cy.get('#submit')
```

### **3. Assertions**

```typescript
// ✅ Bueno: Assertions específicas
cy.get('[data-testid="candidate-name"]').should('contain', 'John Doe')
cy.url().should('include', '/candidates')

// ❌ Malo: Assertions genéricas
cy.get('body').should('contain', 'John Doe')
```

### **4. Manejo de Datos**

```typescript
beforeEach(() => {
  // Setup: Crear datos de prueba
  cy.createTestCandidate()
})

afterEach(() => {
  // Teardown: Limpiar datos
  cy.cleanupTestData()
})
```

## **Integración con CI/CD**

### **Scripts de Package.json**

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "test:e2e": "start-server-and-test start http://localhost:3000 cypress:run"
  }
}
```

### **Configuración de GitHub Actions**

```yaml
- name: Run E2E Tests
  run: |
    npm run test:e2e
  env:
    CI: true
```

## **Debugging y Troubleshooting**

### **Comandos Útiles**

```bash
# Abrir Cypress en modo interactivo
npm run cypress:open

# Ejecutar tests en modo headless
npm run cypress:run

# Ejecutar tests específicos
npx cypress run --spec "cypress/e2e/positions/position-details-loading.cy.ts"
```

### **Logs y Screenshots**

- **Screenshots**: Se capturan automáticamente en fallos
- **Videos**: Se graban por defecto (configurable)
- **Logs**: Usar `cy.log()` para debugging

### **Common Issues**

1. **Timing Issues**: Usar `cy.wait()` o assertions de estado
2. **Data Isolation**: Asegurar limpieza de datos entre tests
3. **Environment Variables**: Verificar configuración de URLs

## **Mantenimiento y Evolución**

### **Revisión Regular**

- Actualizar tests cuando cambie la funcionalidad
- Revisar y optimizar selectores
- Mantener datos de prueba actualizados

### **Métricas de Testing**

- Cobertura de tests
- Tiempo de ejecución
- Tasa de fallos
- Mantenibilidad del código de test

## **Recursos Adicionales**

- [Documentación oficial de Cypress](https://docs.cypress.io/)
- [Mejores prácticas de testing](https://docs.cypress.io/guides/references/best-practices)
- [Patrones de testing](https://docs.cypress.io/guides/references/testing-strategies)
- [API de Cypress](https://docs.cypress.io/api/api/table-of-contents)

---

**Nota**: Esta documentación debe mantenerse actualizada conforme evolucione el proyecto y se implementen nuevas funcionalidades de testing.
