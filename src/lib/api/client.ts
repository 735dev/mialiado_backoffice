import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/lib/config/env';
import { PATHS } from '@/lib/routes/paths';
import { getStoreRef, persistor } from '@/lib/store';
import { logout, tokensRenewed } from '@/lib/store/slices/authSlice';
import { showInfoModal } from '@/lib/store/slices/uiSlice';

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.apiBase,
  timeout: env.timeoutMs,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const state = getStoreRef().getState();
  const token = state.auth.token;
  // Un Authorization explicito (p. ej. /auth/me justo tras el segundo factor, antes de guardar la sesion) se respeta.
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = state.lang.current === 'en' ? 'en-US' : 'es-ES';
  return config;
});

/** Rutas de acceso: un 401 ahi es una respuesta normal (credenciales o codigo malos, refresh vencido), nunca dispara renovacion. */
const AUTH_PATHS = ['/auth/login', '/auth/2fa', '/auth/aceptar-invitacion', '/auth/refresh', '/auth/logout'];
const isAuthUrl = (url?: string): boolean => !!url && AUTH_PATHS.some((p) => url.includes(p));

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/** Refresh en curso: las peticiones que fallan a la vez comparten esta promesa (un solo POST /auth/refresh). */
let refreshing: Promise<string | null> | null = null;

async function endSession(): Promise<void> {
  getStoreRef().dispatch(logout());
  await persistor.purge();
  window.location.replace(PATHS.login);
}

/**
 * Renueva el par de tokens y lo guarda en el slice auth (persistido). Devuelve el access nuevo.
 * 401/403 del refresh -> cierra sesion (null). Red caida o 5xx -> lanza para no tumbar una sesion que puede seguir valida.
 */
async function refreshSession(): Promise<string | null> {
  const store = getStoreRef();
  const refreshToken = store.getState().auth.refreshToken;
  if (!refreshToken) {
    await endSession();
    return null;
  }
  // Import dinamico: refreshProvider usa apiAxios -> client (ciclo).
  const { renovarSesion } = await import('@/providers/refreshProvider');
  const res = await renovarSesion(refreshToken);
  if (res.ok) {
    store.dispatch(tokensRenewed({ token: res.data.accessToken, refreshToken: res.data.refreshToken }));
    return res.data.accessToken;
  }
  if (res.status === 401 || res.status === 403) {
    await endSession();
    return null;
  }
  throw new Error(res.detail);
}

/** Renueva compartiendo una sola promesa entre quien lo pida. null = sesion cerrada; lanza si no hubo red / 5xx. */
export function renewSession(): Promise<string | null> {
  refreshing ??= refreshSession().finally(() => {
    refreshing = null;
  });
  return refreshing;
}

/** Renueva (una vez compartida) y reintenta la peticion original; rechaza con el error original si no se pudo. */
async function renewAndRetry(error: AxiosError, original: RetriableConfig): Promise<unknown> {
  original._retried = true;
  try {
    const token = await renewSession();
    if (!token) return Promise.reject(error); // sesion cerrada
    original.headers.Authorization = `Bearer ${token}`;
    return httpClient.request(original);
  } catch {
    return Promise.reject(error); // refresh sin red / 5xx: la sesion se conserva
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const store = getStoreRef();
    const original = error.config as RetriableConfig | undefined;

    if (status === 401 && original && !isAuthUrl(original.url) && store.getState().auth.token) {
      // Primer 401: se renueva UNA vez y se reintenta UNA vez. Un 401 tras el reintento: la sesion no es valida.
      if (!original._retried) return renewAndRetry(error, original);
      await endSession();
      return Promise.reject(error);
    }
    if (status >= 500) {
      store.dispatch(showInfoModal({ type: 'error', code: status, description: 'errors.serverGeneric' }));
    }
    return Promise.reject(error);
  },
);
