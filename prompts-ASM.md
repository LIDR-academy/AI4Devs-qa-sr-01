```markdown
# 🎯 Prompt para AI: Configuración Completa de Tests E2E - AI4Devs Week 11

## 📋 Contexto del Proyecto
Eres un experto DevOps y desarrollador full-stack especializado en React, Node.js, PostgreSQL y Cypress. Tu objetivo es configurar y ejecutar tests E2E para un sistema de reclutamiento (ATS) que incluye gestión de candidatos, posiciones y flujos de entrevistas.

## 🏗️ Arquitectura del Sistema
- **Frontend**: React + TypeScript + Bootstrap
- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: PostgreSQL con Prisma ORM
- **Tests E2E**: Cypress
- **Drag & Drop**: react-beautiful-dnd

## 🎯 Objetivos del Ejercicio
1. Configurar Cypress en el proyecto
2. Crear pruebas E2E para la interfaz "position"
3. Verificar funcionalidad de drag & drop de candidatos
4. Validar integración frontend-backend

## 📋 Checklist de Tareas a Completar

### **Fase 1: Configuración del Entorno**
- [ ] Verificar que Docker esté corriendo PostgreSQL en puerto 5432
- [ ] Instalar dependencias del backend: `cd backend && npm install`
- [ ] Configurar archivo `.env` en backend con variables de base de datos
- [ ] Generar cliente Prisma: `npx prisma generate`
- [ ] Ejecutar migraciones: `npx prisma migrate deploy`
- [ ] Poblar base de datos: `npx prisma db seed`
- [ ] Levantar backend: `npm run dev` (puerto 3010)
- [ ] Verificar frontend en puerto 3000

### **Fase 2: Configuración de Cypress**
- [ ] Verificar que Cypress esté instalado en frontend
- [ ] Configurar `cypress.config.ts` correctamente
- [ ] Verificar archivo `position.spec.js` en `/cypress/integration/`

### **Fase 3: Tests E2E - Carga de Página**
- [ ] Test 1: Verificar título "Posiciones" visible
- [ ] Test 1: Verificar columnas de fases ("Initial Screening", "Technical Interview", "Manager Interview")
- [ ] Test 1: Verificar candidato "John Doe" visible

### **Fase 4: Tests E2E - Drag & Drop**
- [ ] Test 2: Interceptar llamada PUT a `**/candidates/*`
- [ ] Test 2: Simular drag & drop usando `[data-rbd-draggable-id]` y `[data-rbd-droppable-id]`
- [ ] Test 2: Verificar respuesta 200 del backend
- [ ] Test 2: Verificar que candidato aparece en nueva columna

## 🐛 Problemas Conocidos y Soluciones

### **Error: "Cannot find module '@prisma/client'"**
```bash
# Solución: Reinstalar dependencias compatibles
npm uninstall @prisma/client prisma
npm install @prisma/client@^5.22.0 prisma@^5.13.0
npx prisma generate
```

### **Error: "TypeScript compilation failed"**
```bash
# Solución: Actualizar TypeScript
npm uninstall typescript ts-node ts-node-dev
npm install typescript@^5.0.0 ts-node@^10.9.0 ts-node-dev@^2.0.0
```

### **Error: "Missing prisma.seed property"**
```json
// Agregar en backend/package.json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
}
```

### **Error: "Expected to find content: '/position/i'"**
```javascript
// Cambiar en position.spec.js
cy.contains('Posiciones').should('be.visible');
```

### **Error: "No request ever occurred" en drag & drop**
```javascript
// Usar selectores correctos de react-beautiful-dnd
cy.get('[data-rbd-draggable-id]').should('exist');
cy.get('[data-rbd-droppable-id]').should('exist');
```

## 🔧 Configuración Técnica Requerida

### **Variables de Entorno (backend/.env)**
```
DB_PASSWORD=D1ymf8wyQEGthFR1E9xhCq
DB_USER=LTIdbUser
DB_NAME=LTIdb
DB_PORT=5432
DATABASE_URL="postgresql://LTIdbUser:D1ymf8wyQEGthFR1E9xhCq@localhost:5432/LTIdb"
```

### **Configuración de Cypress (frontend/cypress.config.ts)**
```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/integration/**/*.spec.js'
  }
})
```

### **Archivo de Test (frontend/cypress/integration/position.spec.js)**
```javascript
const POSITION_PATH = '/positions/1';
const PHASES = ['Initial Screening', 'Technical Interview', 'Manager Interview'];
const CANDIDATE_NAME = 'John Doe';
const TARGET_PHASE = 'Interview';
```

## 🧪 Comandos de Ejecución

### **Secuencia de Comandos**
```bash
# 1. Base de datos
docker compose up -d db

# 2. Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run dev

# 3. Frontend (nueva terminal)
cd frontend
npm install
npm start

# 4. Tests E2E (nueva terminal)
cd frontend
npx cypress open
```

## 📊 Resultados Esperados

### **Tests Exitosos**
- ✅ Test 1: "Carga de la página: muestra título, columnas y tarjetas en columna correcta" - PASADO
- ✅ Test 2: "Cambio de fase de un candidato: arrastre + PUT /candidate/:id" - PASADO

### **Verificaciones Manuales**
- ✅ Backend responde en `http://localhost:3010` con "Hola LTI!"
- ✅ Frontend carga en `http://localhost:3000`
- ✅ Página de posiciones muestra candidatos
- ✅ Drag & drop funciona manualmente

## �� Criterios de Éxito
- [ ] Todos los tests E2E pasan
- [ ] Backend y frontend comunicándose correctamente
- [ ] Base de datos poblada con datos de prueba
- [ ] Funcionalidad de drag & drop operativa
- [ ] Documentación completa en `prompts-ASM.md`

## ⚠️ Consideraciones Importantes
- Ejecutar comandos desde las carpetas correctas
- Verificar que los puertos 3000, 3010 y 5432 estén libres
- Asegurar que Docker esté corriendo
- Usar versiones compatibles de dependencias
- Verificar configuración de CORS en backend

**Ejecuta estas tareas en orden secuencial y verifica cada paso antes de continuar al siguiente.**
```