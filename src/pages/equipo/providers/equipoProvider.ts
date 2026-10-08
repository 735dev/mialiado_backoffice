import { apiAxios } from '@/lib/api/api';
import type { ApiResult } from '@/lib/api/types';
import type { CambiosMiembro, FiltroEstado, InvitacionNueva, ListaEquipo, MatrizPermisos, MiembroInvitado, RespuestaPermisos } from '../models/equipo';
import { buildQuery, run } from './http';

// Contrato: aliado_backend/docs/api/admin.md, seccion «Equipo y roles (B15)».

export function listarEquipo(filtro: FiltroEstado): Promise<ApiResult<ListaEquipo>> {
  const estado = filtro === 'todos' ? undefined : filtro;
  return run(() => apiAxios.get({ url: `/equipo${buildQuery({ estado })}` }));
}

export function invitarMiembro(body: InvitacionNueva): Promise<ApiResult<MiembroInvitado>> {
  return run(() => apiAxios.post({ url: '/equipo', data: body }));
}

export function actualizarMiembro(id: number, cambios: CambiosMiembro): Promise<ApiResult<unknown>> {
  return run(() => apiAxios.patch({ url: `/equipo/${id}`, data: cambios }));
}

export function eliminarMiembro(id: number): Promise<ApiResult<null>> {
  return run(() => apiAxios.delete({ url: `/equipo/${id}` }), () => null);
}

export function restablecer2fa(id: number): Promise<ApiResult<null>> {
  return run(() => apiAxios.post({ url: `/equipo/${id}/reset-2fa` }), () => null);
}

export function obtenerPermisos(): Promise<ApiResult<RespuestaPermisos>> {
  return run(() => apiAxios.get({ url: '/equipo/permisos' }));
}

/** Solo se envian los roles y modulos que cambian; `admin` se rechaza con 422. */
export function guardarPermisos(permisos: MatrizPermisos): Promise<ApiResult<unknown>> {
  return run(() => apiAxios.put({ url: '/equipo/permisos', data: { permisos } }));
}
