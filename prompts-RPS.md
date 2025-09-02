# Prompts ejercicio

## Herramienta utilizada
Github Copilot en modo agente con Claude 4

## Prompt utilizado
### Primer prompt
Eres un experto desarrollador en react y en desarrollo de testing E2E con cypress. Como primera tarea, quiero que analices el proyecto, el cual esta bien exlpicado en el README, y las carpetas fonrtend y backend, las cuales contienen el codigo de la aplicacion

### Segudno prompt
Quiero realizar las siguientes pruebas, este es el enunciado del ejercicio:

Crear Pruebas E2E para la Interfaz "position":

Debes crear pruebas E2E para verificar los siguientes escenarios:
1. Carga de la Página de Position:
- Verifica que el título de la posición se muestra correctamente.
- Verifica que se muestran las columnas correspondientes a cada fase del proceso de contratación.
- Verifica que las tarjetas de los candidatos se muestran en la columna correcta según su fase actual.

2. Cambio de Fase de un Candidato:
- Simula el arrastre de una tarjeta de candidato de una columna a otra.
- Verifica que la tarjeta del candidato se mueve a la nueva columna.
- Verifica que la fase del candidato se actualiza correctamente en el backend mediante el endpoint PUT /candidate/:id.

Para ir por partes y entender bien el proceso, vamos primero con el primer punto: Carga de la Página de Position
Haz los cambios que creas oportunos en las paginas para poder realizar los test, como añadir testIDs o lo que creas conveniente

### Tercer prompt
Vamos con el segundo punto, si. Una simple nota: el backend y el frontend ya lo tengo instalado y ejecutandose, asi que puedes saltarte esos pasos a la hora de setear el proyecto

## Problemas encontrados
Para el primer grupo de tests, el Copilot generó los test automáticamente y pasaron a la primera.
Para el segundo, en la primera iteración hubo 3 tests que no pasaron, pero él mismo se dio cuenta con el output de la consola y los arregló se seguido.
