import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully, type RawBody } from '@/lib/api/handlers';
import type { ApiResult } from '@/lib/api/types';
import type { ActualizarCategoriaBody, Arbol, CrearCategoriaBody } from '../models/categoria';

async function call<T>(run: () => Promise<{ status: number; data: unknown }>): Promise<ApiResult<T>> {
  try {
    const res = await run();
    if (isSuccessfully(res.status)) return { ok: true, data: res.data as T };
    return handleMessageAxios(res.data as RawBody);
  } catch (e) {
    return handleErrorAxios(e as Parameters<typeof handleErrorAxios>[0]);
  }
}

/** GET /categorias: arbol completo, ocultas incluidas. */
export const listarCategorias = () => call<Arbol>(() => apiAxios.get({ url: '/categorias' }));

/** POST /categorias (201). Solo dos niveles: `parent_id` debe ser una categoria principal. */
export const crearCategoria = (body: CrearCategoriaBody) => call<unknown>(() => apiAxios.post({ url: '/categorias', data: body }));

/** PATCH /categorias/{id}. Ocultar una categoria la quita de la app y de los filtros. */
export const actualizarCategoria = (id: number, body: ActualizarCategoriaBody) =>
  call<unknown>(() => apiAxios.patch({ url: `/categorias/${id}`, data: body }));

/** PUT /categorias/orden: nueva posicion de cada hermano. Devuelve el arbol. */
export const ordenarCategorias = (orden: Array<{ id: number; posicion: number }>) =>
  call<unknown>(() => apiAxios.put({ url: '/categorias/orden', data: { orden } }));

/** DELETE /categorias/{id} (204). 409 si tiene subcategorias o comercios. */
export const eliminarCategoria = (id: number) => call<unknown>(() => apiAxios.delete({ url: `/categorias/${id}` }));
