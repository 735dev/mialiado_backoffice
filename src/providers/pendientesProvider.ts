import type { AxiosError } from 'axios';
import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully } from '@/lib/api/handlers';
import type { ApiResult } from '@/lib/api/types';
import type { Modulo } from '@/lib/constants/modules';

/** Insignias del menu por modulo (GET /pendientes, modulo resumen). */
export type Pendientes = Partial<Record<Modulo, number>>;

export function pendientesFromJson(j: Record<string, unknown>): Pendientes {
  const n = (v: unknown) => (typeof v === 'number' && v > 0 ? v : undefined);
  return {
    comercios: n(j.comercios_por_verificar),
    promociones: n(j.promos_por_moderar),
    soporte: n(j.tickets_sin_leer) ?? n(j.tickets_abiertos),
    finanzas: n(j.recargas_por_conciliar),
  };
}

export async function obtenerPendientes(): Promise<ApiResult<Pendientes>> {
  try {
    const res = await apiAxios.get({ url: '/pendientes' });
    if (isSuccessfully(res.status)) return { ok: true, data: pendientesFromJson(res.data as Record<string, unknown>) };
    return handleMessageAxios(res.data);
  } catch (e) {
    return handleErrorAxios(e as AxiosError);
  }
}
