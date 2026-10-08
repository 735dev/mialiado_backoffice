import type { AxiosError } from 'axios';
import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully } from '@/lib/api/handlers';
import type { ApiResult } from '@/lib/api/types';
import { MODULOS, type Permisos } from '@/lib/constants/modules';
import { pickRole, type Role } from '@/lib/constants/roles';
import type { AuthUser } from '@/lib/store/slices/authSlice';

// Contrato: aliado_backend/docs/api/admin.md (seccion Acceso B01).

/** Respuesta de POST /auth/login: no entrega sesion, pide el segundo factor. */
export interface LoginChallenge {
  challengeToken: string;
  /** false = primer ingreso: hay que mostrar el secreto / QR para la app autenticadora. */
  configurado: boolean;
  secreto?: string;
  otpauthUri?: string;
}

export interface AdminSession {
  accessToken: string;
  refreshToken: string;
  role: Role;
}

export interface MeModel {
  user: AuthUser;
  permisos: Permisos;
  /** Quien puede darte acceso (pantalla B18). */
  admins: { nombre: string; correo: string }[];
}

type Json = Record<string, unknown>;

export function challengeFromJson(j: Json): LoginChallenge {
  return {
    challengeToken: String(j.challenge_token),
    configurado: j.configurado !== false,
    secreto: typeof j.secreto === 'string' ? j.secreto : undefined,
    otpauthUri: typeof j.otpauth_uri === 'string' ? j.otpauth_uri : undefined,
  };
}

/** Devuelve null si la sesion no trae un rol del backoffice (no deberia pasar: el backend responde 403 antes). */
export function sessionFromJson(j: Json): AdminSession | null {
  const role = pickRole(j.roles as string[] | undefined);
  if (!role) return null;
  return { accessToken: String(j.access_token), refreshToken: String(j.refresh_token), role };
}

/** Solo se conservan los modulos conocidos; los flags ausentes cuentan como false. */
export function permisosFromJson(raw: unknown): Permisos {
  const out: Permisos = {};
  const src = (raw ?? {}) as Record<string, Partial<Record<'ver' | 'editar' | 'aprobar', boolean>> | undefined>;
  for (const modulo of MODULOS) {
    const p = src[modulo];
    if (p) out[modulo] = { ver: p.ver === true, editar: p.editar === true, aprobar: p.aprobar === true };
  }
  return out;
}

export function meFromJson(j: Json, role: Role): MeModel {
  return {
    user: {
      id: j.id as number | string,
      nombre: String(j.nombre ?? ''),
      correo: String(j.correo ?? ''),
      role,
      rolEtiqueta: typeof j.rol_etiqueta === 'string' ? j.rol_etiqueta : undefined,
    },
    permisos: permisosFromJson(j.permisos),
    admins: Array.isArray(j.admins) ? (j.admins as { nombre: string; correo: string }[]) : [],
  };
}

async function call<T>(run: () => Promise<{ status: number; data: unknown }>, parse: (data: Json) => T): Promise<ApiResult<T>> {
  try {
    const res = await run();
    if (isSuccessfully(res.status)) return { ok: true, data: parse(res.data as Json) };
    return handleMessageAxios(res.data as Json);
  } catch (e) {
    return handleErrorAxios(e as AxiosError);
  }
}

export const login = (correo: string, password: string): Promise<ApiResult<LoginChallenge>> =>
  call(() => apiAxios.post({ url: '/auth/login', data: { correo, password } }), challengeFromJson);

export const verificar2fa = (challengeToken: string, codigo: string): Promise<ApiResult<AdminSession | null>> =>
  call(() => apiAxios.post({ url: '/auth/2fa', data: { challenge_token: challengeToken, codigo } }), sessionFromJson);

/**
 * Perfil y matriz de permisos. `accessToken` explicito solo se usa justo tras el segundo factor, cuando la sesion
 * todavia no esta en el store; despues el interceptor pone el token del store y renueva ante 401.
 */
export const obtenerMe = (role: Role, accessToken?: string): Promise<ApiResult<MeModel>> =>
  call(
    () => apiAxios.get({ url: '/auth/me', config: accessToken ? { headers: { Authorization: `Bearer ${accessToken}` } } : undefined }),
    (j) => meFromJson(j, role),
  );

/** Cierra la sesion en el servidor (revoca el refresh). El cierre local no depende de que esto funcione. */
export async function cerrarSesion(refreshToken: string | null): Promise<void> {
  if (!refreshToken) return;
  try {
    await apiAxios.post({ url: '/auth/logout', data: { refresh_token: refreshToken } });
  } catch {
    // sin red o refresh ya vencido: igual se cierra la sesion local
  }
}
