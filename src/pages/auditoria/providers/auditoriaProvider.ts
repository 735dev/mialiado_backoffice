import { apiAxios } from '@/lib/api/api';
import type { ApiResult, Paginated } from '@/lib/api/types';
import type { ConsultaAuditoria, DetalleEvento, Evento, Persona } from '../models/evento';
import { buildQuery, run, runBlob } from '@/lib/api/http';

// Contrato: aliado_backend/docs/api/admin.md, seccion «Auditoria (B16)».

const filtros = (c: ConsultaAuditoria) => ({ accion: c.accion, modulo: c.modulo, usuario_id: c.usuario_id, desde: c.desde, hasta: c.hasta, q: c.q.trim() });

export function listarEventos(p: ConsultaAuditoria & { page: number; limit: number }): Promise<ApiResult<Paginated<Evento>>> {
  return run(() => apiAxios.get({ url: `/auditoria${buildQuery({ ...filtros(p), page: p.page, limit: p.limit })}` }));
}

export function obtenerEvento(id: number): Promise<ApiResult<DetalleEvento>> {
  return run(() => apiAxios.get({ url: `/auditoria/${id}` }));
}

/** CSV con los mismos filtros. La exportacion tambien queda registrada en la auditoria. Se baja por apiAxios (token en el encabezado). */
export function exportarEventos(c: ConsultaAuditoria): Promise<ApiResult<Blob>> {
  return runBlob(() => apiAxios.get({ url: `/auditoria/exportar${buildQuery(filtros(c))}`, config: { responseType: 'blob' } }));
}

/** Personas del equipo para el filtro «Persona» (GET /equipo, requiere el permiso de Equipo). */
export function listarPersonas(): Promise<ApiResult<Persona[]>> {
  return run(
    () => apiAxios.get({ url: '/equipo' }),
    (d) => (d as { data: Persona[] }).data.map((m) => ({ id: m.id, nombre: m.nombre })),
  );
}
