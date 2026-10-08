import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { store } from '@/lib/store';
import { renderWithProviders, resetStore } from '@/test/utils';
import LoginView from './LoginView';

const login = vi.fn();
const verificar2fa = vi.fn();
const obtenerMe = vi.fn();
vi.mock('@/providers/adminAuthProvider', () => ({
  login: (...a: unknown[]) => login(...a),
  verificar2fa: (...a: unknown[]) => verificar2fa(...a),
  obtenerMe: (...a: unknown[]) => obtenerMe(...a),
}));

const notifyFromApiError = vi.fn();
vi.mock('@/lib/utils/notify', () => ({ notify: { fromApiError: (e: unknown) => notifyFromApiError(e) } }));

const err = (status: number, detail: string) => ({ ok: false as const, status, title: 't', detail });

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/resumen" element={<p>INICIO</p>} />
      <Route path="/sin-permiso" element={<p>SIN PERMISO</p>} />
    </Routes>,
    '/login',
  );
}

async function fillCredentials() {
  await userEvent.type(screen.getByLabelText('Correo del equipo'), 'carlos.mendoza@aliado.app');
  await userEvent.type(screen.getByLabelText('Contraseña'), 'Demo12345');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
}

beforeEach(() => {
  resetStore();
  [login, verificar2fa, obtenerMe, notifyFromApiError].forEach((m) => m.mockReset());
});

describe('B01 login con segundo factor', () => {
  it('valida el formulario antes de llamar al backend', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect((await screen.findAllByText('Este campo es obligatorio')).length).toBe(2);
    expect(login).not.toHaveBeenCalled();
  });

  it('credenciales incorrectas se muestran en el formulario, no como sesion expirada', async () => {
    login.mockResolvedValue(err(401, 'Credenciales incorrectas'));
    renderLogin();
    await fillCredentials();
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas');
    expect(notifyFromApiError).not.toHaveBeenCalled();
  });

  it('login correcto pide el codigo; un codigo valido guarda la sesion y entra al inicio del rol', async () => {
    login.mockResolvedValue({ ok: true, data: { challengeToken: 'ch', configurado: true } });
    verificar2fa.mockResolvedValue({ ok: true, data: { accessToken: 'AT', refreshToken: 'RT', role: 'admin' } });
    obtenerMe.mockResolvedValue({
      ok: true,
      data: { user: { id: 1, nombre: 'Carlos', correo: 'c@a.app', role: 'admin' }, permisos: {}, admins: [] },
    });
    renderLogin();
    await fillCredentials();

    expect(await screen.findByRole('heading', { name: 'Verifica tu identidad' })).toBeInTheDocument();
    expect(login).toHaveBeenCalledWith('carlos.mendoza@aliado.app', 'Demo12345');
    expect(screen.queryByTestId('setup-2fa')).toBeNull();

    await userEvent.type(screen.getByLabelText('Código de 6 dígitos'), '482 913');
    await userEvent.click(screen.getByRole('button', { name: 'Verificar y entrar' }));

    expect(await screen.findByText('INICIO')).toBeInTheDocument();
    expect(verificar2fa).toHaveBeenCalledWith('ch', '482913');
    expect(obtenerMe).toHaveBeenCalledWith('admin', 'AT');
    expect(store.getState().auth).toMatchObject({ token: 'AT', refreshToken: 'RT', isAuthenticated: true });
  });

  it('primer ingreso muestra el secreto para la app autenticadora', async () => {
    login.mockResolvedValue({ ok: true, data: { challengeToken: 'ch', configurado: false, secreto: 'JBSWY3DPEHPK3PXP', otpauthUri: 'otpauth://totp/Aliado' } });
    renderLogin();
    await fillCredentials();
    expect(await screen.findByTestId('setup-2fa')).toHaveTextContent('JBSWY3DPEHPK3PXP');
  });

  it('codigo incorrecto se muestra en el formulario y no abre sesion', async () => {
    login.mockResolvedValue({ ok: true, data: { challengeToken: 'ch', configurado: true } });
    verificar2fa.mockResolvedValue(err(401, 'Código incorrecto'));
    renderLogin();
    await fillCredentials();
    await userEvent.type(await screen.findByLabelText('Código de 6 dígitos'), '000000');
    await userEvent.click(screen.getByRole('button', { name: 'Verificar y entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Código incorrecto');
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });

  it('un codigo que no tiene 6 digitos no llega al backend', async () => {
    login.mockResolvedValue({ ok: true, data: { challengeToken: 'ch', configurado: true } });
    renderLogin();
    await fillCredentials();
    await userEvent.type(await screen.findByLabelText('Código de 6 dígitos'), '12');
    await userEvent.click(screen.getByRole('button', { name: 'Verificar y entrar' }));
    expect(await screen.findByText('El código tiene 6 dígitos')).toBeInTheDocument();
    expect(verificar2fa).not.toHaveBeenCalled();
  });

  it('un rol sin ninguna seccion termina en B18', async () => {
    login.mockResolvedValue({ ok: true, data: { challengeToken: 'ch', configurado: true } });
    verificar2fa.mockResolvedValue({ ok: true, data: { accessToken: 'AT', refreshToken: 'RT', role: 'finanzas' } });
    obtenerMe.mockResolvedValue({ ok: true, data: { user: { id: 2, nombre: 'F', correo: 'f@a.app', role: 'finanzas' }, permisos: {}, admins: [] } });
    renderLogin();
    await fillCredentials();
    await userEvent.type(await screen.findByLabelText('Código de 6 dígitos'), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Verificar y entrar' }));
    await waitFor(() => expect(screen.getByText('SIN PERMISO')).toBeInTheDocument());
  });

  it('errores de red o servidor van al aviso global', async () => {
    login.mockResolvedValue(err(0, 'errors.network'));
    renderLogin();
    await fillCredentials();
    await waitFor(() => expect(notifyFromApiError).toHaveBeenCalled());
  });
});
