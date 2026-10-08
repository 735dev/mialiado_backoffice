import type { AxiosError } from 'axios';
import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully } from '@/lib/api/handlers';
import type { ApiResult } from '@/lib/api/types';

export type DiasResumen = 7 | 30 | 90;

export interface Kpi {
  valor: number;
  variacion_pct: number | null;
  nuevos?: number;
}

export interface PuntoCanjes {
  fecha: string;
  canjes: number;
  media_7d: number | null;
}

export interface PendientesResumen {
  comercios_por_verificar: number;
  promos_por_moderar: number;
  tickets_abiertos: number;
  tickets_sin_leer: number;
  recargas_por_conciliar: number;
}

export interface TopComercio {
  posicion: number;
  id: number;
  nombre: string;
  logo_url: string | null;
  canjes: number;
}

export interface CanjesCategoria {
  categoria: string;
  canjes: number;
  porcentaje: number;
}

export interface Actividad {
  texto: string;
  detalle: string | null;
  fecha: string;
  tipo: 'comercio' | 'recarga' | 'promocion' | string;
}

export interface Resumen {
  kpis: {
    usuarios_activos: Kpi;
    canjes_mes: Kpi;
    comercios_activos: Kpi;
    ingresos_impulsos: Kpi;
  };
  canjes_por_dia: { dias: number; serie: PuntoCanjes[] };
  pendientes: PendientesResumen;
  top_comercios: TopComercio[];
  canjes_por_categoria: CanjesCategoria[];
  actividad_reciente: Actividad[];
}

/** GET /resumen?dias=7|30|90 (modulo resumen). */
export async function obtenerResumen(dias: DiasResumen): Promise<ApiResult<Resumen>> {
  try {
    const res = await apiAxios.get({ url: `/resumen?dias=${dias}` });
    if (isSuccessfully(res.status)) return { ok: true, data: res.data as Resumen };
    return handleMessageAxios(res.data);
  } catch (e) {
    return handleErrorAxios(e as AxiosError);
  }
}
