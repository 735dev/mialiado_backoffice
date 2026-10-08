import { apiAxios } from '@/lib/api/api';
import type { ApiResult } from '@/lib/api/types';
import { env } from '@/lib/config/env';
import type {
  ConsultaHistorial,
  Estimacion,
  NuevaNotificacion,
  Notificacion,
  PaginaHistorial,
  ParamsEstimar,
  Plantilla,
  Zona,
} from '../models/notificacion';
import { buildQuery, run } from '@/lib/api/http';

// Contrato: aliado_backend/docs/api/admin.md, seccion «Notificaciones masivas (B12)».

export function listarNotificaciones(p: ConsultaHistorial & { page: number; limit: number }): Promise<ApiResult<PaginaHistorial>> {
  return run(() => apiAxios.get({ url: `/notificaciones${buildQuery({ tab: p.tab, page: p.page, limit: p.limit })}` }));
}

export function estimarAlcance(p: ParamsEstimar): Promise<ApiResult<Estimacion>> {
  const query = buildQuery({ segmento: p.segmento, niveles: p.segmento === 'nivel' ? p.niveles : [], zonas: p.segmento === 'zona' ? p.zonas : [] });
  return run(() => apiAxios.get({ url: `/notificaciones/estimar${query}` }));
}

export function crearNotificacion(body: NuevaNotificacion): Promise<ApiResult<Notificacion>> {
  return run(() => apiAxios.post({ url: '/notificaciones', data: body }));
}

export function enviarPrueba(body: { titulo: string; mensaje: string }): Promise<ApiResult<unknown>> {
  return run(() => apiAxios.post({ url: '/notificaciones/prueba', data: body }));
}

export function enviarNotificacion(id: number): Promise<ApiResult<Notificacion>> {
  return run(() => apiAxios.post({ url: `/notificaciones/${id}/enviar` }));
}

export function cancelarNotificacion(id: number): Promise<ApiResult<null>> {
  return run(() => apiAxios.delete({ url: `/notificaciones/${id}` }), () => null);
}

export function listarPlantillas(): Promise<ApiResult<Plantilla[]>> {
  return run(() => apiAxios.get({ url: '/notificaciones/plantillas?ambito=push' }));
}

export function crearPlantilla(body: { nombre: string; titulo: string; cuerpo: string }): Promise<ApiResult<Plantilla>> {
  return run(() => apiAxios.post({ url: '/notificaciones/plantillas', data: { ambito: 'push', ...body } }));
}

export function borrarPlantilla(id: number): Promise<ApiResult<null>> {
  return run(() => apiAxios.delete({ url: `/notificaciones/plantillas/${id}` }), () => null);
}

/** Zonas conocidas (endpoint publico de la app: GET /api/ubicacion/zonas); cuelga de la misma base que /api/admin. */
export function listarZonas(): Promise<ApiResult<Zona[]>> {
  const baseURL = env.apiBase.replace(/\/admin\/?$/, '');
  return run(() => apiAxios.get({ url: '/ubicacion/zonas', config: { baseURL } }));
}
