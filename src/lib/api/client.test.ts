import type { AxiosAdapter, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getStoreRef } from '@/lib/store';
import { signedIn } from '@/lib/store/slices/authSlice';
import { httpClient } from './client';

const obtenerMe = vi.fn();
vi.mock('@/providers/adminAuthProvider', () => ({ obtenerMe: (r: string) => obtenerMe(r) }));
const renovarSesion = vi.fn();
vi.mock('@/providers/refreshProvider', () => ({ renovarSesion: (t: string) => renovarSesion(t) }));

const user = { id: 1, nombre: 'Carlos', correo: 'a@a.com', role: 'admin' as const };
const replace = vi.fn();
let calls: { url: string; auth?: string }[] = [];

/** Adaptador falso: 200 si el Bearer es el vigente (`good`), 401 si no. /auth/login siempre 401. */
function installAdapter(good: string) {
  const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
    const auth = String(config.headers.Authorization ?? '');
    calls.push({ url: config.url ?? '', auth });
    const ok = !/\/auth\/(login|2fa)/.test(config.url ?? '') && auth === `Bearer ${good}`;
    const response = { data: { ok }, status: ok ? 200 : 401, statusText: '', headers: {}, config };
    if (ok) return response;
    throw Object.assign(new Error('401'), { isAxiosError: true, config, response }) as AxiosError;
  };
  httpClient.defaults.adapter = adapter;
}

const renovado = { ok: true, data: { accessToken: 'nuevo', refreshToken: 'r2', expiresIn: 3600 } };

beforeEach(() => {
  calls = [];
  renovarSesion.mockReset();
  replace.mockReset();
  vi.stubGlobal('location', { replace });
  getStoreRef().dispatch(signedIn({ token: 'viejo', refreshToken: 'r1', user, permisos: null }));
});

describe('renovacion de sesion en 401', () => {
  it('renueva, guarda el par nuevo y reintenta con el token nuevo', async () => {
    installAdapter('nuevo');
    renovarSesion.mockResolvedValue(renovado);
    const res = await httpClient.get('/algo');
    expect(res.status).toBe(200);
    expect(renovarSesion).toHaveBeenCalledWith('r1');
    expect(getStoreRef().getState().auth).toMatchObject({ token: 'nuevo', refreshToken: 'r2', isAuthenticated: true });
    expect(calls.map((c) => c.auth)).toEqual(['Bearer viejo', 'Bearer nuevo']);
  });

  it('3 peticiones simultaneas hacen un solo refresh', async () => {
    installAdapter('nuevo');
    renovarSesion.mockResolvedValue(renovado);
    const out = await Promise.all([httpClient.get('/a'), httpClient.get('/b'), httpClient.get('/c')]);
    expect(out.map((r) => r.status)).toEqual([200, 200, 200]);
    expect(renovarSesion).toHaveBeenCalledTimes(1);
  });

  it('refresh fallido (401) cierra sesion y vuelve a la bienvenida', async () => {
    installAdapter('nuevo');
    renovarSesion.mockResolvedValue({ ok: false, status: 401, detail: 'vencido' });
    await expect(httpClient.get('/algo')).rejects.toMatchObject({ response: { status: 401 } });
    expect(getStoreRef().getState().auth).toMatchObject({ token: null, refreshToken: null, isAuthenticated: false });
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('red caida durante el refresh conserva la sesion', async () => {
    installAdapter('nuevo');
    renovarSesion.mockResolvedValue({ ok: false, status: 0, detail: 'errors.network' });
    await expect(httpClient.get('/algo')).rejects.toBeTruthy();
    expect(getStoreRef().getState().auth.token).toBe('viejo');
    expect(replace).not.toHaveBeenCalled();
  });

  it('no reintenta mas de una vez: si el reintento sigue en 401 cierra sesion', async () => {
    installAdapter('otro');
    renovarSesion.mockResolvedValue(renovado);
    await expect(httpClient.get('/algo')).rejects.toMatchObject({ response: { status: 401 } });
    expect(renovarSesion).toHaveBeenCalledTimes(1);
    expect(calls).toHaveLength(2);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('un 401 de /auth/login o /auth/2fa no dispara renovacion ni logout', async () => {
    installAdapter('viejo');
    await expect(httpClient.post('/auth/login', {})).rejects.toMatchObject({ response: { status: 401 } });
    await expect(httpClient.post('/auth/2fa', {})).rejects.toMatchObject({ response: { status: 401 } });
    expect(renovarSesion).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(getStoreRef().getState().auth.token).toBe('viejo');
  });
});

describe('403 de permiso', () => {
  it('vuelve a pedir /auth/me para que el guard lleve a B18 si ya no tiene ver', async () => {
    const adapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
      const response = { data: { detail: 'No tienes acceso a comercios' }, status: 403, statusText: '', headers: {}, config };
      throw Object.assign(new Error('403'), { isAxiosError: true, config, response }) as AxiosError;
    };
    httpClient.defaults.adapter = adapter;
    const permisos = { comercios: { ver: false, editar: false, aprobar: false } };
    obtenerMe.mockResolvedValue({ ok: true, data: { user, permisos, admins: [] } });
    await expect(httpClient.get('/comercios')).rejects.toMatchObject({ response: { status: 403 } });
    expect(obtenerMe).toHaveBeenCalledWith('admin');
    expect(getStoreRef().getState().auth.permisos).toEqual(permisos);
    expect(getStoreRef().getState().auth.isAuthenticated).toBe(true);
    expect(renovarSesion).not.toHaveBeenCalled();
  });
});
