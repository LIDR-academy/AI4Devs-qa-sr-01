# Pruebas E2E con Cypress

Este directorio contiene las pruebas end-to-end (E2E) para la aplicación LTI usando Cypress.

## Archivos de Pruebas

### `position.spec.js`
Pruebas E2E para la vista de Position que cubren:

1. **Carga de la Página de Position**
   - Verificación del título de la posición
   - Renderizado de columnas por fase
   - Posicionamiento correcto de tarjetas de candidatos
   - Elementos de navegación

2. **Cambio de Fase de un Candidato**
   - Simulación de drag & drop entre columnas
   - Validación de llamadas PUT a la API
   - Verificación de cambios en la UI
   - Manejo de múltiples movimientos

3. **Interacciones Adicionales**
   - Visualización de detalles del candidato
   - Navegación entre páginas

## Configuración

### Requisitos Previos
- Node.js instalado
- Dependencias del frontend instaladas (`npm install`)
- Backend ejecutándose en `http://localhost:3010`
- Frontend ejecutándose en `http://localhost:3000`

### Instalación de Cypress
```bash
cd frontend
npm install
```

### Configuración
- `cypress.config.js`: Configuración principal de Cypress
- `cypress/support/e2e.js`: Configuración global y comandos personalizados
- `cypress.d.ts`: Tipos de TypeScript para Cypress

## Ejecución de Pruebas

### Modo Interactivo (Recomendado para desarrollo)
```bash
cd frontend
npm run cypress:open
```

### Modo Headless (Para CI/CD)
```bash
cd frontend
npm run cypress:run
```

## Estructura de las Pruebas

### Datos Mock
- `mockInterviewFlow`: Simula la respuesta del endpoint `/positions/{id}/interviewFlow`
- `mockCandidates`: Simula la respuesta del endpoint `/positions/{id}/candidates`

### Helpers
- `dragAndDrop`: Función helper para simular drag & drop usando eventos del mouse

### Interceptores de Red
- `@getPosition`: Intercepta llamadas GET al flujo de entrevistas
- `@getCandidates`: Intercepta llamadas GET a los candidatos
- `@updateCandidate`: Intercepta llamadas PUT para actualizar candidatos

## Escenarios Cubiertos

### ✅ Carga de Página
- [x] Título de posición visible
- [x] Columnas de fases renderizadas
- [x] Tarjetas en columnas correctas
- [x] Botón de navegación presente
- [x] Información de candidatos visible

### ✅ Cambio de Fase
- [x] Drag & drop entre columnas
- [x] Validación de llamadas PUT
- [x] Múltiples movimientos secuenciales
- [x] Manejo de movimientos a la misma columna

### ✅ Interacciones
- [x] Visualización de detalles
- [x] Cierre de paneles
- [x] Navegación entre páginas

## Notas Técnicas

### Selectores Utilizados
- `.card-header`: Encabezados de columnas de fases
- `.card-body`: Contenido de las tarjetas
- `h2`: Título de la posición
- `button`: Botones de navegación

### Endpoints Interceptados
- `GET /positions/{id}/interviewFlow`
- `GET /positions/{id}/candidates`
- `PUT /candidates/{id}`

### Fases del Proceso
1. **Applied**: Candidatos que han aplicado
2. **Screening**: Candidatos en proceso de selección
3. **Interview**: Candidatos en entrevista
4. **Offer**: Candidatos con oferta

## Solución de Problemas

### Error: "cy is not defined"
- Verificar que Cypress esté instalado: `npm list cypress`
- Asegurar que el archivo `cypress.config.js` esté configurado correctamente
- Verificar que `cypress/support/e2e.js` exista y esté configurado

### Pruebas Fallan en Drag & Drop
- Verificar que la aplicación use `react-beautiful-dnd`
- Asegurar que los eventos del mouse se disparen correctamente
- Revisar que los selectores CSS sean correctos

### Problemas de Red
- Verificar que el backend esté ejecutándose
- Comprobar que las URLs en los interceptores sean correctas
- Asegurar que los datos mock coincidan con la estructura esperada
