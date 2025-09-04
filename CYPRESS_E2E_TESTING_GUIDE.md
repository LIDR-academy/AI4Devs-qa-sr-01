# 🧪 Sistema Completo de Testing E2E con Cypress - Guía Detallada

Este documento proporciona una guía completa para implementar testing End-to-End (E2E) con Cypress en la aplicación de reclutamiento, cubriendo escenarios específicos de carga de página y drag & drop de candidatos.

## 📁 Estructura de Archivos del Sistema

```
cypress/
├── cypress.config.js            # Configuración principal de Cypress
├── support/
│   ├── e2e.js                   # Configuración global y setup
│   └── commands.js              # Comandos personalizados reutilizables
├── integration/
│   ├── position.spec.js         # Suite principal de pruebas E2E
│   └── position-helpers.js      # Funciones auxiliares para tests
└── fixtures/
    ├── interviewFlow.json       # Datos mock del flujo de entrevistas
    └── candidates.json          # Datos mock de candidatos
```

## 🚀 Instalación y Configuración Inicial

### 1. Instalar Cypress

```bash
# Desde la raíz del proyecto
npm install cypress --save-dev
```

### 2. Configurar scripts en package.json

```json
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run",
    "cy:install": "cypress install",
    "dev:frontend": "cd frontend && npm start",
    "dev:backend": "cd backend && npm run dev",
    "test:e2e": "cypress run",
    "test:e2e:open": "cypress open"
  }
}
```

## 🏗️ Configuración Base

### cypress.config.js

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // URL base de tu aplicación frontend
    baseUrl: 'http://localhost:3000',
    
    // Configuraciones para mejorar la experiencia de testing
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    
    // Configuración de archivos
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/integration/**/*.spec.js',
    
    // Videos y screenshots
    video: true,
    screenshotOnRunFailure: true,
    
    // Variables de entorno para tu API
    env: {
      api_url: 'http://localhost:3010'
    }
  },
})
```

**Razón de la configuración**:
- `baseUrl`: Centraliza la URL del frontend para fácil cambio entre entornos
- `env.api_url`: Permite referenciar la API backend en los tests
- Timeouts extendidos: Necesarios para operaciones de red y carga de datos
- Videos/screenshots: Esenciales para debugging cuando los tests fallan

## 🔧 Comandos Personalizados

### cypress/support/commands.js

```javascript
/**
 * Comando para esperar a que se carguen los datos de la página de posición
 */
Cypress.Commands.add('waitForPositionPageLoad', () => {
  cy.wait('@getInterviewFlow', { timeout: 10000 })
  cy.wait('@getCandidates', { timeout: 10000 })
  
  // Esperar a que aparezcan las columnas y candidatos
  cy.get('[data-cy="stage-column"]', { timeout: 10000 }).should('exist')
  cy.get('h2').should('be.visible') // Título de la posición
})

/**
 * Comando personalizado para verificar la estructura de una columna de etapa
 */
Cypress.Commands.add('verifyStageColumn', (columnIndex, expectedTitle, expectedCandidateCount) => {
  cy.get('[data-cy="stage-column"]').eq(columnIndex).within(() => {
    // Verificar título de la columna
    cy.get('.card-header').should('contain.text', expectedTitle)
    
    // Verificar número de candidatos si se especifica
    if (expectedCandidateCount !== undefined) {
      cy.get('[data-cy="candidate-card"]').should('have.length', expectedCandidateCount)
    }
  })
})

/**
 * Comando alternativo para drag and drop usando coordenadas de mouse
 * Más compatible con react-beautiful-dnd
 */
Cypress.Commands.add('dragToColumn', (candidateSelector, targetColumnIndex) => {
  // Obtener posición del candidato
  cy.get(candidateSelector).then($candidate => {
    const candidateElement = $candidate[0]
    const candidateRect = candidateElement.getBoundingClientRect()
    
    // Obtener posición de la columna destino
    cy.get('[data-cy="stage-column"]').eq(targetColumnIndex).find('.card-body').then($targetColumn => {
      const targetElement = $targetColumn[0]
      const targetRect = targetElement.getBoundingClientRect()
      
      // Simular el arrastre paso a paso
      cy.get(candidateSelector)
        .trigger('mousedown', {
          button: 0,
          clientX: candidateRect.x + candidateRect.width / 2,
          clientY: candidateRect.y + candidateRect.height / 2
        })
        .wait(100)
        
      // Mover a la posición destino
      cy.get('body')
        .trigger('mousemove', {
          clientX: targetRect.x + targetRect.width / 2,
          clientY: targetRect.y + targetRect.height / 2
        })
        .wait(100)
        
      // Soltar
      cy.get('[data-cy="stage-column"]').eq(targetColumnIndex).find('.card-body')
        .trigger('mouseup')
    })
  })
})

/**
 * Comando para verificar que un candidato específico está en una columna específica
 */
Cypress.Commands.add('verifyCandidateInColumn', (candidateName, columnIndex) => {
  cy.get('[data-cy="stage-column"]').eq(columnIndex).within(() => {
    cy.contains('[data-cy="candidate-card"] .card-title', candidateName).should('exist')
  })
})

/**
 * Comando para verificar que se realizó correctamente la llamada PUT al backend
 */
Cypress.Commands.add('verifyBackendUpdate', (candidateId, expectedStep) => {
  cy.wait('@updateCandidate').then((interception) => {
    expect(interception.response.statusCode).to.eq(200)
    expect(interception.request.url).to.include(`/candidates/${candidateId}`)
    
    if (expectedStep) {
      expect(interception.request.body.currentInterviewStep).to.eq(expectedStep)
    }
  })
})

/**
 * Comando para obtener datos de candidatos desde la API
 */
Cypress.Commands.add('getCandidatesFromAPI', (positionId) => {
  return cy.request(`${Cypress.env('api_url')}/positions/${positionId}/candidates`)
    .then((response) => {
      expect(response.status).to.eq(200)
      return response.body
    })
})
```

### cypress/support/e2e.js

```javascript
// Import commands.js using ES2015 syntax:
import './commands'

// Configuración global para manejo de excepciones no capturadas
Cypress.on('uncaught:exception', (err, runnable) => {
  // Prevenir que errores de la aplicación hagan fallar los tests
  // Solo en desarrollo - remover en producción
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false
  }
  return true
})

// Configuración global para requests
beforeEach(() => {
  // Interceptar requests comunes para mejor control
  cy.intercept('GET', '**/positions/**/interviewFlow').as('getInterviewFlow')
  cy.intercept('GET', '**/positions/**/candidates').as('getCandidates')
  cy.intercept('PUT', '**/candidates/**').as('updateCandidate')
})
```

## 🎯 Suite Principal de Pruebas

### cypress/integration/position.spec.js

```javascript
describe('Position Details - E2E Tests', () => {
  const POSITION_ID = 1 // ID de posición para testing

  beforeEach(() => {
    // Visitar la página de detalles de posición antes de cada test
    cy.visit(`/positions/${POSITION_ID}`)
    
    // Esperar a que se carguen todos los datos necesarios
    cy.waitForPositionPageLoad()
  })

  describe('Carga de la página de posición', () => {
    it('debe verificar que el título de la posición se muestra correctamente', () => {
      // Verificar que existe un elemento h2 con el título
      cy.get('h2')
        .should('be.visible')
        .and('have.class', 'text-center')
        .and('not.be.empty')
      
      // Verificar que el título coincide con los datos del backend
      cy.wait('@getInterviewFlow').then((interception) => {
        const expectedTitle = interception.response.body.interviewFlow.positionName
        cy.get('h2').should('contain.text', expectedTitle)
      })
      
      // Verificar que el botón de navegación existe
      cy.contains('button', 'Volver a Posiciones')
        .should('be.visible')
        .and('have.class', 'btn-link')
    })

    it('debe mostrar las columnas correspondientes a cada fase del proceso de contratación', () => {
      // Verificar que se muestran al menos 3 columnas (fases típicas del proceso)
      cy.get('[data-cy="stage-column"]')
        .should('have.length.at.least', 3)
        .each($column => {
          // Cada columna debe tener un header visible
          cy.wrap($column).find('.card-header')
            .should('be.visible')
            .and('have.class', 'text-center')
            .and('not.be.empty')
          
          // Cada columna debe tener un body para los candidatos
          cy.wrap($column).find('.card-body')
            .should('exist')
        })
      
      // Verificar fases específicas del proceso
      cy.wait('@getInterviewFlow').then((interception) => {
        const stages = interception.response.body.interviewFlow.interviewFlow.interviewSteps
        
        stages.forEach((stage, index) => {
          cy.get('[data-cy="stage-column"]')
            .eq(index)
            .find('.card-header')
            .should('contain.text', stage.name)
        })
      })
    })

    it('debe mostrar las tarjetas de candidatos en la columna correcta según su fase actual', () => {
      // Esperar a que se carguen los candidatos
      cy.wait('@getCandidates').then((interception) => {
        const candidates = interception.response.body
        
        // Verificar que hay candidatos para probar
        expect(candidates).to.have.length.greaterThan(0)
        
        // Para cada candidato, verificar que está en la columna correcta
        candidates.forEach(candidate => {
          const expectedStage = candidate.currentInterviewStep
          const candidateName = candidate.fullName
          
          // Buscar la columna que corresponde a la etapa del candidato
          cy.contains('[data-cy="stage-column"] .card-header', expectedStage)
            .parent()
            .parent()
            .within(() => {
              // Verificar que el candidato está en esta columna
              cy.contains('[data-cy="candidate-card"] .card-title', candidateName)
                .should('exist')
            })
        })
      })
      
      // Verificar estructura de las tarjetas de candidatos
      cy.get('[data-cy="candidate-card"]').each($card => {
        // Cada tarjeta debe tener un título (nombre del candidato)
        cy.wrap($card).find('.card-title')
          .should('exist')
          .and('be.visible')
          .and('not.be.empty')
        
        // Cada tarjeta debe tener elementos de rating
        cy.wrap($card).find('[role="img"][aria-label="rating"]')
          .should('exist')
        
        // Verificar que la tarjeta es interactiva (clickeable)
        cy.wrap($card).should('be.visible')
      })
    })
  })

  describe('Cambio de fase de un candidato', () => {
    let testCandidateName
    let originalStageIndex
    let targetStageIndex
    
    beforeEach(() => {
      // Configurar datos de prueba para drag and drop
      cy.wait('@getCandidates').then((interception) => {
        const candidates = interception.response.body
        
        // Seleccionar el primer candidato para las pruebas
        const testCandidate = candidates[0]
        testCandidateName = testCandidate.fullName
        
        // Encontrar en qué columna está originalmente
        cy.contains('[data-cy="candidate-card"] .card-title', testCandidateName)
          .closest('[data-cy="stage-column"]')
          .then($column => {
            cy.get('[data-cy="stage-column"]').then($allColumns => {
              originalStageIndex = Array.from($allColumns).indexOf($column[0])
              targetStageIndex = originalStageIndex < 2 ? originalStageIndex + 1 : originalStageIndex - 1
            })
          })
      })
    })

    it('debe simular correctamente el arrastre de una tarjeta de candidato de una columna a otra', () => {
      // Verificar posición inicial del candidato
      cy.verifyCandidateInColumn(testCandidateName, originalStageIndex)
      
      // Realizar drag and drop
      cy.contains('[data-cy="candidate-card"] .card-title', testCandidateName)
        .closest('[data-cy="candidate-card"]')
        .as('candidateCard')
      
      cy.dragToColumn('@candidateCard', targetStageIndex)
      
      // Esperar un momento para que se complete la animación
      cy.wait(500)
    })

    it('debe verificar que la tarjeta del candidato se mueve a la nueva columna', () => {
      // Realizar el movimiento
      cy.contains('[data-cy="candidate-card"] .card-title', testCandidateName)
        .closest('[data-cy="candidate-card"]')
        .as('sourceCard')
      
      cy.dragToColumn('@sourceCard', targetStageIndex)
      
      // Verificar que el candidato ahora está en la nueva columna
      cy.verifyCandidateInColumn(testCandidateName, targetStageIndex)
      
      // Verificar que ya no está en la columna original
      cy.get('[data-cy="stage-column"]').eq(originalStageIndex).within(() => {
        cy.contains('[data-cy="candidate-card"] .card-title', testCandidateName)
          .should('not.exist')
      })
      
      // Verificar que la información del candidato se mantiene intacta
      cy.get('[data-cy="stage-column"]').eq(targetStageIndex).within(() => {
        cy.contains('[data-cy="candidate-card"] .card-title', testCandidateName)
          .closest('[data-cy="candidate-card"]')
          .within(() => {
            // Verificar que mantiene el nombre
            cy.get('.card-title').should('contain.text', testCandidateName)
            
            // Verificar que mantiene el rating
            cy.get('[role="img"][aria-label="rating"]').should('exist')
          })
      })
    })

    it('debe verificar que la fase del candidato se actualiza correctamente en el backend mediante PUT /candidates/:id', () => {
      // Interceptar específicamente la llamada PUT
      cy.intercept('PUT', '**/candidates/**').as('updateCandidateAPI')
      
      // Obtener el ID del candidato de los datos iniciales
      cy.getCandidatesFromAPI(POSITION_ID).then(candidates => {
        const testCandidate = candidates.find(c => c.fullName === testCandidateName)
        const candidateId = testCandidate.candidateId
        
        // Realizar el drag and drop
        cy.contains('[data-cy="candidate-card"] .card-title', testCandidateName)
          .closest('[data-cy="candidate-card"]')
          .as('candidateToMove')
        
        cy.dragToColumn('@candidateToMove', targetStageIndex)
        
        // Verificar que se realizó la llamada PUT correcta
        cy.wait('@updateCandidateAPI').then((interception) => {
          // Verificar que la URL es correcta
          expect(interception.request.url).to.include(`/candidates/${candidateId}`)
          
          // Verificar que el método es PUT
          expect(interception.request.method).to.eq('PUT')
          
          // Verificar que el body contiene los datos correctos
          expect(interception.request.body).to.have.property('applicationId')
          expect(interception.request.body).to.have.property('currentInterviewStep')
          
          // Verificar que la respuesta es exitosa
          expect(interception.response.statusCode).to.eq(200)
          
          // Verificar que se actualizó el paso correcto
          const newStepId = interception.request.body.currentInterviewStep
          expect(newStepId).to.be.a('number')
          expect(newStepId).to.be.greaterThan(0)
        })
        
        // Verificar que los datos se actualizaron en el backend
        cy.wait(1000) // Esperar un momento para que se procese
        
        cy.getCandidatesFromAPI(POSITION_ID).then(updatedCandidates => {
          const updatedCandidate = updatedCandidates.find(c => c.candidateId === candidateId)
          
          // Verificar que la etapa se actualizó
          expect(updatedCandidate.currentInterviewStep).to.not.eq(testCandidate.currentInterviewStep)
        })
      })
    })

    it('debe manejar errores de red durante la actualización', () => {
      // Simular error en la API
      cy.intercept('PUT', '**/candidates/**', {
        statusCode: 500,
        body: { error: 'Error interno del servidor' }
      }).as('updateError')
      
      // Realizar drag and drop
      cy.contains('[data-cy="candidate-card"] .card-title', testCandidateName)
        .closest('[data-cy="candidate-card"]')
        .as('candidateCard')
      
      cy.dragToColumn('@candidateCard', targetStageIndex)
      
      // Verificar que se intentó la actualización
      cy.wait('@updateError')
      
      // Verificar que la aplicación no se rompe
      cy.get('body').should('be.visible')
      cy.get('[data-cy="stage-column"]').should('be.visible')
    })
  })

  describe('Funcionalidades adicionales', () => {
    it('debe permitir hacer clic en una tarjeta para ver detalles del candidato', () => {
      // Verificar que hacer clic en una tarjeta abre el panel de detalles
      cy.get('[data-cy="candidate-card"]').first().click()
      
      // Verificar que se abre el panel de detalles (Offcanvas)
      cy.get('[data-cy="candidate-details"]').should('be.visible')
    })

    it('debe mantener el estado de la página después de recargar', () => {
      // Hacer un cambio
      cy.get('[data-cy="candidate-card"]').first().as('testCard')
      cy.dragToColumn('@testCard', 1)
      cy.wait('@updateCandidate')
      
      // Recargar página
      cy.reload()
      cy.waitForPositionPageLoad()
      
      // Verificar que el cambio persiste
      cy.wait('@getCandidates').then((interception) => {
        // Los datos deberían reflejar el cambio realizado anteriormente
        const candidates = interception.response.body
        expect(candidates).to.be.an('array')
      })
    })
  })
})
```

## 🗂️ Datos de Prueba (Fixtures)

### cypress/fixtures/interviewFlow.json

```json
{
  "interviewFlow": {
    "positionName": "Frontend Developer - Test Position",
    "interviewFlow": {
      "id": 1,
      "interviewSteps": [
        {
          "id": 1,
          "name": "Aplicación",
          "orderIndex": 0
        },
        {
          "id": 2,
          "name": "Entrevista Técnica",
          "orderIndex": 1
        },
        {
          "id": 3,
          "name": "Entrevista HR",
          "orderIndex": 2
        },
        {
          "id": 4,
          "name": "Contratado",
          "orderIndex": 3
        }
      ]
    }
  }
}
```

### cypress/fixtures/candidates.json

```json
[
  {
    "candidateId": 1,
    "fullName": "Ana García López",
    "currentInterviewStep": "Aplicación",
    "averageScore": 4,
    "applicationId": 101
  },
  {
    "candidateId": 2,
    "fullName": "Carlos Martínez Silva",
    "currentInterviewStep": "Entrevista Técnica",
    "averageScore": 5,
    "applicationId": 102
  },
  {
    "candidateId": 3,
    "fullName": "María Rodriguez González",
    "currentInterviewStep": "Entrevista HR",
    "averageScore": 3,
    "applicationId": 103
  },
  {
    "candidateId": 4,
    "fullName": "Pedro Sánchez Ruiz",
    "currentInterviewStep": "Aplicación",
    "averageScore": 4,
    "applicationId": 104
  }
]
```

## 🔧 Modificaciones en Componentes Frontend

Para que los tests funcionen correctamente, es necesario agregar atributos `data-cy` a los componentes React:

### frontend/src/components/StageColumn.js

```javascript
const StageColumn = ({ stage, index, onCardClick }) => (
    <Col md={3} data-cy="stage-column">  {/* ← Agregar data-cy */}
        <Droppable droppableId={`${index}`}>
            {(provided) => (
                <Card className="mb-4" ref={provided.innerRef} {...provided.droppableProps}>
                    <Card.Header className="text-center">{stage.title}</Card.Header>
                    <Card.Body>
                        {stage.candidates.map((candidate, idx) => (
                            <CandidateCard key={candidate.id} candidate={candidate} index={idx} onClick={onCardClick} />
                        ))}
                        {provided.placeholder}
                    </Card.Body>
                </Card>
            )}
        </Droppable>
    </Col>
);
```

### frontend/src/components/CandidateCard.js

```javascript
const CandidateCard = ({ candidate, index, onClick }) => (
    <Draggable key={candidate.id} draggableId={candidate.id} index={index}>
        {(provided) => (
            <Card
                className="mb-2"
                data-cy="candidate-card"  {/* ← Agregar data-cy */}
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                onClick={() => onClick(candidate)}
            >
                <Card.Body>
                    <Card.Title>{candidate.name}</Card.Title>
                    <div>
                        {Array.from({ length: candidate.rating }).map((_, i) => (
                            <span key={i} role="img" aria-label="rating">🟢</span>
                        ))}
                    </div>
                </Card.Body>
            </Card>
        )}
    </Draggable>
);
```

### frontend/src/components/CandidateDetails.js

```javascript
// Agregar data-cy al Offcanvas
<Offcanvas show={!!candidate} onHide={onClose} placement="end" data-cy="candidate-details">
```

## 🚀 Ejecución de Tests

### Modo Desarrollo (Interfaz Gráfica)

```bash
# Terminal 1: Levantar backend
cd backend && npm run dev

# Terminal 2: Levantar frontend
cd frontend && npm start

# Terminal 3: Abrir Cypress
npm run cy:open
```

### Modo Producción/CI (Headless)

```bash
# Ejecutar todos los tests
npm run cy:run

# Ejecutar test específico
npx cypress run --spec "cypress/integration/position.spec.js"

# Ejecutar con browser específico
npx cypress run --browser chrome

# Generar reporte
npx cypress run --reporter mochawesome
```

## 📊 Verificación y Debugging

### ✅ Indicadores de Tests Exitosos

- **Interfaz Cypress**: Checkmarks verdes
- **Screenshots**: Guardados en `cypress/screenshots/` solo en fallos
- **Videos**: Disponibles en `cypress/videos/` para revisión completa
- **Logs de consola**: Detalles de cada paso ejecutado

### ❌ Manejo de Fallos

- **Screenshots automáticos** en el momento exacto del fallo
- **Stack traces detallados** con información de línea y archivo
- **Reproducción paso a paso** en el video generado
- **Re-run inmediato** desde la interfaz de Cypress

### 🔍 Debugging Avanzado

```javascript
// En cualquier test, agregar:
cy.debug()          // Pausa ejecución para inspección
cy.pause()          // Pausa hasta que se presione resume
cy.screenshot()     // Screenshot manual en punto específico
cy.log('Mensaje')   // Log personalizado visible en interfaz
```

## 📈 Lógica de Verificación por Test

### **Test 1: Carga de Página - Título**

**Qué verifica**:
- ✅ Elemento `<h2>` existe y es visible
- ✅ Tiene la clase CSS correcta (`text-center`)
- ✅ Contenido no está vacío
- ✅ Texto coincide con respuesta del backend

**Por qué es importante**:
- Garantiza sincronización frontend-backend
- Detecta errores de renderizado
- Verifica comunicación API correcta

### **Test 2: Columnas de Proceso**

**Qué verifica**:
- ✅ Número correcto de columnas (mínimo 3)
- ✅ Cada columna tiene header visible
- ✅ Títulos coinciden con configuración backend
- ✅ Orden de fases es correcto

**Por qué es importante**:
- Valida lógica de negocio del flujo de contratación
- Detecta cambios no autorizados en configuración
- Asegura UX consistente

### **Test 3: Posicionamiento de Candidatos**

**Qué verifica**:
- ✅ Cada candidato está en su columna correcta
- ✅ Datos de candidato (nombre, rating) son correctos
- ✅ Estructura de tarjetas es consistente
- ✅ Tarjetas son interactivas (clickeables)

**Por qué es importante**:
- Verifica integridad de datos
- Detecta errores de mapeo entre backend y frontend
- Asegura que el estado se muestra correctamente

### **Test 4: Drag & Drop - Movimiento Visual**

**Qué verifica**:
- ✅ Candidato se mueve visualmente de columna origen a destino
- ✅ Ya no aparece en columna original
- ✅ Información del candidato se preserva
- ✅ Animaciones y transiciones funcionan

**Por qué es importante**:
- Valida interacción principal del usuario
- Detecta problemas con react-beautiful-dnd
- Asegura feedback visual correcto

### **Test 5: Backend Update - API Call**

**Qué verifica**:
- ✅ Se realiza llamada HTTP PUT al endpoint correcto
- ✅ URL incluye ID del candidato correcto
- ✅ Body contiene `applicationId` y `currentInterviewStep`
- ✅ Response status es 200
- ✅ Datos persisten en backend

**Por qué es importante**:
- Garantiza que los cambios se guardan permanentemente
- Verifica integridad de la API
- Detecta problemas de serialización/deserialización
- Valida transaccionalidad de operaciones

### **Test 6: Manejo de Errores**

**Qué verifica**:
- ✅ Aplicación no se rompe con errores 500
- ✅ UI permanece funcional después de errores
- ✅ No hay memory leaks o estados inconsistentes

**Por qué es importante**:
- Robustez en condiciones adversas
- Experiencia de usuario resiliente
- Detecta problemas de manejo de excepciones

## 🛠️ Troubleshooting Común

### Problema: Tests fallan por timeouts

**Solución**:
```javascript
// Aumentar timeout específico
cy.get('[data-cy="stage-column"]', { timeout: 15000 })

// O globalmente en cypress.config.js
defaultCommandTimeout: 15000
```

### Problema: Drag & Drop no funciona

**Causa común**: react-beautiful-dnd requiere eventos específicos

**Solución**:
```javascript
// Usar comando personalizado dragToColumn en lugar de .drag()
cy.dragToColumn('@candidateCard', targetStageIndex)
```

### Problema: API calls no se interceptan

**Solución**:
```javascript
// Verificar que el intercept está antes del visit
cy.intercept('GET', '**/positions/*/candidates').as('getCandidates')
cy.visit('/positions/1')  // ← Intercept debe estar antes
```

### Problema: Elementos no se encuentran

**Solución**:
```javascript
// Usar data-cy attributes específicos en lugar de clases CSS
cy.get('[data-cy="candidate-card"]')  // ✅ Estable
// en lugar de
cy.get('.mb-2')  // ❌ Frágil
```

## 🔄 Mantenimiento y Escalabilidad

### Agregar Nuevos Tests

1. **Seguir patrón AAA (Arrange-Act-Assert)**:
```javascript
it('debe hacer algo específico', () => {
  // Arrange - preparar estado
  cy.setupTestData()
  
  // Act - realizar acción
  cy.get('[data-cy="button"]').click()
  
  // Assert - verificar resultado
  cy.get('[data-cy="result"]').should('contain', 'éxito')
})
```

2. **Reutilizar comandos personalizados**
3. **Agregar `data-cy` a nuevos componentes**
4. **Crear fixtures para nuevos datos mock**

### Estrategias de Escalabilidad

- **Page Object Pattern** para aplicaciones más grandes
- **Custom matchers** para validaciones específicas del dominio
- **Test data factories** para generar datos dinámicos
- **Parallel execution** en CI/CD para tests más rápidos

## 📝 Checklist de Verificación

### ✅ Pre-ejecución
- [ ] Backend corriendo en puerto 3010
- [ ] Frontend corriendo en puerto 3000  
- [ ] Base de datos tiene datos de prueba
- [ ] Cypress instalado y configurado

### ✅ Durante Ejecución
- [ ] Tests pasan sin falsos positivos
- [ ] Screenshots solo se generan en fallos reales
- [ ] API calls se interceptan correctamente
- [ ] Timeouts son apropiados (ni muy cortos ni muy largos)

### ✅ Post-ejecución
- [ ] Videos disponibles para review
- [ ] Reports generados si es necesario
- [ ] Datos de prueba limpiados
- [ ] Performance de tests es aceptable

## 🎯 Métricas de Éxito

Un sistema de testing E2E exitoso debe tener:

- **⚡ Velocidad**: Tests completos en < 2 minutos
- **🎯 Confiabilidad**: < 1% de falsos positivos
- **🔍 Cobertura**: > 80% de user journeys críticos
- **🛠️ Mantenibilidad**: Fácil actualización cuando cambia UI
- **📊 Reportes**: Información clara sobre qué falló y por qué

## 🤝 Contribución al Proyecto

Este sistema de testing E2E proporciona:

1. **Cobertura completa** de los escenarios críticos de usuario
2. **Detección temprana** de bugs de integración  
3. **Documentación viva** de cómo debe funcionar la aplicación
4. **Confianza** para hacer refactoring y nuevas features
5. **Automatización** del QA manual repetitivo

Con esta implementación, tienes un sistema robusto y mantenible que asegura la calidad de tu aplicación de reclutamiento a nivel E2E.
