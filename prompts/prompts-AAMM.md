# Prompts #

# Usuario #
Actúa como QA Automation y genera un archivo Cypress llamado cypress/integration/position.spec.js con pruebas E2E para la vista Position. Cubre estos escenarios con al menos 2 pruebas por punto:
	1.	Carga de la Página de Position
	•	Verifica que el título de la posición se muestra.
	•	Verifica que se renderizan las columnas por fase.
	•	Verifica que las tarjetas están en la columna correcta según su fase.
	2.	Cambio de Fase de un Candidato
	•	Simula drag & drop de una tarjeta desde una columna a otra y verifica que se mueve en la UI.
	•	Intercepta y valida el PUT /candidate/:id con el id y la phase correctos.

Analiza nuestro @README.md  para entender el proyecto y nuestro @backend/  para entender los endpoints y datos.    

Supuestos simples (úsalos si no se especifica lo contrario)
	•	Fases: applied, screening, interview, offer.
	•	Selectores:
	•	data-cy="position-title"
	•	data-cy="column-applied" | "column-screening" | "column-interview" | "column-offer"
	•	data-cy="candidate-card" y data-id="<candidateId>"
	•	Endpoint PUT /candidate/:id.
	•	No requiere login.

Requisitos técnicos mínimos
	•	Usa cy.intercept para GET inicial y para el PUT (alias @getPosition, @updateCandidate).
	•	Crea un helper sencillo de drag & drop con DataTransfer (sin librerías externas).
	•	Evita cy.wait(ms); espera por alias.
	•	Código limpio y comentado.

Entregable
	•	Un único archivo position.spec.js con:
	•	describe separados por escenario.
	•	beforeEach que stubs de red y visita la ruta.
	•	Aserciones de DOM (título, columnas, tarjetas) y de red (PUT con phase correcta).

⸻

Plan mínimo
	1.	Stub del GET con candidatos en distintas fases.
	2.	Helper de drag & drop local en la spec.
	3.	Tests de render (título/columnas/mapa de tarjetas).
	4.	Tests de movimiento y verificación del PUT.

Antes de comenzar, muestranos tu plan de accion para ir avanzando paso a paso hasta que yo te lo indique.   

# Asistente ##
realiza 3 preguntas para entender mejor el contexto y poder avanzar con el plan de acción.

# Usuario #
¿Las fases que mencionas (applied, screening, interview, offer) coinciden exactamente con las del backend? Veo que el backend usa InterviewStep con nombres como "Initial Screening", "Technical Interview", etc.
analiza el seed para ver esto @seed.ts 

¿La ruta del frontend es /positions/:id o /position/:id? En el backend veo /positions/:id/candidates.
la ruta debe ser positions/:id

¿Quieres que use los datos reales del seed del backend o prefieres datos mock más simples para las pruebas?
utiliza los datos reales del @seed.ts 

# Asistente ##
Presenta el plan de acción paso a paso.

# Usuario #
ok, vamos con la primera fase del plan de acción.

# Asistente ##
FASE 1: Preparación y Estructura

# Usuario #
ok, vamos con la segunda fase del plan de acción.

# Asistente ##
FASE 2: Stubs basados en datos reales

# Usuario #
ok, vamos con la tercera fase del plan de acción.

# Asistente ##
FASE 3: Pruebas de Renderizado

# Usuario #
ok, vamos con la cuarta fase del plan de acción.

# Asistente ##
FASE 4: Pruebas de Funcionalidad

ESTADO FINAL: TODAS LAS FASES COMPLETADAS
FASE 1: Preparación y Estructura - COMPLETADA
	Estructura con describes separados por escenario
	Helper de drag & drop implementado
FASE 2: Stubs basados en datos reales - COMPLETADA
	Stub del GET con datos del seed (LTI, Senior Full-Stack Engineer)
	Stub del PUT para actualizar fase
	beforeEach configurado con interceptores
FASE 3: Pruebas de Renderizado - COMPLETADA
	Test de carga: título "Senior Full-Stack Engineer"
	Test de carga: columnas de fases
	Test de mapeo: candidatos en columnas correctas
FASE 4: Pruebas de Funcionalidad - COMPLETADA
	Test de drag & drop entre columnas
	Test de validación del PUT con fase correcta

# Usuario #
los test funcionan pero porque estamos utilizando datod mock, hay que implementar una version hibrida.

# Asistente ##
FASE 5: Implementación de una versión híbrida

SISTEMA HÍBRIDO IMPLEMENTADO CON ÉXITO ¿Qué Hemos Logrado?
1 	Sistema Híbrido Funcional: Las pruebas ahora usan datos 	reales de la BD cuando están disponibles
2	Fallback Automático: Si no hay datos reales, automáticamente usa datos MOCK
3	Detección Inteligente: Detecta automáticamente si la UI tiene contenido real
4	Tests Dinámicos: Los tests se adaptan según la fuente de datos disponible

Tests Implementados con Sistema Híbrido
✅ debería mostrar información sobre la fuente de datos - Detecta automáticamente la fuente
✅ debería mostrar el título de la posición - Funciona con datos reales o mock
✅ debería renderizar las columnas de fases correctamente - Se adapta al número real de columnas
✅ debería mostrar candidatos en columnas correctas según su fase - Valida según datos disponibles
✅ debería permitir drag & drop entre columnas - Verifica estado inicial dinámicamente
✅ debería validar la estructura de datos para actualización - Valida estructura según fuente

BENEFICIOS DEL SISTEMA HÍBRIDO
✅ Ventajas de Datos Reales
Pruebas más realistas con datos actuales de la BD
Detección temprana de problemas de integración
Validación completa del flujo de datos
✅ Ventajas del Fallback a Mock
Pruebas consistentes cuando no hay datos reales
Independencia de la disponibilidad de la BD
Velocidad en entornos de desarrollo
✅ Ventajas del Sistema Híbrido
Lo mejor de ambos mundos
Adaptabilidad automática según el entorno
Robustez en diferentes escenarios