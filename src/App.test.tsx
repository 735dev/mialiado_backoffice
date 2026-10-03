import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App', () => {
  it('sin ruta muestra el login', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Panel de Aliado' })).toBeInTheDocument();
  });

  it('el menú lista las secciones del panel', () => {
    render(
      <MemoryRouter initialEntries={['/resumen']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Comercios' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Resumen' })).toBeInTheDocument();
  });
});
