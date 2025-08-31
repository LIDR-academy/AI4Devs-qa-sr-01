# TESTING PLAN — Position Board E2E

## 📋 Plan de Implementación E2E: Position Board & Candidate Phase Change

**Versión:** 1.0  
**Fuente de verdad:** `AGENTS.md`  
**Stack:** Cypress + `@badeball/cypress-cucumber-preprocessor` + TypeScript  

---

## 1. Alcance y Supuestos

### ✅ Escenarios Incluidos
1. **Carga de Position Board**
   - Título de posición visible
   - Columnas de fases mostradas correctamente
   - Candidatos mapeados en fase correcta

2. **Cambio de Fase de Candidato (Drag & Drop)**
   - Movimiento visual de tarjeta entre columnas
   - Actualización backend vía `PUT /candidates/:id`
   - Validación de payload y respuesta 200
   - Sincronización UI-Backend

### ❌ Fuera de Alcance
- Autenticación compleja (se simula sesión válida)
- Gestión de errores de red (timeouts, 500s)
- Validaciones complejas de permisos
- Performance testing (cargas masivas)

### 🔗 Dependencias Identificadas
- **Auth:** Sesión válida simulada con `cy.session`
- **Data:** Posición existente con candidatos en diferentes fases
- **DnD:** `react-beautiful-dnd` funcional
- **Testids:** Elementos identificables para selectores estables

### ⚠️ Riesgos y Mitigaciones
| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| DnD flaky | Alta | Alto | Comando custom robusto con retries |
| Falta testids | Media | Alto | PR previo para añadir identificadores |
| Race conditions | Media | Medio | Intercepts + aliases para sincronización |
| CI inconsistency | Baja | Alto | Headless + recordings + artifacts |

---

## 2. Matriz de Cobertura

| Escenario | Step | Selector Requerido | Intercept | Fixture/Dato | Aserción | Verificación | Estado |
|-----------|------|-------------------|-----------|--------------|----------|--------------|---------|
| **Carga Position** |  |  |  |  |  |  |  |
| - Ver título | Position title visible | `[data-testid="position-title"]` | GET positions/:id | position: "Senior Backend Engineer" | `contain.text` | H2 render con título exacto | [ ] |
| - Ver columnas | All phases shown | `[data-testid="stage-column"]` | GET positions/:id/interviewFlow | interviewSteps: array | `.should('have.length', 5)` | 5 columnas renderizadas | [ ] |
| - Mapeo candidatos | Cards in correct column | `[data-testid="candidate-card"]` | GET positions/:id/candidates | candidates con currentInterviewStep | `within()` columna específica | Card en fase correcta | [ ] |
| **Cambio Fase** |  |  |  |  |  |  |  |
| - Drag & drop | Move card visually | card + column testids | - | - | Cambio visual DOM | Tarjeta en nueva columna | [ ] |
| - PUT request | Backend update | - | `PUT /candidates/:id` | {applicationId, currentInterviewStep} | `@updateCandidate.status` | Status 200 + payload válido | [ ] |
| - UI sync | Frontend reflects change | `[data-testid="candidate-card"]` | - | - | `within()` nueva columna | Persistencia visual post-request | [ ] |

### 🧪 Pruebas de Humo por Item
- **Position title:** `cy.get('[data-testid="position-title"]').should('contain', 'Senior Backend Engineer')`
- **Column count:** `cy.get('[data-testid="stage-column"]').should('have.length', 5)`
- **Card mapping:** `cy.get('[data-testid="stage-column"]').eq(1).within(() => cy.get('[data-testid="candidate-card"]').should('contain', 'Alice Johnson'))`
- **Drag success:** `cy.get('[data-testid="candidate-card"][data-candidate-id="1"]').should('be.visible').parent().should('have.attr', 'data-stage-id', '3')`
- **PUT validation:** `cy.wait('@updateCandidate').its('request.body').should('deep.include', {applicationId: 1, currentInterviewStep: 3})`

---

## 3. Plan Incremental (Paso a Paso)

### **🏗️ Paso 1: Setup & Sanity**
**Objetivo:** Cypress + Cucumber operativo con feature dummy
**Criterio de éxito:** `cypress run` exit code 0; dummy.feature pasa en CI
```bash
cd frontend && npm install --save-dev cypress @badeball/cypress-cucumber-preprocessor
```
**Verificación:** ✅ Feature dummy ejecuta sin errores
**Estimación:** 2h
**Bloqueante:** Configuración de preprocessor
**Estado:** [ ]

### **🔐 Paso 2: Login/Sesión**
**Objetivo:** `cy.session` funcional para mantener auth state
**Criterio de éxito:** Navigation a Position board con sesión persistente
```typescript
cy.session('user-auth', () => {
  cy.visit('/login')
  cy.get('[data-testid="email"]').type('test@test.com')
  cy.get('[data-testid="password"]').type('password')
  cy.get('[data-testid="login-button"]').click()
})
```
**Verificación:** ✅ `/positions/1` accesible sin re-login
**Estimación:** 3h
**Bloqueante:** Login endpoint + frontend auth state
**Estado:** [ ]

### **🎯 Paso 3: Selectores Estables**
**Objetivo:** Añadir/verificar `data-testid` necesarios en DOM
**Criterio de éxito:** Todos los `getByTestId` encuentran elementos sin fallback
**Testids requeridos:**
- `position-title` → H2 con nombre de posición
- `stage-column` + `data-stage-id` → Columnas de fases
- `candidate-card` + `data-candidate-id` → Tarjetas de candidatos

**Verificación:** ✅ Selectores no requieren fallback `.contains()` 
**Estimación:** 4h (PR + testing)
**Bloqueante:** Acceso a codebase React
**Estado:** [ ]

### **📋 Paso 4: Carga de Position**
**Objetivo:** Aserciones básicas de título y columnas
**Criterio de éxito:** Feature `position_page.feature` pasa al 100%
```gherkin
Then I see the position title "Senior Backend Engineer"
And I see the following columns:
  | Sourced   |
  | Screening |
  | Interview |
  | Offer     |
  | Hired     |
```
**Verificación:** ✅ Tests pasan con datos reales de seeded DB
**Estimación:** 3h
**Bloqueante:** Data seeding strategy
**Estado:** [ ]

### **🗂️ Paso 5: Mapeo de Cards por Fase**
**Objetivo:** Candidatos aparecen en columna correcta según `currentInterviewStep`
**Criterio de éxito:** Assertions con `within()` por fase específica
```typescript
cy.get('[data-testid="stage-column"][data-stage-id="2"]')
  .within(() => {
    cy.get('[data-testid="candidate-card"]').should('contain', 'Alice Johnson')
  })
```
**Verificación:** ✅ Cards en fases correctas sin misplacement
**Estimación:** 4h
**Bloqueante:** Consistent test data
**Estado:** [ ]

### **🖱️ Paso 6: Drag & Drop Command**
**Objetivo:** Comando custom robusto para DnD con `react-beautiful-dnd`
**Criterio de éxito:** Movimiento visual consistente en 10 ejecuciones
```typescript
cy.dragAndDrop(
  '[data-testid="candidate-card"][data-candidate-id="1"]',
  '[data-testid="stage-column"][data-stage-id="3"]'
)
```
**Verificación:** ✅ No flakes en movimientos; element positions correctas
**Estimación:** 6h (investigación DnD + implementation)
**Bloqueante:** Understanding react-beautiful-dnd DOM structure
**Estado:** [ ]

### **🌐 Paso 7: Intercept PUT /candidates/:id**
**Objetivo:** Validación completa de request/response
**Criterio de éxito:** Status 200 + payload correcto en `@updateCandidate`
```typescript
cy.intercept('PUT', '**/candidates/*').as('updateCandidate')
// ... drag action
cy.wait('@updateCandidate').then((interception) => {
  expect(interception.response.statusCode).to.eq(200)
  expect(interception.request.body).to.deep.include({
    applicationId: 1,
    currentInterviewStep: 3
  })
})
```
**Verificación:** ✅ Backend receives correct data; response validates
**Estimación:** 4h
**Bloqueante:** Network timing + response format understanding
**Estado:** [ ]

### **⚡ Paso 8: Estabilidad Anti-Flakiness**
**Objetivo:** Sin `cy.wait(ms)`; only retries naturales + network/DOM waits
**Criterio de éxito:** 10 ejecuciones headless consecutivas sin fallos
**Técnicas:**
- `cy.intercept` + `cy.wait('@alias')` para network
- `.should()` con automatic retries para DOM
- `cy.within()` para scope assertions
**Verificación:** ✅ CI runs estables; no timeouts arbitrarios
**Estimación:** 5h (refactoring + tuning)
**Bloqueante:** Previous steps stability
**Estado:** [ ]

### **📊 Paso 9: Reportería & CI Integration**
**Objetivo:** Artifacts según `AGENTS.md`; mochawesome reports
**Criterio de éxito:** Screenshots/videos en CI; readable HTML reports
```yaml
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: cypress-screenshots
    path: frontend/cypress/screenshots
```
**Verificación:** ✅ Artifacts disponibles en GitHub Actions
**Estimación:** 3h
**Bloqueante:** CI pipeline access
**Estado:** [ ]

---

## 4. Criterios de Aceptación por Paso

### **Evidencias Requeridas**
- **Screenshots:** Failure states con contexto visual claro
- **Videos:** Recording completo de drag & drop sequences
- **Logs:** Network intercepts con request/response details
- **CI Artifacts:** Links públicos a test results + videos

### **Condiciones Bloqueantes**
- **Paso 1-2:** No se avanza sin Cypress + auth funcional
- **Paso 3:** PR de testids debe estar merged antes de step 4
- **Paso 6:** DnD command debe pasar 5/5 local runs antes de CI
- **Paso 8:** Zero flakiness gate: 10 consecutive passes required

---

## 5. Cambios al DOM Necesarios

### **PR Mínimo para data-testids**
```jsx
// frontend/src/components/PositionDetails.js
<h2 data-testid="position-title" className="text-center mb-4">
  {positionName}
</h2>

// frontend/src/components/StageColumn.js  
<div data-testid="stage-column" data-stage-id={stage.id}>
  {/* column content */}
</div>

// frontend/src/components/CandidateCard.js
<div data-testid="candidate-card" data-candidate-id={candidate.id}>
  {/* card content */}
</div>
```

### **Aislamiento del PR de Tests**
- **Feature flag:** `ENABLE_E2E_TESTIDS` for development
- **Minimal footprint:** Only essential attributes, no visual changes
- **Separate branch:** `feature/e2e-testids` merged before test implementation

### **Plan de Reversión**
- **Rollback DOM changes:** Remove data-testids if tests fail persistently
- **Fallback strategy:** Use `.contains()` + text selectors (less stable)
- **Environment gates:** Testids only in test/staging environments

---

## 6. Definition of Ready (DoR)

✅ **Plan documentado** en `TESTING_PLAN.md` versionado en git  
✅ **Checklist validado** por tech lead + QA  
✅ **Criterios de verificación** definidos para cada paso  
✅ **Dependencias identificadas** y owners asignados  
✅ **Timeline estimado** con buffer para investigación  

## 7. Definition of Done (DoD)

✅ **Plan ejecutado** con checklist 100% completada  
✅ **Features pasan** en local + CI environment  
✅ **Zero flakiness** en 10 ejecuciones consecutivas  
✅ **UI + Network validados** con assertions completas  
✅ **Artifacts disponibles** en CI (screenshots/videos/reports)  
✅ **Código tipado** según AGENTS.md standards  
✅ **Documentation updated** con execution instructions  

---

## 8. Entregables

1. **`TESTING_PLAN.md`** ← Este documento (✅ Completed)
2. **Features:**
   - `frontend/cypress/e2e/position/position_page.feature`
   - `frontend/cypress/e2e/position/candidate_phase_change.feature`
3. **Step definitions:**
   - `frontend/cypress/e2e/position/steps/position_steps.ts`
   - `frontend/cypress/e2e/position/steps/candidate_steps.ts`
4. **Support:**
   - `frontend/cypress/support/commands.ts` (login, dragAndDrop)
   - `frontend/cypress/support/page-objects/PositionBoardPage.ts`
5. **Documentation:**
   - `frontend/cypress/README.md` (execution instructions)

---

## 9. Execution Commands

```bash
# Setup (one-time)
cd frontend && npm install --save-dev cypress @badeball/cypress-cucumber-preprocessor

# Development
npm run e2e:dev          # Auto-start servers + interactive Cypress
npm run cypress:open     # Manual Cypress UI

# CI/Testing
npm run cypress:run                                           # All tests headless
npm run cypress:run --spec "cypress/e2e/position/**/*.feature" # Position tests only
npm run cypress:run --browser chrome --headed                # Visual debugging

# Specific feature
npx cypress run --spec "frontend/cypress/e2e/position/position_page.feature"
```

---

**🚀 READY FOR IMPLEMENTATION APPROVAL**

> ⚠️ **Gate:** No code implementation should begin until this plan is reviewed and approved by tech lead + QA stakeholders.
