
### Primer prompt de metaprompting
Eres un experto en prompting y en desarrollo mediante IA. Has de generar prompts para una IA que es un experto en testing y QA con Cypress. Vamos a trabajar en testing E2E en base a los siguientes puntos utilizando, como he mencionado antes la librería cypress. Los prompts serán enviados a un Agente de cursor con contexto completo del proyexto. Divide el trabajo en tickets para realizar un trabajo progresivo.

Crear Pruebas E2E para la Interfaz "position":

Debes crear pruebas E2E para verificar los siguientes escenarios:

1.Carga de la Página de Position: 
Verifica que el título de la posición se muestra correctamente.
Verifica que se muestran las columnas correspondientes a cada fase del proceso de contratación.
Verifica que las tarjetas de los candidatos se muestran en la columna correcta según su fase actual.
2.Cambio de Fase de un Candidato: 
Simula el arrastre de una tarjeta de candidato de una columna a otra.
Verifica que la tarjeta del candidato se mueve a la nueva columna.
Verifica que la fase del candidato se actualiza correctamente en el backend mediante el endpoint PUT /candidate/:id.

### Prompt 1:
Quiero que actúes como un experto en QA y Cypress.
Tu tarea es crear pruebas E2E con Cypress para la interfaz position, validando los siguientes escenarios. El proyecto ya está cargado en el workspace, por lo que puedes usar el contexto disponible.

Ticket 1: Configuración básica de entorno de testing

Configurar Cypress en el proyecto (si no está configurado).

Crear estructura inicial de tests en cypress/e2e/.

Verificar que los tests corren correctamente en local.


### Prompt 2:

Ticket 2: Prueba de carga de página

Crear un spec position.spec.js.

Visitar la página de position.

Verificar que el título de la posición se renderiza correctamente.

### Prompt 3:

Ticket 3: Validación de columnas del proceso

En position.spec.js, añadir pruebas para:

Verificar que todas las columnas del proceso de contratación se muestran.

Asegurar que los nombres de las fases son correctos y visibles.

### Prompt 4:

Ticket 4: Validación de candidatos en columnas correctas

Crear pruebas que verifiquen que cada tarjeta de candidato aparece en la columna que corresponde a su fase actual.

Usar selectores estables (data-testid) o nombres de fases como referencia.

### Prompt 5:

Ticket 5: Simulación de drag & drop de candidatos

Implementar prueba que simule el arrastre de un candidato de una columna a otra.

Verificar que la tarjeta se mueve visualmente a la columna de destino.  

### Prompt 6:

Ticket 6: Validación de actualización en backend

Interceptar el endpoint PUT /candidate/:id con cy.intercept.

Simular el drag & drop.

Validar que la request enviada incluye la nueva fase.

Verificar que la respuesta del backend es correcta y que la UI refleja el cambio.


### Prompt 7:

Ticket 7: Refactor y mejores prácticas

Revisar duplicación de código (uso de beforeEach).

Crear funciones auxiliares para localizar columnas o candidatos.

Dejar el spec preparado para futuras ampliaciones (ej. más fases o más interacciones).