# Guía TDD para APIs (TypeScript + Express + Jest + Supertest)

> Receta paso a paso en español. Incluye estructura, comandos, snippets de configuración y ejemplos de tests **unitarios** e **integración** siguiendo **Rojo → Verde → Refactor**. Puedes copiar/pegar cada bloque.



## 0) Enfoque TDD aplicado a APIs

**Ciclo:**

1. **Rojo**: escribe un test que falla (define comportamiento).
2. **Verde**: implementa lo mínimo para pasar el test.
3. **Refactor**: limpia el código manteniendo los tests en verde.

**Capas recomendadas:**

* **Unitarios**: reglas de dominio/servicio sin I/O.
* **Integración**: rutas HTTP, códigos de estado, validaciones.
* (Opcional) **E2E**/contratos con DB real o contenedores.

**Principios clave:**

* Separa **app** (Express) de **server** (listen).
* Inyecta dependencias en routers (`makeBooksRouter(service)`).
* Valida entradas/salidas en bordes (p.ej., Zod).



## 1) Preparación del proyecto

### 1.1 Estructura mínima (sugerida)

```
.
├─ src/
│  ├─ app.ts
│  ├─ server.ts
│  ├─ routes/
│  │  └─ books.ts
│  └─ services/
│     └─ bookService.ts
├─ tests/
│  ├─ unit/
│  │  └─ bookService.yearRule.test.ts
│  └─ integration/
│     └─ books.yearRule.routes.test.ts
├─ package.json
├─ tsconfig.json
└─ jest.config.ts
```

### 1.2 Instalación (comandos)

```bash
npm init -y
npm i express zod
npm i -D typescript ts-node @types/express jest ts-jest @types/jest supertest @types/supertest
npx tsc --init
npx ts-jest config:init
```

### 1.3 `package.json` (scripts sugeridos)

```json
{
  "type": "module",
  "scripts": {
    "dev": "ts-node src/server.ts",
    "test": "jest",
    "test:watch": "jest --watchAll",
    "coverage": "jest --coverage"
  }
}
```

### 1.4 `tsconfig.json` (valores útiles)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src", "tests"]
}
```

### 1.5 `jest.config.ts`

```ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/server.ts' // excluir el arranque del servidor
  ]
};

export default config;
```



## 2) Estrategia por capa

### 2.1 Tests unitarios (servicio/domino)

**Objetivo:** lógica pura sin red/IO. **Técnicas:** fixtures/factories simples; mocks donde haya I/O.

**Checklist de un buen test unitario**

* Nombre describe el comportamiento.
* Entrada mínima y clara.
* 1–2 afirmaciones fuertes y específicas.
* Casos borde separados (no mezclar muchos asserts en un test).

### 2.2 Tests de integración (rutas HTTP)

**Objetivo:** contrato de la API (status, body, validaciones, headers). **Técnicas:** montar `express()` fresco por suite, inyectar servicios fakes si aplica.

### 2.3 (Opcional) E2E/contratos

* E2E con `testcontainers` + DB real.
* Validación de contrato con Zod y/o schemas compartidos.



## 3) Receta TDD por historia (user story)

> *Historia* = **historia de usuario (user story)**: ítem de backlog que describe un comportamiento con valor para el usuario y sus criterios de aceptación.

1. Elige el **próximo comportamiento** (pequeño).
2. Escribe **primero** el test **unitario** (servicio/regla).
3. Corre tests → **Rojo**.
4. Implementa mínimo → **Verde**.
5. **Refactor** (nombres, duplicación, helpers).
6. Añade el test **de integración** que cubra la ruta.
7. (Opcional) Refuerza validaciones y mensajes de error.
8. Repite.



## 4) Ejemplo guiado: regla `year` y endpoint `POST /books`

### 4.1 Servicio (test unitario primero)

**Regla:** `year` no puede ser mayor al año actual.

```ts
// tests/unit/bookService.yearRule.test.ts
import { BookService } from '../../src/services/bookService';

describe('BookService - regla de year', () => {
  it('rechaza crear libro con year futuro', () => {
    const svc = new BookService();
    expect(() =>
      svc.create({ title: 'Foo', author: 'Bar', year: new Date().getFullYear() + 1 })
    ).toThrow(/year/i);
  });

  it('permite crear libro con year del año actual', () => {
    const svc = new BookService();
    const book = svc.create({ title: 'Ok', author: 'A', year: new Date().getFullYear() });
    expect(book.id).toBeDefined();
  });
});
```

**Implementación mínima del servicio**

```ts
// src/services/bookService.ts
export type NewBook = { title: string; author: string; year: number };
export type Book = NewBook & { id: string };

export class BookService {
  private data: Book[] = [];

  create(input: NewBook): Book {
    const currentYear = new Date().getFullYear();
    if (input.year > currentYear) {
      throw new Error('Invalid year');
    }
    const book: Book = { ...input, id: crypto.randomUUID() };
    this.data.push(book);
    return book;
  }

  list(params?: { author?: string }): Book[] {
    const { author } = params ?? {};
    return author ? this.data.filter(b => b.author === author) : [...this.data];
  }
}
```

### 4.2 App/Router y validación

```ts
// src/app.ts
import express from 'express';
import { makeBooksRouter } from './routes/books.js';
import { BookService } from './services/bookService.js';

export function makeApp() {
  const app = express();
  app.use(express.json());

  // inyección de dependencias
  const service = new BookService();
  app.use('/books', makeBooksRouter(service));

  // healthcheck simple
  app.get('/health', (_req, res) => res.json({ ok: true }));

  return app;
}
```

```ts
// src/server.ts
import { makeApp } from './app.js';

const PORT = process.env.PORT ?? 3000;
makeApp().listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
```

```ts
// src/routes/books.ts
import { Router } from 'express';
import { z } from 'zod';
import type { BookService } from '../services/bookService.js';

const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  year: z.number().int().max(new Date().getFullYear())
});

export function makeBooksRouter(service: BookService) {
  const router = Router();

  router.post('/', (req, res) => {
    const parse = createBookSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', details: parse.error.flatten() });
    }
    try {
      const created = service.create(parse.data);
      return res.status(201).json(created);
    } catch (err) {
      return res.status(400).json({ error: (err as Error).message });
    }
  });

  router.get('/', (req, res) => {
    const author = typeof req.query.author === 'string' ? req.query.author : undefined;
    const list = service.list({ author });
    return res.json(list);
  });

  return router;
}
```

### 4.3 Test de integración (Supertest)

```ts
// tests/integration/books.yearRule.routes.test.ts
import request from 'supertest';
import express from 'express';
import { makeBooksRouter } from '../../src/routes/books';
import { BookService } from '../../src/services/bookService';

describe('POST /books - validaciones', () => {
  const makeApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/books', makeBooksRouter(new BookService()));
    return app;
  };

  it('year futuro → 400 con error', async () => {
    const app = makeApp();
    const res = await request(app).post('/books').send({
      title: 'Future',
      author: 'X',
      year: new Date().getFullYear() + 1
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('payload válido → 201 con objeto creado', async () => {
    const app = makeApp();
    const res = await request(app).post('/books').send({
      title: 'Now',
      author: 'Y',
      year: new Date().getFullYear()
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});
```



## 5) Plantillas reutilizables

### 5.1 Plantilla de caso unitario

```ts
// tests/unit/<feature>.<behavior>.test.ts
describe('<Feature> - <Behavior>', () => {
  it('debería <resultado esperable>', () => {
    // arrange
    // act
    // assert
  });
});
```

### 5.2 Plantilla de suite de integración

```ts
// tests/integration/<route>.<behavior>.test.ts
import request from 'supertest';
import express from 'express';

// importa router y servicio

describe('<RUTA> - <Behavior>', () => {
  const makeApp = () => {
    const app = express();
    app.use(express.json());
    // app.use('/<ruta>', make<Router>(new <Service>()));
    return app;
  };

  it('debería responder <status> y <body>', async () => {
    const app = makeApp();
    const res = await request(app).<METHOD>('<<ruta>>').send(/* body */);
    expect(res.status).toBe(<STATUS>);
    // más asserts
  });
});
```

### 5.3 Validación con Zod (reutilizable)

```ts
import { z } from 'zod';

export const idParam = z.object({ id: z.string().uuid() });
export const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});
```



## 6) Buenas prácticas rápidas

* Tests pequeños, cada uno con intención clara.
* Un **comportamiento** por test; evita asserts no relacionados.
* Nombres descriptivos: `feature.behavior.test.ts`.
* Factories/fixtures para evitar duplicación de datos.
* Inyección de dependencias en routers.
* Mensajes de error consistentes y formato de error estable.
* Thresholds de cobertura razonables; evita perseguir 100% inútil.
* CI: `npm ci && npm test` en cada PR.



## 7) Definition of Done por user story

> La *user story* se considera completa cuando cumple **todo** lo siguiente.

### 7.1 Tests y contrato

*

### 7.2 Calidad y mantenimiento

*

### 7.3 Delivery

*

> Tip: añade una tabla "**Matriz de casos**" en la descripción del PR con entradas/estados esperados y el test que los cubre.



## 8) Ejercicios TDD sugeridos (para practicar)

1. `GET /books?author=` filtra por autor (unit → integración; casos borde autor vacío, autor inexistente).
2. Paginación `?page=&pageSize=` con límites y contrato estable.
3. Regla de unicidad (título + autor) en el servicio (con test de colisión).
4. Endpoint `DELETE /books/:id` con validación UUID y tests de 204/404.



## 9) Snippets útiles (copiar/pegar)

### 9.1 Middleware de manejo de errores simple

```ts
// src/middleware/errors.ts
import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : 'UnexpectedError';
  const status = /not found/i.test(message) ? 404 : 400;
  res.status(status).json({ error: message });
}
```

### 9.2 CORS básico

```ts
// src/middleware/cors.ts
import { Request, Response, NextFunction } from 'express';
export function simpleCors(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
}
```

### 9.3 Hook de test para clock fijo (si necesitas fechas deterministas)

```ts
// tests/setup/fakeClock.ts
const RealDate = Date;
export function withFixedDate(iso = '2025-01-01T00:00:00Z') {
  const fixed = new RealDate(iso);
  // @ts-ignore
  global.Date = class extends RealDate { constructor() { super(); return fixed; } } as any;
  return () => { global.Date = RealDate as any; };
}
```



## 10) Próximos pasos

* Añade más reglas de dominio (unit) y expónlas gradualmente vía endpoints (integración).
* Considera `testcontainers` si integras DB real.
* Añade validación de salida (Zod `transform`/`parse`) si compartes contratos.

> ¿Quieres que convierta este canvas en un esqueleto de proyecto descargable (zip) con los archivos listos? Puedo generarlo a partir de estos snippets.



## 11) Alternativa: **Vitest** (en lugar de Jest)

Si preferís **Vitest**, el flujo TDD no cambia (Rojo → Verde → Refactor), solo cambian las herramientas.

### 11.1 Instalación

```bash
# quitar jest/ts-jest si migras
npm remove jest ts-jest @types/jest

# instalar vitest y utilidades
npm i -D vitest @vitest/coverage-v8 @types/node tsx
# (ya deberías tener) supertest y sus tipos
npm i -D supertest @types/supertest
```

### 11.2 Scripts en `package.json`

```json
{
  "scripts": {
    "dev": "ts-node src/server.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "coverage": "vitest run --coverage"
  }
}
```

> Nota: Vitest compila TS con **esbuild**, no requiere `ts-jest`.

### 11.3 Configuración `vitest.config.ts`

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,tsx,js}'],
    globals: true, // opcional: usar describe/it/expect sin importar
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/server.ts']
    }
  }
});
```

* Si preferís **no** usar `globals: true`, importá desde `vitest` en cada test:

```ts
import { describe, it, expect } from 'vitest';
```

* Alternativamente, añade a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"]
  }
}
```

### 11.4 Tests: ¿qué cambia?

* **Unitarios** y **de integración** funcionan igual. Supertest se usa igual.
* En archivos de test, podés:

```ts
// tests/unit/bookService.yearRule.test.ts
import { describe, it, expect } from 'vitest';
import { BookService } from '../../src/services/bookService';

describe('BookService - regla de year', () => {
  it('rechaza crear libro con year futuro', () => {
    const svc = new BookService();
    expect(() =>
      svc.create({ title: 'Foo', author: 'Bar', year: new Date().getFullYear() + 1 })
    ).toThrow(/year/i);
  });
});
```

```ts
// tests/integration/books.yearRule.routes.test.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express from 'express';
import { makeBooksRouter } from '../../src/routes/books';
import { BookService } from '../../src/services/bookService';

describe('POST /books - validaciones', () => {
  const makeApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/books', makeBooksRouter(new BookService()));
    return app;
  };

  it('year futuro → 400 con error', async () => {
    const app = makeApp();
    const res = await request(app).post('/books').send({
      title: 'Future',
      author: 'X',
      year: new Date().getFullYear() + 1
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});
```

### 11.5 ESM/TypeScript: detalles rápidos

* Con `"module": "ESNext"` y `"moduleResolution": "NodeNext"`, usá \*\*extensión \*\*\`\` en imports relativos TS → TS (p. ej., `import { makeBooksRouter } from './routes/books.js'`).
* Vitest no requiere `jest.config`, su configuración vive en `vitest.config.ts`.

### 11.6 Comandos útiles

```bash
npm run test        # corre una pasada
npm run test:watch  # watch mode
npm run coverage    # reporte de cobertura (text + html)
```



## 12) Zod en la API: por qué y cómo usarlo

**Zod** es una biblioteca de *schemas* para **validar** y **tipar** datos en tiempo de ejecución. En TDD para APIs se usa para **definir el contrato** en los bordes de tu sistema (HTTP request/response), mantener entradas limpias y simplificar tests.

### 12.1 Dónde aplicarlo

* **Entradas**: `req.body`, `req.query`, `req.params`, y, si hace falta, `req.headers`.
* **Salidas** (opcional): valida la forma de lo que enviás por `res.json(...)`.
* No reemplaza la **lógica de dominio**: Zod asegura contratos; las reglas de negocio van en el servicio con tests unitarios.

### 12.2 `parse` vs `safeParse`

* `schema.parse(x)` lanza excepción si no valida.
* `schema.safeParse(x)` devuelve `{ success, data?, error? }` y no lanza.

En controladores conviene \`\` para responder `400` sin hacer `throw`:

```ts
const result = createBookSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: 'ValidationError', details: result.error.flatten() });
}
const input = result.data; // tipado y sanitizado
```

### 12.3 Schemas típicos

```ts
import { z } from 'zod';

// Body: crear libro
export const createBookSchema = z.object({
  title: z.string().min(1).trim(),
  author: z.string().min(1).trim(),
  year: z.number().int().max(new Date().getFullYear())
});

// Query: filtros y paginación
export const listBooksQuery = z.object({
  author: z.string().min(1).trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
}).strict();

// Params: path variables
export const idParam = z.object({ id: z.string().uuid() });
```

> Consejo: `z.coerce.number()` convierte strings de `query` en números.

### 12.4 Derivar tipos de TypeScript del schema

Evita duplicar tipos y schemas: **deriva** los tipos con `z.infer`.

```ts
export type NewBook = z.infer<typeof createBookSchema>;
```

### 12.5 Refinements y reglas simples

Podés agregar precondiciones con `.refine` o `.superRefine` para casos ligeros.

```ts
const createBookWithRule = createBookSchema.refine(v => v.year <= new Date().getFullYear(), {
  path: ['year'],
  message: 'year no puede ser futuro'
});
```

Aun así, mantené la **regla** también en el servicio y probala con tests unitarios.

### 12.6 Transforms y sanitización

Usá `.transform` para normalizar entradas antes de pasar al servicio.

```ts
const normalizedCreate = createBookSchema.transform(v => ({
  ...v,
  title: v.title.trim(),
  author: v.author.trim()
}));
```

### 12.7 Validar la **salida** (opcional)

Útil para contratos estables (especialmente en TDD):

```ts
const bookSchema = createBookSchema.extend({ id: z.string().uuid() });
const created = service.create(input);
return res.status(201).json(bookSchema.parse(created));
```

Podés activarlo solo en desarrollo.

### 12.8 Helper genérico `validate`

Centraliza la validación y el formato de error.

```ts
// src/middleware/validate.ts
import { ZodSchema, ZodError } from 'zod';
import { RequestHandler } from 'express';

export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
): RequestHandler => (req, res, next) => {
  const input = (req as any)[source];
  const result = (schema as any).safeParse(input);
  if (!result.success) {
    const err = result.error as ZodError;
    return res.status(400).json({ error: 'ValidationError', details: err.flatten() });
  }
  (req as any)[source] = result.data;
  next();
};
```

Uso en router:

```ts
router.get('/', validate(listBooksQuery, 'query'), (req, res) => {
  const { author, page, pageSize } = req.query as z.infer<typeof listBooksQuery>;
  res.json(service.list({ author }));
});
```

### 12.9 Tests de schemas

Podés testear los contratos con casos borde:

```ts
import { describe, it, expect } from 'vitest'; // o jest
import { createBookSchema } from '../../src/routes/books';

describe('schema createBook', () => {
  it('rechaza year futuro', () => {
    const r = createBookSchema.safeParse({ title: 'T', author: 'A', year: 9999 });
    expect(r.success).toBe(false);
  });

  it('acepta datos válidos', () => {
    const r = createBookSchema.safeParse({ title: 'T', author: 'A', year: 2020 });
    expect(r.success).toBe(true);
  });
});
```

### 12.10 Errores comunes

* Usar `z.number()` en `query` sin `coerce` y que todo falle porque llegan strings.
* Olvidar `.strict()` y aceptar claves desconocidas.
* Poner lógica compleja en `.transform` en vez de en el servicio.
* Duplicar tipos (TS) y schemas (Zod) y que se desincronicen.

> Regla de oro: **valida en los bordes**, **aplica reglas en el dominio**, y **testea ambos** con TDD.


