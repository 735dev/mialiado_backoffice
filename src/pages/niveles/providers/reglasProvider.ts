import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully, type RawBody } from '@/lib/api/handlers';
import type { ApiResult } from '@/lib/api/types';
import type { Reglas, ReglasPayload, Version } from '../models/reglas';

async function call<T>(run: () => Promise<{ status: number; data: unknown }>): Promise<ApiResult<T>> {
  try {
    const res = await run();
    if (isSuccessfully(res.status)) return { ok: true, data: res.data as T };
    return handleMessageAxios(res.data as RawBody);
  } catch (e) {
    return handleErrorAxios(e as Parameters<typeof handleErrorAxios>[0]);
  }
}

/** GET /reglas: niveles, reglas vigentes, vista previa y versiones. */
export const obtenerReglas = () => call<Reglas>(() => apiAxios.get({ url: '/reglas' }));

/** PUT /reglas (editar): crea una version nueva; rige de inmediato. 422 si no cambia nada. */
export const guardarReglas = (payload: ReglasPayload) => call<unknown>(() => apiAxios.put({ url: '/reglas', data: payload }));

/** GET /reglas/versiones: historial completo. */
export const listarVersiones = () => call<Version[]>(() => apiAxios.get({ url: '/reglas/versiones' }));

/** POST /reglas/restaurar: crea una version nueva con el contenido de la elegida. */
export const restaurarVersion = (version: number) => call<unknown>(() => apiAxios.post({ url: '/reglas/restaurar', data: { version } }));
