import { handleErrorAxios, handleMessageAxios, isSuccessfully } from '@/lib/api/handlers';
import type { ApiResult } from '@/lib/api/types';

type AxiosFailure = Parameters<typeof handleErrorAxios>[0];
interface HttpResponse {
  status: number;
  data: unknown;
}

/** Ejecuta una peticion de apiAxios y la convierte en ApiResult<T> (nunca lanza). */
export async function run<T>(request: () => Promise<HttpResponse>, map: (data: unknown) => T = (d) => d as T): Promise<ApiResult<T>> {
  try {
    const res = await request();
    if (isSuccessfully(res.status)) return { ok: true, data: map(res.data) };
    return handleMessageAxios(res.data as Parameters<typeof handleMessageAxios>[0]);
  } catch (e) {
    return handleErrorAxios(e as AxiosFailure);
  }
}

type Primitive = string | number | boolean | null | undefined;

/** Query string que admite listas como parametros repetidos (`niveles=a&niveles=b`) y omite vacios. */
export function buildQuery(params: Record<string, Primitive | Primitive[]>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const list = Array.isArray(value) ? value : [value];
    for (const v of list) if (v !== undefined && v !== null && v !== '') usp.append(key, String(v));
  }
  const text = usp.toString();
  return text ? `?${text}` : '';
}
