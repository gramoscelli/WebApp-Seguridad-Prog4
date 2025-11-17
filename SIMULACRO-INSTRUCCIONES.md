# 📝 Instrucciones para Ejecutar Tests del Simulacro

Este documento contiene las instrucciones para ejecutar los tests del simulacro TDD.

## 📦 Instalación de Dependencias

**IMPORTANTE:** Antes de ejecutar los tests, debes instalar las dependencias en ambos proyectos.

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

---

## 🧪 Ejecución de Tests

### 🔧 Backend (8 tests)

Los tests del backend incluyen:
1. **Test de integración**: Endpoint GET /api/hello (2 tests)
2. **Test de seguridad**: SQL Injection Prevention (6 tests)

**Ejecutar todos los tests del simulacro:**
```bash
cd backend
npm run test:simulacro
```

**Ejecutar con watch mode (se reejecutarán automáticamente al guardar cambios):**
```bash
cd backend
npm test
```

**Resultado esperado:**
```
PASS test/integration/hello.test.js
  GET /api/hello - endpoint simple
    ✓ debería responder 200 con mensaje "Hello World"
    ✓ debería responder con Content-Type application/json

PASS test/security/SIMU-SQLInjection.test.js
  SIMU-SQLInjection: Prevención de SQL Injection
    ✓ ❌ DEBE RECHAZAR: Texto con punto y coma (;)
    ✓ ❌ DEBE RECHAZAR: Texto con comentario SQL (--)
    ✓ ❌ DEBE RECHAZAR: Múltiples caracteres peligrosos
    ✓ ✅ DEBE PERMITIR: Texto seguro sin caracteres peligrosos
    ✓ ✅ DEBE PERMITIR: Texto con caracteres especiales seguros
    ✓ ❌ DEBE RECHAZAR: Query vacía

Test Suites: 2 passed, 2 total
Tests:       8 passed, 8 total ✅
```

---

### 🎨 Frontend (3 tests)

Los tests del frontend incluyen:
- **Test de componente**: HelloButton con toggle de mensaje "Hola Mundo" (3 tests)

**Ejecutar tests del simulacro:**
```bash
cd frontend
npm test -- --run
```

**Ejecutar con watch mode:**
```bash
cd frontend
npm test
```

**Abrir interfaz gráfica de Vitest:**
```bash
cd frontend
npm run test:ui
```

**Resultado esperado:**
```
✓ src/test/HelloButton.test.tsx (3 tests)
  ✓ HelloButton
    ✓ debería mostrar un botón con texto "Mostrar Mensaje"
    ✓ debería mostrar "Hola Mundo" al hacer clic en el botón
    ✓ debería ocultar el mensaje al hacer clic de nuevo

Test Files  1 passed (1)
Tests       3 passed (3) ✅
```

---

## 📊 Resumen Total

| Proyecto | Tests | Archivos |
|----------|-------|----------|
| **Backend** | 8 ✅ | `test/integration/hello.test.js`<br>`test/security/SIMU-SQLInjection.test.js` |
| **Frontend** | 3 ✅ | `src/test/HelloButton.test.tsx` |
| **TOTAL** | **11 tests** | 3 archivos |

---

## 🔍 Descripción de los Tests

### Backend

#### 1. **GET /api/hello** (Integración)
- Endpoint simple que retorna `{ message: "Hello World" }`
- Verifica status 200 y Content-Type JSON
- Ubicación: `backend/src/routes/hello.js`

#### 2. **POST /api/search** (Seguridad - SQL Injection)
- Valida entrada de usuario para prevenir SQL Injection
- Rechaza caracteres peligrosos: `;` y `--`
- Rechaza queries vacías
- Permite texto seguro y caracteres especiales como `@`
- Ubicación: `backend/src/routes/hello.js`

### Frontend

#### 3. **HelloButton** (Componente React)
- Botón que muestra/oculta mensaje "Hola Mundo"
- Toggle de visibilidad al hacer clic
- Testing con @testing-library/react y Vitest
- Ubicación: `frontend/src/components/HelloButton.tsx`

---

## 🚀 Scripts Disponibles

### Backend
```bash
npm test              # Tests del simulacro con watch
npm run test:simulacro # Tests del simulacro sin watch
npm run test:all      # Todos los tests del proyecto
npm run test:security # Tests de seguridad originales
```

### Frontend
```bash
npm test         # Tests del simulacro con watch
npm run test:all # Todos los tests del proyecto
npm run test:ui  # Interfaz gráfica de Vitest
```

---

## ✅ Definition of Done

Para considerar el simulacro completo, verifica que:

- [ ] Backend: 8/8 tests pasan ✅
- [ ] Frontend: 3/3 tests pasan ✅
- [ ] Total: 11/11 tests pasan ✅
- [ ] No hay errores en la consola
- [ ] El código sigue las guías de TDD proporcionadas

---

## 📚 Metodología TDD Aplicada

Este simulacro sigue el ciclo TDD:

1. **🔴 ROJO**: Escribir test que falla
2. **🟢 VERDE**: Implementar código mínimo para pasar el test
3. **🔵 REFACTOR**: Mejorar el código manteniendo los tests en verde

Todos los tests fueron creados siguiendo esta metodología, documentada en:
- `guia_tdd_api_2.md` (Backend)
- `React_and_Vitest_TDD_v3.md` (Frontend)

---

## 🛠️ Troubleshooting

### Error: "Cannot find module 'supertest'"
**Solución:** Ejecuta `npm install` en la carpeta `backend/`

### Error: "Cannot find module '@testing-library/react'"
**Solución:** Ejecuta `npm install` en la carpeta `frontend/`

### Error: "sh: 1: jest: not found"
**Solución:** Asegúrate de ejecutar `npm test` (no `jest` directamente)

### Tests no se ejecutan
**Solución:** Verifica que estás en la carpeta correcta (backend/ o frontend/)

---

## 📞 Ayuda

Si encuentras problemas, verifica:
1. ✅ Node.js instalado (versión 18+)
2. ✅ `npm install` ejecutado en ambas carpetas
3. ✅ Estás en la carpeta correcta al ejecutar los comandos
4. ✅ Los archivos de test existen en las rutas especificadas

---

**Última actualización:** 2025-11-17
**Rama:** `claude/simulacro-01UFYoHmvX6Dn9iDRDdFiBGh`
