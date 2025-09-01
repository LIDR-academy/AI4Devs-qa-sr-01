# Cypress E2E Tests

Este directorio contiene las pruebas end-to-end (E2E) para la aplicación de reclutamiento, específicamente enfocadas en la interfaz de posiciones.

## Estructura

```
cypress/
├── e2e/                    # Tests E2E
│   ├── positions.cy.ts     # Tests para la página de posiciones
│   ├── position-details.cy.ts # Tests para detalles de posición
│   └── app-navigation.cy.ts # Tests de navegación general
├── fixtures/               # Datos de prueba
│   └── positions.json      # Datos mock para posiciones
├── support/                # Archivos de soporte
│   ├── commands.ts         # Comandos personalizados
│   └── e2e.ts             # Configuración global
└── README.md              # Este archivo
```

## Configuración

### Prerequisitos

1. **Frontend corriendo**: La aplicación React debe estar ejecutándose en `http://localhost:3000`
2. **Backend corriendo**: El backend debe estar ejecutándose en `http://localhost:3010`
3. **Base de datos**: PostgreSQL debe estar configurada y corriendo

### Instalación

```bash
# Instalar dependencias (si no están instaladas)
npm install

# Verificar que Cypress esté instalado
npx cypress verify
```

## Ejecución de Tests

### Modo Interactivo (Recomendado para desarrollo)

```bash
# Abrir Cypress Test Runner
npm run cypress:open
# o
npm run e2e:open
```

### Modo Headless (Para CI/CD)

```bash
# Ejecutar todos los tests en modo headless
npm run cypress:run
# o
npm run e2e

# Ejecutar con reportes detallados
npm run cypress:run:headless
```

### Ejecutar tests específicos

```bash
# Ejecutar solo tests de posiciones
npx cypress run --spec "cypress/e2e/positions.cy.ts"

# Ejecutar tests con navegador específico
npx cypress run --browser chrome
```

## Tests Disponibles

### 1. positions.cy.ts
Tests para la página principal de posiciones:
- ✅ Carga de página y elementos básicos
- ✅ Visualización de tarjetas de posiciones
- ✅ Funcionalidad de filtros
- ✅ Navegación y interacciones
- ✅ Diseño responsivo
- ✅ Manejo de errores

### 2. position-details.cy.ts
Tests para la página de detalles de posición:
- ✅ Carga de página de detalles
- ✅ Navegación desde detalles

### 3. app-navigation.cy.ts
Tests de navegación general:
- ✅ Flujo completo de usuario
- ✅ Acceso directo a URLs
- ✅ Navegación del navegador

## Comandos Personalizados

### cy.visitPositions()
Navega a la página de posiciones y verifica la URL.

```typescript
cy.visitPositions()
```

### cy.dataCy(value)
Selecciona elementos por el atributo `data-cy`.

```typescript
cy.dataCy('my-element')
```

### cy.waitForApi(method, url)
Espera a que se complete una llamada API específica.

```typescript
cy.waitForApi('GET', '/positions')
```

## Fixtures

### positions.json
Contiene datos mock para las posiciones que se usan en los tests. Incluye:
- Posiciones con diferentes estados (Open, Contratado, Cerrado, Borrador)
- Información de contacto y fechas límite
- IDs únicos para cada posición

## Configuración

### cypress.config.ts
Configuración principal de Cypress:
- **baseUrl**: `http://localhost:3000`
- **viewport**: 1280x720
- **timeouts**: 10 segundos
- **video**: Deshabilitado
- **screenshots**: Habilitado en fallos

## Mejores Prácticas

1. **Usar data-cy attributes**: Para seleccionar elementos de forma estable
2. **Mockear APIs**: Usar fixtures para datos consistentes
3. **Tests independientes**: Cada test debe poder ejecutarse por separado
4. **Cleanup**: Usar `beforeEach` para configurar el estado inicial
5. **Assertions claras**: Usar assertions específicas y descriptivas

## Troubleshooting

### Error: "Cannot find module 'cypress'"
```bash
npm install cypress --save-dev
```

### Error: "Application not running"
Asegúrate de que:
1. El frontend esté corriendo en `http://localhost:3000`
2. El backend esté corriendo en `http://localhost:3010`

### Tests fallan por timeouts
- Verifica que las APIs estén respondiendo correctamente
- Aumenta los timeouts en `cypress.config.ts` si es necesario
- Revisa que los mocks estén configurados correctamente

### Tests fallan en CI
- Usa `npm run cypress:run:headless` para ejecución en CI
- Verifica que las variables de entorno estén configuradas
- Asegúrate de que las dependencias estén instaladas

## Contribución

Al agregar nuevos tests:

1. Sigue la convención de nombres: `*.cy.ts`
2. Usa fixtures para datos mock
3. Agrega comandos personalizados si es necesario
4. Documenta nuevos tests en este README
5. Asegúrate de que los tests sean independientes y repetibles
