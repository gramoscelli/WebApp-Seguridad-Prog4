// Test para componente Login - Cambio de título
// Siguiendo TDD: Rojo -> Verde -> Refactor

import { render, screen } from '@testing-library/react';
import Login from '../components/Login';

describe('Login Component', () => {
  const mockOnLogin = vi.fn();

  it('debería mostrar "Bienvenido al Sistema" como título principal', () => {
    render(<Login onLogin={mockOnLogin} />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Bienvenido al Sistema');
  });

  it('no debería mostrar "Iniciar Sesión" como título', () => {
    render(<Login onLogin={mockOnLogin} />);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).not.toHaveTextContent('Iniciar Sesión');
  });

  it('debería mostrar el formulario de login', () => {
    render(<Login onLogin={mockOnLogin} />);

    expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });
});
