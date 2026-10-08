import { apiAxios } from '@/lib/api/api';
import type { ApiResult } from '@/lib/api/types';
import type {
  CambiosTicket,
  ConsultaBandeja,
  MiembroEquipo,
  NuevoTicket,
  PaginaBandeja,
  PlantillaRespuesta,
  TicketDetalle,
  UsuarioBusqueda,
} from '../models/ticket';
import { buildQuery, run } from '@/lib/api/http';

// Contrato: aliado_backend/docs/api/admin.md, seccion «Soporte (B13)».

export function listarTickets(p: ConsultaBandeja & { page: number; limit: number }): Promise<ApiResult<PaginaBandeja>> {
  const query = buildQuery({ tab: p.tab, q: p.q.trim(), prioridad: p.prioridad, origen: p.origen, page: p.page, limit: p.limit });
  return run(() => apiAxios.get({ url: `/soporte/tickets${query}` }));
}

/** Abrir el detalle marca el ticket como leido en el servidor. */
export function obtenerTicket(id: number): Promise<ApiResult<TicketDetalle>> {
  return run(() => apiAxios.get({ url: `/soporte/tickets/${id}` }));
}

export function responderTicket(id: number, body: { cuerpo: string; tipo: 'mensaje' | 'nota' }): Promise<ApiResult<unknown>> {
  return run(() => apiAxios.post({ url: `/soporte/tickets/${id}/mensajes`, data: body }));
}

export function actualizarTicket(id: number, cambios: CambiosTicket): Promise<ApiResult<unknown>> {
  return run(() => apiAxios.patch({ url: `/soporte/tickets/${id}`, data: cambios }));
}

export function crearTicket(body: NuevoTicket): Promise<ApiResult<unknown>> {
  return run(() => apiAxios.post({ url: '/soporte/tickets', data: body }));
}

export function listarPlantillasRespuesta(): Promise<ApiResult<PlantillaRespuesta[]>> {
  return run(() => apiAxios.get({ url: '/soporte/plantillas' }));
}

/** Busca personas para abrirles un ticket (GET /usuarios?q=, requiere el permiso de Usuarios). */
export function buscarUsuarios(q: string): Promise<ApiResult<UsuarioBusqueda[]>> {
  return run(
    () => apiAxios.get({ url: `/usuarios${buildQuery({ q: q.trim(), limit: 6 })}` }),
    (d) => (d as { data: UsuarioBusqueda[] }).data,
  );
}

/** Quienes pueden recibir un ticket (GET /equipo, requiere el permiso de Equipo). Solo se listan las personas activas. */
export function listarMiembros(): Promise<ApiResult<MiembroEquipo[]>> {
  return run(
    () => apiAxios.get({ url: '/equipo?estado=activos' }),
    (d) => (d as { data: MiembroEquipo[] }).data.filter((m) => m.estado === 'A'),
  );
}
