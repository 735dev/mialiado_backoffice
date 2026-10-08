import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully, qs, type RawBody } from '@/lib/api/handlers';
import type { ApiResult, Paginated } from '@/lib/api/types';
import type { Conteos, Kpis, Recarga, RecargaDetalle, RecargasQuery, ResumenFinanzas } from '../models/finanzas';

async function call<T>(run: () => Promise<{ status: number; data: unknown }>, map: (d: unknown) => T): Promise<ApiResult<T>> {
  try {
    const res = await run();
    if (isSuccessfully(res.status)) return { ok: true, data: map(res.data) };
    return handleMessageAxios(res.data as RawBody);
  } catch (e) {
    return handleErrorAxios(e as Parameters<typeof handleErrorAxios>[0]);
  }
}

/** GET /finanzas/recargas: lista paginada (+ kpis y conteos, que aqui se descartan; ver obtenerResumen). */
export function listarRecargas(params: RecargasQuery & { page: number; limit: number }): Promise<ApiResult<Paginated<Recarga>>> {
  const url = `/finanzas/recargas?${qs({
    estado: params.estado === 'todas' ? undefined : params.estado,
    q: params.q.trim(),
    page: params.page,
    limit: params.limit,
  })}`;
  return call(
    () => apiAxios.get({ url }),
    (d) => d as Paginated<Recarga>,
  );
}

/** KPIs y conteos por estado: vienen en la misma respuesta de la lista; se pide una pagina de 1 sin filtros. */
export function obtenerResumen(): Promise<ApiResult<ResumenFinanzas>> {
  return call(
    () => apiAxios.get({ url: `/finanzas/recargas?${qs({ page: 1, limit: 1 })}` }),
    (d) => {
      const j = d as { kpis: Kpis; conteos: Conteos };
      return { kpis: j.kpis, conteos: j.conteos };
    },
  );
}

export function obtenerRecarga(id: number): Promise<ApiResult<RecargaDetalle>> {
  return call(
    () => apiAxios.get({ url: `/finanzas/recargas/${id}` }),
    (d) => d as RecargaDetalle,
  );
}

/** Solo `pendiente`: suma a la billetera del comercio y le avisa. */
export function acreditarRecarga(id: number): Promise<ApiResult<unknown>> {
  return call(
    () => apiAxios.post({ url: `/finanzas/recargas/${id}/acreditar` }),
    (d) => d,
  );
}

/** Solo `acreditada`; 409 si el comercio ya gasto ese saldo. */
export function reembolsarRecarga(id: number): Promise<ApiResult<unknown>> {
  return call(
    () => apiAxios.post({ url: `/finanzas/recargas/${id}/reembolsar` }),
    (d) => d,
  );
}

/** Acredita todas las pendientes: { acreditadas }. */
export function conciliarPendientes(): Promise<ApiResult<{ acreditadas: number }>> {
  return call(
    () => apiAxios.post({ url: '/finanzas/conciliar' }),
    (d) => ({ acreditadas: Number((d as { acreditadas?: number }).acreditadas ?? 0) }),
  );
}
