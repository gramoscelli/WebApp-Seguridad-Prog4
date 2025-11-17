// Test para componente HelloButton
// Siguiendo TDD: Rojo -> Verde -> Refactor

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HelloButton from '../components/HelloButton';

describe('HelloButton', () => {
  it('debería mostrar un botón con texto "Mostrar Mensaje"', () => {
    render(<HelloButton />);

    const button = screen.getByRole('button', { name: /mostrar mensaje/i });
    expect(button).toBeInTheDocument();
  });

  it('debería mostrar "Hola Mundo" al hacer clic en el botón', async () => {
    render(<HelloButton />);

    const button = screen.getByRole('button', { name: /mostrar mensaje/i });

    // Inicialmente no debería mostrar el mensaje
    expect(screen.queryByText(/hola mundo/i)).not.toBeInTheDocument();

    // Click en el botón
    await userEvent.click(button);

    // Ahora debería mostrar el mensaje
    expect(screen.getByText(/hola mundo/i)).toBeInTheDocument();
  });

  it('debería ocultar el mensaje al hacer clic de nuevo', async () => {
    render(<HelloButton />);

    const button = screen.getByRole('button', { name: /mostrar mensaje/i });

    // Mostrar mensaje
    await userEvent.click(button);
    expect(screen.getByText(/hola mundo/i)).toBeInTheDocument();

    // Ocultar mensaje
    await userEvent.click(button);
    expect(screen.queryByText(/hola mundo/i)).not.toBeInTheDocument();
  });
});
