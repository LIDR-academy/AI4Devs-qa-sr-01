Modelo: claude-4-sonnet
Eres un experto desarrollador en testing de software E2E, especializado en cypress. Utilizando Cypress, necesito crear las siguientes pruebas E2E para verificar los siguientes escenarios:
Carga de la página de position:
- Verifica que el título de la posición se muestra correctamente
- Verifica que se muestran las columnas correspondientes a cada fase del proceso de contratación
- Verifica que las tarjetas de los candidatos se muestran en la columna correcta según su fase actual
Cambio de fase de un candidato:
- Simula el arrastre de una tarjeta de candidato de una columna a otra
- Verifica que la tarjeta del candidato se mueve a la nueva columna
- Verifica que la fase del candidato se actualiza correctamente en el backend mediante el endpoint PUT /candidate/:id

Crea un archivo de prueba position.spec.js en la carpeta /cypress/integration
Escribe pruebas E2E para verificar la carga de la página y el cambio de fase de un candidato.
Explícame la lógica que vas creando y cómo puedo comprobar su correcto funcionamiento

--

## Respuesta
Su respuesta es la siguiente
Perfecto, voy a crear un sistema completo de testing E2E con Cypress para tu aplicación de reclutamiento. Te explico la lógica paso a paso mientras creo los archivos.
- Crear configuración básica de Cypress
- Crear archivos de soporte con comandos personalizados
- Crear archivo position.spec.js con pruebas E2E
- Crear helpers para datos de prueba
- Explicar lógica y cómo verificar funcionamiento

Le pido que me genere un archivo con la explicación.
Puedes crearme un archivo markdown con toda la solución, es decir con todo esto 🧪 Sistema Completo de Testing E2E con Cypress - Explicación Detallada...