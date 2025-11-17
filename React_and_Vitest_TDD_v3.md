# 🧪 TDD con React + Vite + TypeScript usando **Vitest**

## 1. Introducción al Test-Driven Development (TDD)

El **Desarrollo Guiado por Tests (TDD)** es una metodología de desarrollo de software donde los tests se escriben **antes** que el código de producción. El ciclo de TDD se resume en tres pasos:

1.  **Rojo (Red):** Escribir un test que falle. Este test debe describir una pequeña parte de la funcionalidad que aún no existe.
2.  **Verde (Green):** Escribir la cantidad mínima de código de producción necesaria para que el test pase.
3.  **Refactor (Refactor):** Refactorizar el código de producción (y los tests si es necesario) para mejorar su diseño y legibilidad, asegurándose de que todos los tests sigan pasando.

En el backend, herramientas como **Jest** son comunes para aplicar TDD. En el frontend con **React**, el proceso es idéntico, pero nos enfocaremos en probar **componentes de interfaz de usuario (UI)** y **hooks**, además de funciones puras.

## 2. Stack de pruebas recomendado para React

Para una experiencia completa y robusta de testing en React, usaremos el siguiente stack:

*   **Vitest**: El motor de pruebas principal que ejecuta tus tests.
*   **React Testing Library (RTL)**: Una librería que facilita el testing de componentes de UI de React de una manera que se asemeja a cómo un usuario interactuaría con ellos. Se enfoca en la accesibilidad y el comportamiento, no en la implementación interna.
*   **@testing-library/user-event**: Complemento de RTL que simula interacciones de usuario más realistas (clicks, tipeos, arrastres, etc.) en comparación con `fireEvent`.
*   **@testing-library/jest-dom**: Proporciona una colección de "matchers" personalizados de Jest que facilitan las aserciones sobre el estado del DOM, como `toBeInTheDocument`, `toHaveClass`, `toHaveStyle`, etc.

## 3. Configuración del proyecto React con Vitest

Vamos a preparar un proyecto base de React con TypeScript usando Vite, y luego instalaremos y configuraremos Vitest junto con las librerías de testing.

```bash
# 1. Crear un nuevo proyecto React + TypeScript con Vite
npm create vite@latest react-tdd-vitest -- --template react-ts
cd react-tdd-vitest

# 2. Instalar las dependencias de testing necesarias
npm install --save-dev vitest @testing-library/react \
  @testing-library/user-event @testing-library/jest-dom
```

### Configurar Vitest en `vite.config.ts`

Una vez instaladas las dependencias, necesitamos indicar a Vite cómo debe comportarse Vitest. Edita el archivo `vite.config.ts` en la raíz de tu proyecto para agregar la configuración específica de testing:

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Permite usar 'describe', 'it', 'expect' globalmente sin importar
    environment: 'jsdom', // Simula un entorno de navegador para renderizar componentes
    setupFiles: './src/setupTests.ts', // Archivo para configurar el entorno de tests (ej. matchers de jest-dom)
  },
})
```

**Explicación de la configuración:**

*   `globals: true`: Evita tener que importar `describe`, `it`, `expect` y otras funciones de Vitest en cada archivo de test.
*   `environment: 'jsdom'`: Es crucial para probar componentes de React. `jsdom` es una implementación de JavaScript de la API de muchos navegadores web. Permite que tus tests simulen un entorno de navegador para renderizar componentes de React sin necesidad de un navegador real.
*   `setupFiles: './src/setupTests.ts'`: Especifica un archivo que se ejecutará antes de todos tus tests. Aquí es donde importaremos los `matchers` adicionales de `@testing-library/jest-dom`.

### Crear `src/setupTests.ts`

Este archivo es donde puedes configurar el entorno de pruebas global. En nuestro caso, solo necesitamos importar los matchers extendidos de `jest-dom`.

```ts
// src/setupTests.ts
import '@testing-library/jest-dom';
```

### Agregar scripts de prueba a `package.json`

Para facilitar la ejecución de los tests, añade los siguientes scripts a la sección `scripts` de tu archivo `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "vitest",           // Ejecuta todos los tests una vez
  "test:watch": "vitest --watch", // Ejecuta tests y los vuelve a correr al detectar cambios
  "test:ui": "vitest --ui"    // Abre una interfaz gráfica para ver y depurar tests
}
```

Ahora, puedes ejecutar `npm run test` para correr tus pruebas desde la terminal o `npm run test:ui` para abrir una interfaz gráfica interactiva en el navegador que te mostrará el estado de tus tests en tiempo real.

`npm run test:ui` en acción: 

## 4. Ejemplo integrador: **Aplicación de Lista de Tareas (ToDo App)**

Vamos a construir una pequeña aplicación de lista de tareas ("ToDo App") aplicando el ciclo de TDD con Vitest y React Testing Library. Este ejemplo nos permitirá practicar el testing de componentes de UI, interacción del usuario y manejo de estado.

### **Enunciado del Ejercicio: ToDo App**

Desarrollar una aplicación de lista de tareas que cumpla con las siguientes funcionalidades:

1.  **Mostrar un mensaje inicial:** Si no hay tareas en la lista, la aplicación debe mostrar un mensaje claro indicando esta situación.
2.  **Agregar nuevas tareas:** Debe haber un campo de entrada de texto y un botón para que el usuario pueda escribir una nueva tarea y añadirla a la lista.
3.  **Visualizar tareas:** Las tareas agregadas deben aparecer en una lista.
4.  **Marcar como completadas:** Al hacer clic en una tarea de la lista, esta debe cambiar su estilo para indicar que ha sido completada (ej. tachando el texto). Si se hace clic nuevamente, debe volver a su estado original.



### 4.1 Primer Ciclo TDD: Test inicial para lista vacía

Comenzamos con la primera parte de nuestra especificación: "Mostrar mensaje si no hay tareas".

**1. Rojo (Red): Escribir un test que falle**

Crearemos un nuevo archivo de test `src/test/TodoApp.test.tsx`. Es una buena práctica colocar los tests junto a los componentes que prueban o en una carpeta `__tests__`.

```tsx
// src/stest/TodoApp.test.tsx
import { render, screen } from '@testing-library/react';
import TodoApp from '../TodoApp';

describe('TodoApp', () => {
  test('muestra mensaje cuando no hay tareas', () => {
    // Renderiza el componente TodoApp en un entorno de prueba virtual
    render(<TodoApp />);

    // Busca un elemento que contenga el texto "no hay tareas" (ignorando mayúsculas/minúsculas)
    // y verifica que esté presente en el documento.
    expect(screen.getByText(/no hay tareas/i)).toBeInTheDocument();
  });
});
```

Si ejecutas `npm run test` ahora, este test **fallará** porque el componente `TodoApp` aún no existe.

**2. Verde (Green): Implementación mínima para que el test pase**

Creamos el componente `src/TodoApp.tsx` con el código mínimo indispensable para que el test anterior pase.

```tsx
// src/TodoApp.tsx
import { useState } from 'react';

export default function TodoApp() {
  // Inicializamos las tareas como un array vacío
  const [tasks] = useState<string[]>([]);

  // Si no hay tareas, mostramos el mensaje esperado por el test
  if (tasks.length === 0) {
    return <p>No hay tareas</p>;
  }

  // Esto no se renderizará con el estado inicial, pero es para futuras implementaciones
  return <ul>{tasks.map((t, i) => <li key={i}>{t}</li>)}</ul>;
}
```

Ahora, ejecuta los tests de nuevo:

```bash
npm run test
```

Debería pasar ✅. ¡Hemos completado nuestro primer ciclo TDD!

**3. Refactor (Refactor):**

En este punto, el código es bastante simple, así que no hay mucho que refactorizar. Si hubiéramos introducido alguna complejidad, este sería el momento de mejorarla sin miedo, ya que tenemos el test que nos asegura que la funcionalidad básica sigue funcionando.



### 4.2 Segundo Ciclo TDD: Agregar tareas

Pasamos a la segunda funcionalidad: "Agregar nuevas tareas con un input y botón".

**1. Rojo (Red): Escribir un test que falle**

Añadimos un nuevo test al archivo `src/test/TodoApp.test.tsx` para verificar que se pueden agregar tareas.

```tsx
// src/test/TodoApp.test.tsx (agregar a los tests existentes)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'; // Importa userEvent para simular interacciones de usuario
import TodoApp from '../TodoApp';

describe('TodoApp', () => {
  // ... (test existente)

  test('permite agregar una tarea', async () => {
    // Renderiza el componente
    render(<TodoApp />);

    // Busca el input por su placeholder de texto
    const input = screen.getByPlaceholderText(/nueva tarea/i);
    // Busca el botón por su rol y nombre accesible
    const button = screen.getByRole('button', { name: /agregar/i });

    // Simula que el usuario escribe "Comprar leche" en el input
    await userEvent.type(input, 'Comprar leche');
    // Simula que el usuario hace clic en el botón
    await userEvent.click(button);

    // Verifica que la tarea recién agregada aparezca en el documento
    expect(screen.getByText('Comprar leche')).toBeInTheDocument();
  });
});
```

Si ejecutas `npm run test` ahora, este test **fallará** porque aún no tenemos el input, el botón o la lógica para añadir tareas.

**2. Verde (Green): Implementación mínima para que el test pase**

Modificamos `src/TodoApp.tsx` para incluir un input, un botón y la lógica para agregar tareas.

```tsx
// src/TodoApp.tsx
import { useState } from 'react';

export default function TodoApp() {
  const [tasks, setTasks] = useState<string[]>([]); // Ahora tasks puede cambiar
  const [text, setText] = useState(''); // Estado para el texto del input

  const addTask = () => {
    // Solo agrega la tarea si el input no está vacío
    if (text.trim() !== '') {
      setTasks([...tasks, text]); // Agrega la nueva tarea
      setText(''); // Limpia el input
    }
  };

  return (
    <div>
      {/* Mostramos el mensaje solo si no hay tareas */}
      {tasks.length === 0 && <p>No hay tareas</p>}

      {/* Input para la nueva tarea */}
      <input
        placeholder="Nueva tarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {/* Botón para agregar la tarea */}
      <button onClick={addTask}>Agregar</button>

      {/* Lista de tareas */}
      <ul>
        {tasks.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
    </div>
  );
}
```

Ejecuta los tests:

```bash
npm run test
```

Ambos tests deberían pasar ✅.

**3. Refactor (Refactor):**

Por ahora, el código está bien. Podríamos considerar un componente `TodoItem` más adelante, pero para la funcionalidad actual, es suficiente.



### 4.3 Tercer Ciclo TDD: Marcar tareas como completadas

Finalmente, implementaremos la funcionalidad de "Marcar tareas como completadas al hacer click".

**1. Rojo (Red): Escribir un test que falle**

Añadimos un test a `src/test/TodoApp.test.tsx` para verificar que al hacer clic en una tarea, esta se marca como completada (simularemos un tachado usando `text-decoration: line-through`).

```tsx
// src/test/TodoApp.test.tsx (agregar a los tests existentes)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoApp from './TodoApp';

describe('TodoApp', () => {
  // ... (tests existentes)

  test('permite marcar una tarea como completada', async () => {
    render(<TodoApp />);
    const input = screen.getByPlaceholderText(/nueva tarea/i);
    const button = screen.getByRole('button', { name: /agregar/i });

    // Primero, agregamos una tarea para poder interactuar con ella
    await userEvent.type(input, 'Estudiar React');
    await userEvent.click(button);

    // Obtenemos la tarea recién agregada
    const task = screen.getByText('Estudiar React');
    // Hacemos clic en la tarea
    await userEvent.click(task);

    // Verificamos que la tarea tenga el estilo "text-decoration: line-through"
    expect(task).toHaveStyle({ textDecoration: 'line-through' });

    // Opcional: Verificar que se puede desmarcar
    await userEvent.click(task);
    expect(task).not.toHaveStyle({ textDecoration: 'line-through' });
  });
});
```

Si ejecutas `npm run test`, este nuevo test **fallará** porque el componente `TodoApp` no tiene aún la lógica para marcar tareas como completadas o aplicar estilos.

**2. Verde (Green): Implementación mínima para que el test pase**

Modificamos `src/TodoApp.tsx`. Ahora cada tarea será un objeto con `text` y `done`.

```tsx
// src/TodoApp.tsx
import { useState } from 'react';

// Definimos un tipo para nuestras tareas para mayor claridad
type Task = { text: string; done: boolean };

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]); // Ahora las tareas son objetos
  const [text, setText] = useState('');

  const addTask = () => {
    if (text.trim()) {
      setTasks([...tasks, { text, done: false }]); // Agregamos la tarea como un objeto con done: false
      setText('');
    }
  };

  // Función para alternar el estado 'done' de una tarea
  const toggleTask = (index: number) => {
    setTasks(tasks.map((t, i) =>
      i === index ? { ...t, done: !t.done } : t // Si es la tarea del índice, alternamos 'done'
    ));
  };

  return (
    <div>
      {tasks.length === 0 && <p>No hay tareas</p>}
      <input
        placeholder="Nueva tarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={addTask}>Agregar</button>

      <ul>
        {tasks.map((t, i) => (
          <li
            key={i}
            onClick={() => toggleTask(i)} // Al hacer clic, llamamos a toggleTask
            style={{
              textDecoration: t.done ? 'line-through' : 'none', // Estilo condicional
              cursor: 'pointer' // Para indicar que es clickeable
            }}
          >
            {t.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Ejecuta los tests:

```bash
npm run test
```

Todos los tests deberían pasar ✅.

**3. Refactor (Refactor):**

En este punto, nuestro componente `TodoApp` está funcionando según las especificaciones. Un paso de refactorización podría ser extraer el `<li>` en un componente `TodoItem` para mejorar la modularidad y la legibilidad.



## 5. Buenas prácticas al escribir tests

Seguir estas buenas prácticas te ayudará a escribir tests más efectivos y fáciles de mantener:

*   **Mantener tests rápidos y aislados:** Cada test debe ser independiente y no depender del estado de otros tests. Esto garantiza que fallen por una razón específica y no por efectos secundarios. Los tests rápidos son cruciales para el ciclo de retroalimentación de TDD.
*   **Testear lo que ve el usuario, no la implementación interna:** React Testing Library promueve este principio. En lugar de probar los métodos internos de un componente o el estado directamente, interactúa con el componente como lo haría un usuario final y verifica el resultado visible en la UI.
*   **Usar queries accesibles:** Siempre que sea posible, utiliza las queries de RTL que priorizan la accesibilidad: `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`. Esto no solo hace tus tests más robustos a cambios de implementación, sino que también fomenta una UI más accesible.
    *   **Evita `getByTestId`** a menos que sea estrictamente necesario para un elemento no accesible de otra manera, ya que no refleja la experiencia del usuario.
*   **Ejecutar `vitest --ui` para ver resultados interactivos:** La interfaz de usuario de Vitest es una herramienta poderosa para depurar. Te permite ver el estado de tus tests en tiempo real, filtrar, re-ejecutar tests específicos e inspeccionar los resultados.

    `
*   **Para flujos completos o pruebas cross-browser, usar Cypress/Playwright:** Vitest (y RTL) son excelentes para pruebas unitarias y de integración de componentes. Sin embargo, para probar la aplicación completa desde la perspectiva del usuario final, incluyendo la interacción con APIs reales, navegación entre páginas y compatibilidad con diferentes navegadores, las herramientas de "End-to-End" (E2E) como Cypress o Playwright son más adecuadas.

## 6. Recursos recomendados para profundizar

*   **Vitest Docs**: La documentación oficial de Vitest es el mejor lugar para entender todas sus funcionalidades y configuraciones.
    *   [https://vitest.dev/](https://vitest.dev/)
*   **React Testing Library Docs**: Explora cómo testear diferentes aspectos de tus componentes React centrándote en la experiencia del usuario.
    *   [https://testing-library.com/docs/react-testing-library/intro/](https://testing-library.com/docs/react-testing-library/intro/)
*   **@testing-library/user-event**: Aprende a simular interacciones de usuario de forma más realista en tus tests.
    *   [https://testing-library.com/docs/user-event/intro](https://testing-library.com/docs/user-event/intro)
*   **@testing-library/jest-dom**: Consulta la lista completa de matchers personalizados para hacer aserciones poderosas sobre el DOM.
    *   [https://github.com/testing-library/jest-dom](https://github.com/testing-library/jest-dom)

