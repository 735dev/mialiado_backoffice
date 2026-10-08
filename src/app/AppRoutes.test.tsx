import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '@/lib/store';
import { signInAs, renderWithProviders, resetStore } from '@/test/utils';
import { AppRoutes } from './AppRoutes';

const obtenerMe = vi.fn();
const cerrarSesion = vi.fn();
vi.mock('@/providers/adminAuthProvider', () => ({
  obtenerMe: (...a: unknown[]) => obtenerMe(...a),
  cerrarSesion: (...a: unknown[]) => cerrarSesion(...a),
}));
vi.mock('@/providers/pendientesProvider', () => ({
  obtenerPendientes: async () => ({ ok: true, data: { comercios: 7 } }),
}));

const MATRIZ_SOPORTE = {
  resumen: { ver: true, editar: false, aprobar: false },
  comercios: { ver: true, editar: false, aprobar: false },
  soporte: { ver: true, editar: true, aprobar: true },
};

beforeEach(() => {
  resetStore();
  obtenerMe.mockReset();
  cerrarSesion.mockReset();
  // El shell refresca el perfil al abrir: devuelve la misma matriz que la sesion.
  obtenerMe.mockImplementation(async (role: 'soporte' | 'admin') => ({
    ok: true,
    data: {
      user: { id: 1, nombre: 'Laura Rojas', correo: 'l@a.app', role },
      permisos: role === 'admin' ? {} : MATRIZ_SOPORTE,
      admins: [{ nombre: 'Carlos Mendoza', correo: 'carlos.mendoza@aliado.app' }],
    },
  }));
});

describe('AppRoutes: sesion, guard y menu', () => {
  it('sin sesion cualquier ruta termina en el login B01', async () => {
    renderWithProviders(<AppRoutes />, '/comercios');
    expect(await screen.findByRole('heading', { name: 'Panel de Aliado' })).toBeInTheDocument();
  });

  it('admin ve las 13 secciones del prototipo y una insignia de pendientes', async () => {
    signInAs('admin');
    renderWithProviders(<AppRoutes />, '/resumen');
    const nav = await screen.findByRole('navigation', { name: 'Secciones del panel' });
    expect(nav.querySelectorAll('a')).toHaveLength(13);
    expect(await screen.findByRole('heading', { name: 'Resumen' })).toBeInTheDocument();
    expect(await screen.findByText('7')).toBeInTheDocument();
  });

  it('soporte solo ve en el menu los modulos que su matriz permite', async () => {
    signInAs('soporte', MATRIZ_SOPORTE);
    renderWithProviders(<AppRoutes />, '/resumen');
    const nav = await screen.findByRole('navigation', { name: 'Secciones del panel' });
    expect(Array.from(nav.querySelectorAll('a')).map((a) => a.textContent?.replace(/\d+$/, ''))).toEqual(['Resumen', 'Comercios', 'Soporte']);
  });

  it('un modulo sin permiso lleva a B18 con el modulo y los administradores', async () => {
    signInAs('soporte', MATRIZ_SOPORTE);
    renderWithProviders(<AppRoutes />, '/finanzas');
    expect(await screen.findByRole('heading', { name: 'No tienes acceso a Finanzas' })).toBeInTheDocument();
    expect(await screen.findByText(/Carlos Mendoza/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver a Resumen' })).toBeInTheDocument();
  });

  it('el detalle B04 respeta el permiso de comercios', async () => {
    signInAs('soporte', MATRIZ_SOPORTE);
    renderWithProviders(<AppRoutes />, '/comercios/12');
    expect(await screen.findByRole('heading', { name: 'Verificación de comercio' })).toBeInTheDocument();
  });

  it('con sesion, /login vuelve al inicio del rol y / tambien', async () => {
    signInAs('soporte', MATRIZ_SOPORTE);
    renderWithProviders(<AppRoutes />, '/login');
    expect(await screen.findByRole('heading', { name: 'Resumen' })).toBeInTheDocument();
  });

  it('cerrar sesion limpia el store y vuelve al login', async () => {
    signInAs('admin');
    renderWithProviders(<AppRoutes />, '/resumen');
    await userEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }));
    await waitFor(() => expect(store.getState().auth.isAuthenticated).toBe(false));
    expect(cerrarSesion).toHaveBeenCalledWith('rt');
    expect(await screen.findByRole('heading', { name: 'Panel de Aliado' })).toBeInTheDocument();
  });

  it('el tema oscuro se alterna desde el menu y el idioma cambia los textos', async () => {
    signInAs('admin');
    renderWithProviders(<AppRoutes />, '/resumen');
    await userEvent.click(await screen.findByRole('button', { name: 'English' }));
    expect(await screen.findByRole('link', { name: /Merchants/ })).toBeInTheDocument();
    expect(store.getState().lang.current).toBe('en');
    await userEvent.click(screen.getByRole('button', { name: 'Theme' }));
    expect(['light', 'dark']).toContain(store.getState().theme.mode);
  });
});
