import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { store } from '@/lib/store';
import { logout, signedIn, type AuthUser } from '@/lib/store/slices/authSlice';
import type { Permisos } from '@/lib/constants/modules';

export function resetStore() {
  store.dispatch(logout());
}

/** Inicia sesion en el store sin pasar por la red (para probar guards y menu). */
export function signInAs(role: AuthUser['role'], permisos: Permisos | null = null, nombre = 'Persona de prueba') {
  store.dispatch(signedIn({ token: 'tk', refreshToken: 'rt', user: { id: 1, nombre, correo: 'p@aliado.app', role }, permisos }));
}

export function renderWithProviders(ui: ReactElement, route: string | { pathname: string; search?: string; state?: unknown } = '/') {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </Provider>,
  );
}
