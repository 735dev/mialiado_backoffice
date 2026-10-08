import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';
import { httpClient } from './client';

type FormPrimitive = string | number | boolean | Blob;
type FormValue = FormPrimitive | null | undefined;
export type FormPayload = Record<string, FormValue | FormValue[]>;

export interface ApiArgs {
  url: string;
  data?: FormPayload | FormData | object;
  config?: AxiosRequestConfig;
  isWWWUrl?: boolean;
  showToast?: boolean;
  loadingMessage?: string;
}

type Res = Promise<AxiosResponse>;
type Method = 'post' | 'put' | 'patch';

function hasFiles(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  return Object.values(data as object).some(
    (v) => v instanceof Blob || (Array.isArray(v) && v.some((i) => i instanceof Blob)),
  );
}

function toUrlEncoded(data: FormPayload): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((x) => x != null && params.append(k, String(x)));
    else if (v != null) params.append(k, String(v));
  });
  return params;
}

function toFormData(data: FormPayload | FormData | object | undefined): FormData | undefined {
  if (!data) return undefined;
  if (data instanceof FormData) return data;
  const fd = new FormData();
  Object.entries(data as FormPayload).forEach(([k, v]) => {
    const list = Array.isArray(v) ? v : [v];
    list.forEach((x) => {
      if (x == null) return;
      fd.append(k, x instanceof Blob ? x : String(x));
    });
  });
  return fd;
}

function withToast<T>(p: Promise<T>, loading = 'Cargando...'): Promise<T> {
  toast.promise(p, { loading });
  return p;
}

function send(method: Method, a: ApiArgs): Res {
  if (a.isWWWUrl) {
    return httpClient[method](a.url, toUrlEncoded((a.data ?? {}) as FormPayload), {
      ...a.config,
      headers: { ...a.config?.headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  }
  if (a.data instanceof FormData || hasFiles(a.data)) {
    return httpClient[method](a.url, toFormData(a.data), {
      ...a.config,
      headers: { ...a.config?.headers, 'Content-Type': 'multipart/form-data' },
    });
  }
  return httpClient[method](a.url, a.data, a.config);
}

const wrap = (a: ApiArgs, req: Res): Res => (a.showToast ? withToast(req, a.loadingMessage) : req);

/** Unico punto de entrada HTTP. JSON por defecto; multipart si hay archivos; urlencoded con `isWWWUrl`. */
export const apiAxios = {
  get: (a: ApiArgs): Res => wrap(a, httpClient.get(a.url, a.config)),
  delete: (a: ApiArgs): Res => wrap(a, httpClient.delete(a.url, a.config)),
  post: (a: ApiArgs): Res => wrap(a, send('post', a)),
  put: (a: ApiArgs): Res => wrap(a, send('put', a)),
  patch: (a: ApiArgs): Res => wrap(a, send('patch', a)),
};
