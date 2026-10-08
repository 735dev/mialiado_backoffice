import type { AxiosError } from 'axios';
import type { ApiError } from './types';

export interface RawBody {
  detail?: unknown;
  status?: number;
  message?: string;
  title?: string;
  /** Objeto `{campo: mensaje}` o lista `[{campo, mensaje}]` (formato del backend). */
  errors?: Record<string, string | string[]> | Array<{ campo?: unknown; mensaje?: unknown; field?: unknown; message?: unknown }>;
}

function mapDefaultTitle(s: number): string {
  if (s === 401) return 'errors.unauthorizedTitle';
  if (s === 403) return 'errors.forbiddenTitle';
  if (s === 404) return 'errors.notFoundTitle';
  if (s === 422) return 'errors.validationTitle';
  if (s >= 500) return 'errors.serverTitle';
  return 'errors.genericTitle';
}

function mapDefaultDetail(s: number): string {
  if (s === 401) return 'errors.unauthorizedDetail';
  if (s === 403) return 'errors.forbiddenDetail';
  if (s === 404) return 'errors.notFoundDetail';
  if (s === 422) return 'errors.validationDetail';
  if (s >= 500) return 'errors.serverDetail';
  return 'errors.genericDetail';
}

/** FastAPI devuelve `detail` como texto o, en algunos 422, como lista de `{loc, msg}`. */
function detailToText(detail: unknown): string | undefined {
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    const msgs = detail.map((d) => (d && typeof d === 'object' && 'msg' in d ? String((d as { msg: unknown }).msg) : ''));
    return msgs.filter(Boolean).join(' ') || undefined;
  }
  return undefined;
}

function fieldErrorsFrom(body: RawBody): Record<string, string> | undefined {
  const errors = body.errors;
  if (!errors || typeof errors !== 'object') return undefined;
  if (Array.isArray(errors)) {
    const out: Record<string, string> = {};
    for (const item of errors) {
      if (!item || typeof item !== 'object') continue;
      const campo = item.campo ?? item.field;
      const mensaje = item.mensaje ?? item.message;
      if (typeof campo !== 'string' || !campo || mensaje == null) continue;
      out[campo] = out[campo] ? `${out[campo]} ${String(mensaje)}` : String(mensaje);
    }
    return Object.keys(out).length ? out : undefined;
  }
  return Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v.join(' ') : String(v)]));
}

export function handleErrorAxios(error: AxiosError<unknown>): ApiError {
  const r = error.response;
  if (!r) {
    return { ok: false, status: 0, title: 'errors.network', detail: 'errors.network' };
  }
  const body = (r.data ?? {}) as RawBody;
  return {
    ok: false,
    status: r.status,
    title: body.title || body.message || mapDefaultTitle(r.status),
    detail: detailToText(body.detail) || body.message || mapDefaultDetail(r.status),
    fieldErrors: fieldErrorsFrom(body),
  };
}

export function handleMessageAxios(result: RawBody | null | undefined): ApiError {
  const body = result ?? {};
  const status = body.status ?? 400;
  return {
    ok: false,
    status,
    title: body.title || body.message || mapDefaultTitle(status),
    detail: detailToText(body.detail) || body.message || mapDefaultDetail(status),
    fieldErrors: fieldErrorsFrom(body),
  };
}

export function isSuccessfully(
  status: string | number | undefined | null,
  response: unknown = null,
  customId: string | string[] | null = null,
): boolean {
  if (customId && response && typeof response === 'object') {
    const keys = Array.isArray(customId) ? customId : [customId];
    if (keys.some((k) => k in (response as Record<string, unknown>))) return true;
  }
  if (typeof status === 'number' && status >= 200 && status < 300) return true;
  if (typeof status === 'string' && status === 'OK') return true;
  return false;
}

export type QueryValue = string | number | boolean | undefined | null;

export function qs(params: Record<string, QueryValue>): string {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
  });
  return usp.toString();
}
