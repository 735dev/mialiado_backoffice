import type { AxiosError } from 'axios';
import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully, qs } from '@/lib/api/handlers';
import type { ApiResult, Paginated } from '@/lib/api/types';

// Contrato: aliado_backend/docs/api/admin.md (seccion Impulsos B08). Los modelos conservan el formato del backend.

export type ImpulsoEstado = 'en_curso' | 'finalizada' | 'pausada';
export type Dias = 7 | 30 | 90;

export interface Kpi {
  valor: number;
  variacion_pct?: number | null;
  variacion_pts?: number | null;
  definicion?: string;
}

export interface ImpulsosResumen {
  dias: Dias;
  kpis: { gasto_total: Kpi; vistas: Kpi; ctr: Kpi; canjes_atribuidos: Kpi };
  serie: { fecha: string; gasto: number; canjes: number }[];
  campanas: { total: number; en_curso: number; finalizadas: number; pausadas: number };
  puja_promedio: number;
  puja_minima: number;
}

export interface ImpulsoFila {
  id: number;
  puja_diaria: number;
  dias: number;
  gasto: number;
  vistas: number;
  canjes: number;
  estado: ImpulsoEstado;
  inicio: string | null;
  fin: string | null;
  comercio_id: number;
  comercio: string;
  logo_url: string | null;
  promocion: string | null;
  alcance_min: number;
  alcance_max: number;
}

export interface ImpulsosQuery {
  estado?: ImpulsoEstado;
  q?: string;
  page?: number;
  limit?: number;
}

async function run<T>(request: () => Promise<{ status: number; data: unknown }>, idKey: string | string[]): Promise<ApiResult<T>> {
  try {
    const res = await request();
    if (isSuccessfully(res.status, res.data, idKey)) return { ok: true, data: res.data as T };
    return handleMessageAxios(res.data as never);
  } catch (e) {
    return handleErrorAxios(e as AxiosError);
  }
}

export function obtenerResumenImpulsos(dias: Dias): Promise<ApiResult<ImpulsosResumen>> {
  return run<ImpulsosResumen>(() => apiAxios.get({ url: `/impulsos/resumen?${qs({ dias })}` }), 'kpis');
}

export function listarImpulsos(params: ImpulsosQuery): Promise<ApiResult<Paginated<ImpulsoFila>>> {
  return run<Paginated<ImpulsoFila>>(() => apiAxios.get({ url: `/impulsos?${qs({ ...params })}` }), 'links');
}

export function pausarImpulso(id: number): Promise<ApiResult<{ id: number; estado: ImpulsoEstado }>> {
  return run(() => apiAxios.post({ url: `/impulsos/${id}/pausar`, data: {} }), 'id');
}

export function reanudarImpulso(id: number): Promise<ApiResult<{ id: number; estado: ImpulsoEstado }>> {
  return run(() => apiAxios.post({ url: `/impulsos/${id}/reanudar`, data: {} }), 'id');
}
