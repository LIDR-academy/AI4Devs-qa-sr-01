# 🧪 Guía de Ejecución y Troubleshooting - Cypress E2E Testing

Esta guía te ayudará a ejecutar paso a paso todos los tests de Cypress y solucionar problemas comunes.

## 🚀 Pasos para Ejecutar los Tests E2E

### **Paso 1: Preparar el Entorno**

```bash
# 1. Ir a la raíz del proyecto
cd /Users/isabelnunezdelatorre/Desktop/IAMASTER/AI4Devs-qa-sr-01

# 2. Verificar que Cypress está instalado correctamente
npx cypress verify
```

### **Paso 2: Levantar la Aplicación**

# Generar el cliente Prisma (si no está generado)
npm run prisma:generate

# Ejecutar el seed para crear datos de prueba
npm run prisma:seed

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# ✅ Deberías ver: "Server running on port 3010"
```

**Terminal 2 - Frontend:**
```bash
cd frontend  
npm start
# ✅ Deberías ver: "webpack compiled with 0 errors"
# ✅ Se abre automáticamente http://localhost:3000
```

**Terminal 3 - Verificar APIs:**
```bash
# Verificar que el backend responde
curl http://localhost:3010/positions
curl http://localhost:3010/positions/1/candidates

# ✅ Deberías recibir respuestas JSON válidas
```

### **Paso 3: Ejecutar Tests de Cypress**

#### **Opción A: Modo Visual (Recomendado para desarrollo)**

```bash
# Desde la raíz del proyecto
npm run cy:open
```

**En la interfaz de Cypress:**
1. Selecciona **"E2E Testing"**
2. Elige **Chrome** como navegador
3. Busca y haz clic en **`position.spec.js`** 
4. Observa los tests ejecutándose en tiempo real

#### **Opción B: Modo Headless (Para CI/CD)**

```bash
# Ejecutar todos los tests
npm run cy:run

# Ejecutar solo el archivo de posiciones
npx cypress run --spec "cypress/integration/position.spec.js"

# Ejecutar con más detalles
npx cypress run --spec "cypress/integration/position.spec.js" --headed --no-exit
```

### **Paso 4: Verificar Resultados**

#### **✅ Resultado Exitoso Esperado:**

**En modo visual (cypress open):**
- Tests con checkmarks verdes ✅
- Aplicación cargándose en el navegador embebido
- Puedes ver candidatos moviéndose entre columnas
- Logs de API calls en la consola de Cypress

**En modo headless (cypress run):**
```bash
  Position Details - E2E Tests
    Carga de la página de posición
      ✓ debe verificar que el título se muestra correctamente (1234ms)
      ✓ debe mostrar las columnas correspondientes a cada fase (567ms)  
      ✓ debe mostrar candidatos en columna correcta según su fase (890ms)
    
    Cambio de fase de un candidato
      ✓ debe simular correctamente el arrastre de candidato (1456ms)
      ✓ debe verificar que la tarjeta se mueve a nueva columna (1123ms)
      ✓ debe verificar actualización correcta en backend via PUT (1789ms)

  6 passing (8.2s)
```

## 🛠️ Solución de Problemas Comunes

### **🚨 Problema 1: Error de Permisos de Cypress**

**Síntoma:**
```bash
Cypress cannot run because this binary file does not have executable permissions
```

**Solución:**
```bash
# 1. Limpiar caché de Cypress
npx cypress cache clear

# 2. Reinstalar Cypress
npm uninstall cypress && npm install cypress --save-dev

# 3. Verificar instalación
npx cypress verify

# 4. Si persiste, dar permisos manualmente
chmod +x /Users/isabelnunezdelatorre/Library/Caches/Cypress/*/Cypress.app/Contents/MacOS/Cypress
```

### **🚨 Problema 2: Tests no encuentran elementos**

**Síntoma:**
```bash
Element not found: [data-cy="stage-column"]
```

**Causa:** Faltan atributos `data-cy` en componentes React

**Solución:** Verificar que agregaste los atributos en los componentes:

```javascript
// frontend/src/components/StageColumn.js
<Col md={3} data-cy="stage-column">  // ← Debe tener esto

// frontend/src/components/CandidateCard.js  
<Card className="mb-2" data-cy="candidate-card">  // ← Debe tener esto
```

### **🚨 Problema 3: API no responde**

**Síntoma:**
```bash
cy.wait() timed out waiting for the aliased request: @getCandidates
```

**Verificación:**
```bash
# 1. Verificar que backend está corriendo
curl http://localhost:3010/positions/1/candidates

# 2. Verificar que frontend está en puerto 3000
curl http://localhost:3000

# 3. Verificar logs del backend en su terminal
# Deberías ver las requests llegando
```

**Solución:**
- Asegúrate de que ambos servicios están corriendo
- Verifica que no hay errores en las consolas de backend/frontend
- Revisa que las URLs en `cypress.config.js` sean correctas

### **🚨 Problema 4: Drag & Drop no funciona**

**Síntoma:** El candidato no se mueve visualmente entre columnas

**Causa común:** react-beautiful-dnd requiere eventos específicos

**Solución:** Usar el comando personalizado que creamos:

```javascript
// ✅ Correcto
cy.dragToColumn('@candidateCard', targetColumnIndex)

// ❌ Incorrecto
cy.get('@candidateCard').drag('@targetColumn')  // No funciona con react-beautiful-dnd
```

### **🚨 Problema 5: Datos de prueba inconsistentes**

**Síntoma:** Tests pasan algunas veces y fallan otras

**Causa:** Base de datos cambia entre ejecuciones

**Solución:** Crear datos consistentes:

```bash
# Opción 1: Usar fixtures (datos mockeados)
# Ya incluido en el sistema - revisa cypress/fixtures/

# Opción 2: Seed de base de datos
cd backend
npm run prisma:seed  # Si tienes un seed configurado

# Opción 3: Reset manual de BD antes de tests
```

## 📋 Checklist de Verificación Pre-Test

### **Antes de ejecutar tests, verifica:**

- [ ] **Node.js >= 16.x** - `node --version`
- [ ] **NPM >= 8.x** - `npm --version`  
- [ ] **Backend corriendo** - `curl http://localhost:3010/positions`
- [ ] **Frontend corriendo** - Abrir http://localhost:3000
- [ ] **Cypress instalado** - `npx cypress verify`
- [ ] **Puerto 3000 libre** - `lsof -i :3000`
- [ ] **Puerto 3010 libre** - `lsof -i :3010`

### **Datos necesarios para tests:**

- [ ] Al menos 1 posición creada con ID=1
- [ ] Al menos 2-3 candidatos en diferentes fases
- [ ] Flujo de entrevistas configurado (fases del proceso)
- [ ] Base de datos Prisma corriendo

## 🎯 Tests Paso a Paso - Qué Verificar

### **Test 1: Título de Posición**

**Qué observar:**
1. Cypress navega a `/positions/1`
2. Aparece un `<h2>` con texto
3. El texto coincide con datos del backend
4. Test pasa con ✅

**Si falla:** Verificar que existe posición con ID=1 en BD

### **Test 2: Columnas de Proceso**

**Qué observar:**
1. Aparecen 3+ columnas en la página
2. Cada columna tiene un título (Aplicación, Entrevista Técnica, etc.)
3. Títulos coinciden con configuración en backend
4. Test pasa con ✅

**Si falla:** Verificar que el flujo de entrevistas está configurado

### **Test 3: Candidatos en Columnas**

**Qué observar:**
1. Aparecen tarjetas de candidatos
2. Cada tarjeta tiene nombre del candidato
3. Candidatos están en columnas correctas según su fase
4. Test pasa con ✅

**Si falla:** Verificar que hay candidatos asociados a la posición

### **Test 4: Drag & Drop Visual**

**Qué observar:**
1. Una tarjeta de candidato se "levanta" visualmente
2. Se mueve a otra columna
3. Aparece en la nueva ubicación
4. Desaparece de la ubicación original
5. Test pasa con ✅

**Si falla:** Revisar eventos de mouse y react-beautiful-dnd

### **Test 5: Backend Update API**

**Qué observar en Network Tab:**
1. Aparece request `PUT /candidates/:id`
2. Body incluye `applicationId` y `currentInterviewStep` 
3. Response status es 200
4. Test pasa con ✅

**Si falla:** Verificar endpoint PUT en backend

## 🔧 Comandos Útiles para Debugging

### **Ejecutar con más información:**

```bash
# Con logs detallados
DEBUG=cypress:* npm run cy:run

# Solo un test específico
npx cypress run --spec cypress/integration/position.spec.js --headed

# Con browser específico
npx cypress run --browser chrome

# Sin cerrar browser al finalizar (para debugging)
npx cypress run --no-exit
```

### **Ver archivos generados:**

```bash
# Videos de ejecución
ls -la cypress/videos/

# Screenshots de fallos
ls -la cypress/screenshots/

# Logs de Cypress
ls -la ~/.npm/_logs/
```

### **Limpiar estado entre tests:**

```bash
# Limpiar caché
npx cypress cache clear

# Reset completo
rm -rf node_modules cypress/videos cypress/screenshots
npm install
```

## ⚡ Solución Rápida - Quick Start

**Si tienes prisa, ejecuta estos comandos en orden:**

```bash
# 1. Verificar instalación
npx cypress verify

# 2. Levantar servicios (en terminales separadas)
cd backend && npm run dev &
cd frontend && npm start &

# 3. Ejecutar tests
npm run cy:open

# 4. En Cypress UI, clic en position.spec.js
```

## 📊 Interpretación de Resultados

### **✅ Tests Exitosos:**
- **Verde con checkmark**: Test pasó completamente
- **Tiempo razonable**: < 2000ms por test individual
- **Sin screenshots**: No se generaron porque no hubo fallos

### **❌ Tests Fallidos:**
- **Rojo con X**: Test falló en algún assertion
- **Screenshot automático**: Muestra estado exacto del fallo
- **Stack trace**: Indica línea específica que falló
- **Video completo**: Para ver qué pasó antes del fallo

### **⚠️ Tests Flaky (Inconsistentes):**
- **Pasan unas veces, fallan otras**: Problema de timing o datos
- **Solución**: Agregar `cy.wait()` apropiados o mejorar selectors

## 🎯 Resultado Final Esperado

Una ejecución exitosa completa debería mostrar:

```bash
(Run Finished)

  Spec                           Tests  Passing  Failing  Pending  Skipped  
  ┌─────────────────────────────────────────────────────────────────────────┐
  │ ✔  position.spec.js           6        6        0        0        0     │
  └─────────────────────────────────────────────────────────────────────────┘
    ✔  All specs passed!         6        6        0        0        0     

  Duration:      8 seconds
  Screenshots:   0 taken
  Videos:        1 recorded
```

¡Con esto tienes todo lo necesario para ejecutar y verificar el correcto funcionamiento de tus tests E2E!