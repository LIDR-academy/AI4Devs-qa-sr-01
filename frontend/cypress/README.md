# Cypress E2E Tests

Este directorio contiene las pruebas end-to-end (E2E) para la aplicación de reclutamiento.

## Estructura

```
cypress/
├── e2e/                    # Tests E2E
├── fixtures/               # Datos de prueba
├── support/                # Archivos de soporte
└── README.md              # Este archivo
```

## Ejecución Rápida

```bash
# Smoke test
npm run e2e:smoke

# Todos los tests
npm run cypress:run

# Modo interactivo
npm run cypress:open
```

## Documentación Completa

Para documentación detallada, consulta:
- `../prompts/CYPRESS_SETUP.md` - Configuración completa
- `../prompts/cypress-README.md` - Documentación técnica detallada