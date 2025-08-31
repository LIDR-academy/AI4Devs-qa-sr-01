Prompt #1

vamos a crear AGENTS.md con las convenciones, principios, mejores practicas que se usan en el proyecto para estar alineados a la hora de crear nuevas funcionalidades al igual que el testing tanto unitario como E2E por ejemplo con cypress, ten en cuenta que se se de seguir siempre principios SOLID, KISS, DRY, valorar patrones de diseño seimpre y cuando agreguen valor a la solución y no introduzcan complejidades adicionales


Prompt #2

estaba pensando complementarel fichero AGENTS con los siguientes puntos relacionados con los tests E2E:

1. incluir @https://github.com/badeball/cypress-cucumber-preprocessor  para usar BDD haciendo los tests con gherkins 

2. Asi utilizarimos cypress + cucumber + gherking y tendriamos un entorno de BDD que permitiria organizar los tests de forma que todos tanto desarrollo como QA como stakeholders esten alineados

Prompt #3

# Prompt para Senior SWE (E2E) — Cypress + Cucumber (badeball)

**Rol:** Eres un/a Senior Software Engineer especializado/a en testing E2E con Cypress y Cucumber. Dominas `@badeball/cypress-cucumber-preprocessor` y prácticas anti-flakiness.  
**Fuente de verdad:** Respeta estrictamente `AGENTS.md`.

## Objetivo
Implementar E2E que validen el tablero de **Position** y el **cambio de fase** de candidatos, comprobando UI y backend (`PUT /candidate/:id`).

---

## 🔶 FASE 0 OBLIGATORIA: Plan de Implementación y Verificación (antes de codificar)
Antes de escribir *features*, *steps* o utilidades, **elabora un plan** y somételo a revisión. No inicies la implementación hasta que el plan esté aprobado. El plan debe incluir:

1) **Alcance y supuestos**
- Escenarios cubiertos y fuera de alcance.
- Dependencias (datos, auth, DnD, `data-testid`), riesgos y mitigaciones.

2) **Matriz de cobertura (Checklist rastreable)**
- Para cada escenario/step: **Selectores**, **intercepts**, **fixtures/datos**, **comandos custom**, **aserciones** y **criterios de verificación**.
- Formato tabla con casillas `[ ]` para marcar al completar. Cada ítem debe indicar la **prueba de humo** asociada (cómo validar que está bien implementado).

3) **Plan incremental (paso a paso)**
Ejemplo de hitos y validaciones:
- **Paso 1: Setup & sanity**  
  [ ] Cucumber preprocessor operativo, un feature dummy pasa en local/CI.  
  **Verificación:** `cypress run` exit code 0; reporte en CI.
- **Paso 2: Login/sesión**  
  [ ] `cy.session`/`login()` funcionando.  
  **Verificación:** página de Position se carga autenticada.
- **Paso 3: Selectores estables**  
  [ ] Definir/añadir `data-testid` necesarios (título/columnas/cards).  
  **Verificación:** `getByTestId` encuentra todos sin fallback frágil.
- **Paso 4: Carga de Position**  
  [ ] Asersiones de título y columnas.  
  **Verificación:** columnas esperadas renderizadas.
- **Paso 5: Mapeo de cards por fase**  
  [ ] Cards aparecen en su columna.  
  **Verificación:** assertions con `within()` por fase.
- **Paso 6: Drag&Drop**  
  [ ] Comando robusto `dragAndDrop`.  
  **Verificación:** movimiento visual consistente.
- **Paso 7: Intercept PUT /candidate/:id**  
  [ ] Alias + validación de URL/body/status/response.  
  **Verificación:** `@updateCandidate` status 200 y payload correcto.
- **Paso 8: Estabilidad**  
  [ ] Sin `cy.wait(ms)`. Retries naturales de Cypress + esperas por red/DOM.  
  **Verificación:** 10 ejecuciones headless sin flakes.
- **Paso 9: Reportería & CI**  
  [ ] Reporter y artifacts según `AGENTS.md`.  
  **Verificación:** artefactos disponibles en pipeline.

4) **Criterios de aceptación por paso**
- Qué evidencia (logs, screenshots, videos) aporta cada paso.
- Qué condiciones bloquean avanzar al siguiente paso.

5) **Plan de reversión y cambios al DOM**
- PR mínimo para `data-testid`/DnD si faltan; cómo aislarlo del PR de tests.

> ✅ **Definition of Ready (DoR):** El plan está documentado, versionado en `TESTING_PLAN.md`, con checklist y criterios de verificación.  
> ✅ **Gate:** No se acepta PR de tests sin el `TESTING_PLAN.md` actualizado y referenciado en la descripción del PR.

---

## Alcance (escenarios a cubrir)
1) **Carga de la Página de Position**
- Título de la posición visible.
- Columnas de cada fase mostradas.
- Tarjetas en la columna correcta según fase actual.

2) **Cambio de Fase de un Candidato**
- Drag & drop de una tarjeta entre columnas.
- La tarjeta aparece en la nueva columna.
- El backend se actualiza vía `PUT /candidate/:id` con payload correcto y **200**.

## Requisitos técnicos y convenciones
- **Stack:** Cypress + `@badeball/cypress-cucumber-preprocessor`. TS si el repo lo usa.
- **Estructura:** `cypress/e2e/**/*.feature`; steps en `cypress/e2e/**/steps/*.ts`; comandos en `support/commands.ts`.
- **Selectores:** `data-testid`/`data-cy` obligatorios; propone PR si faltan.
- **Red:** `cy.intercept('PUT', '**/candidate/*').as('updateCandidate')` y validación de URL/body/status/response.
- **DnD:** Comando custom con HTML5 `DataTransfer` (sin bibliotecas salvo permiso en `AGENTS.md`).
- **Anti-flakiness:** Sin sleeps; usar alias/`should`/`within`.
- **Accesibilidad básica:** roles/labels si aplica.
- **Reporte:** conforme `AGENTS.md`.

## Entregables
1) `TESTING_PLAN.md` (plan aprobado) con checklist marcada.
2) Features:
   - `position_page.feature`
   - `candidate_phase_change.feature`
3) Steps reutilizables + comandos (`login`, `getByTestId`, `dragAndDrop`).
4) Intercepts helpers opcionales.
5) `TESTING.md` con cómo ejecutar (local/CI) y convenciones de `data-testid`.

## DoD
- Plan ejecutado con checklist completa.
- Escenarios pasan en local y CI, sin flakes.
- UI y red validadas.
- Reportes/artefactos en CI.
- Código tipado/formateado.

## Gherkin de referencia (ajusta testids/fases reales)

**`cypress/e2e/position/position_page.feature`**
```gherkin
Feature: Position board loads and displays candidates by phase

  Background:
    Given I am logged in
    And I open the Position page for "Senior Backend Engineer"

  Scenario: The position title and columns are displayed
    Then I see the position title "Senior Backend Engineer"
    And I see the following columns:
      | Sourced   |
      | Screening |
      | Interview |
      | Offer     |
      | Hired     |

  Scenario: Candidates appear under the correct phase
    Then candidate "Alice Johnson" is shown in column "Screening"
    And candidate "Bob Smith" is shown in column "Interview"
```

**`cypress/e2e/position/candidate_phase_change.feature`**
```gherkin
Feature: Change candidate phase via drag and drop

  Background:
    Given I am logged in
    And I open the Position page for "Senior Backend Engineer"
    And I start watching candidate updates

  Scenario: Moving a candidate from Screening to Interview updates UI and backend
    When I drag candidate "Alice Johnson" from column "Screening" to column "Interview"
    Then the card for "Alice Johnson" appears in column "Interview"
    And a PUT request is sent to "/candidate/:id" with phase "Interview"
    And the request succeeds with status 200
    And the UI reflects candidate "Alice Johnson" in phase "Interview"
```

## Plantilla mínima de `TESTING_PLAN.md` (para rellenar)
```markdown
# TESTING_PLAN — Position Board E2E

## 1. Alcance y supuestos
- Escenarios incluidos: [...]
- Fuera de alcance: [...]
- Dependencias: auth, DnD, testids, datos.
- Riesgos/Mitigaciones: [...]

## 2. Matriz de cobertura
| Escenario | Step | Selector | Intercept | Fixture/Dato | Aserción | Verificación | Estado |
|---|---|---|---|---|---|---|---|
| Carga Position | ver título | position-title | - | pos=Senior BE | texto exacto | aparece h1 | [ ] |
| Carga Position | ver columnas | column[data-phase] | - | fases: [...] | length y labels | render | [ ] |
| Mapeo | card por fase | candidate-card[id] | GET board | candidatos | dentro de columna | within() | [ ] |
| Cambio fase | drag&drop | card/column | PUT /candidate/:id | phase=Interview | UI movida | wait @updateCandidate | [ ] |

## 3. Plan incremental (pasos y criterios)
- Paso 1: Setup → **OK cuando** feature dummy pasa en CI.
- Paso 2: Login → **OK cuando** sesión estable en test.
- Paso 3: Selectores → **OK cuando** todos los testids existen.
- Paso 4: [...]
- Paso 7: PUT validado → **OK cuando** status 200 + payload correcto.

## 4. Evidencias por paso
- Screenshots/videos: rutas a artifacts.
- Logs: enlaces de CI.

## 5. Cambios al DOM necesarios
- Añadir `data-testid="position-title"`, `data-testid="column" data-phase="<PHASE>"`, `data-testid="candidate-card" data-candidate-id="<ID>"`.

## 6. Reversión
- PR separado para DOM; feature flags si aplica.
```
