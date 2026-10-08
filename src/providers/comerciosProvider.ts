import type { AxiosError } from 'axios';
import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully, qs } from '@/lib/api/handlers';
import type { ApiResult, Paginated } from '@/lib/api/types';
import { env } from '@/lib/config/env';

export type TabComercios = 'todos' | 'por_verificar' | 'activos' | 'suspendidos';
export type EstadoComercio = 'Por verificar' | 'Activo' | 'Suspendido' | 'Rechazado';

export interface ConteosComercios {
  todos: number;
  por_verificar: number;
  activos: number;
  suspendidos: number;
}

export interface ComercioItem {
  id: number;
  nombre: string;
  rif: string;
  logo_url: string | null;
  zona: string | null;
  categoria: string | null;
  verificacion: string;
  sts: string;
  estado: EstadoComercio;
  promos: number;
  canjes_30d: number;
  created_at: string;
}

export interface ListaComercios extends Paginated<ComercioItem> {
  conteos: ConteosComercios;
}

export interface FiltrosComercios {
  tab: TabComercios;
  q: string;
  categoria_id: number | null;
  zona: string;
}

export interface DocumentoComercio {
  id: number;
  tipo: 'rif' | 'registro' | 'fachada' | string;
  nombre: string | null;
  url: string;
  revisado: boolean;
}

export interface DuenoComercio {
  id: number;
  nombre: string;
  rol: string;
  correo: string | null;
  telefono: string | null;
}

export interface EventoLinea {
  evento: string;
  fecha: string;
  por: string | null;
}

export interface HorarioDia {
  dia: number;
  nombre: string;
  abierto: boolean;
  turnos: Array<{ desde: string; hasta: string }>;
}

export interface ComercioDetalle {
  id: number;
  nombre: string;
  rif: string;
  razon_social: string | null;
  categoria: string | null;
  direccion: string | null;
  zona: string | null;
  ciudad: string | null;
  lat: number | null;
  lng: number | null;
  logo_url: string | null;
  whatsapp: string | null;
  instagram: string | null;
  correo_contacto: string | null;
  verificacion: string;
  motivo_rechazo: string | null;
  sts: string;
  estado: EstadoComercio;
  created_at: string;
  horario: HorarioDia[];
  apertura: unknown;
  dueno: DuenoComercio;
  documentos: DocumentoComercio[];
  documentos_revisados: number;
  linea_de_tiempo: EventoLinea[];
}

export interface CategoriaOpcion {
  id: number;
  nombre: string;
}

export interface ZonaOpcion {
  id: number;
  nombre: string;
}

type ListaParams = Partial<FiltrosComercios> & { page: number; limit: number };

async function run<T>(req: () => Promise<{ status: number; data: unknown }>): Promise<ApiResult<T>> {
  try {
    const res = await req();
    if (isSuccessfully(res.status)) return { ok: true, data: res.data as T };
    return handleMessageAxios(res.data as never);
  } catch (e) {
    return handleErrorAxios(e as AxiosError);
  }
}

/** GET /comercios (modulo comercios). Paginado con page/limit y `conteos` por pestana. */
export function listarComercios(p: ListaParams): Promise<ApiResult<ListaComercios>> {
  const query = qs({ tab: p.tab, q: p.q?.trim(), categoria_id: p.categoria_id, zona: p.zona, page: p.page, limit: p.limit });
  return run<ListaComercios>(() => apiAxios.get({ url: `/comercios?${query}` }));
}

export const obtenerComercio = (id: number) => run<ComercioDetalle>(() => apiAxios.get({ url: `/comercios/${id}` }));
export const iniciarRevision = (id: number) => run<ComercioDetalle>(() => apiAxios.post({ url: `/comercios/${id}/revision` }));
export const revisarDocumento = (id: number, docId: number, revisado: boolean) =>
  run<ComercioDetalle>(() => apiAxios.post({ url: `/comercios/${id}/documentos/${docId}/revisar?revisado=${revisado}` }));
export const aprobarComercio = (id: number) => run<ComercioDetalle>(() => apiAxios.post({ url: `/comercios/${id}/aprobar` }));
export const rechazarComercio = (id: number, body: { motivo: string; comentario?: string }) =>
  run<ComercioDetalle>(() => apiAxios.post({ url: `/comercios/${id}/rechazar`, data: body }));

/** Base publica de la API (sin /admin): /categorias y /ubicacion/zonas no pertenecen al backoffice. */
const publicBase = env.apiBase.replace(/\/admin\/?$/, '');

/** GET /api/categorias (publico): categorias padre con sus subcategorias, para el filtro. */
export async function listarCategorias(): Promise<ApiResult<CategoriaOpcion[]>> {
  const r = await run<Array<{ id: number; nombre: string; subcategorias?: CategoriaOpcion[] }>>(() =>
    apiAxios.get({ url: '/categorias', config: { baseURL: publicBase } }),
  );
  if (!r.ok) return r;
  return { ok: true, data: r.data.flatMap((c) => [{ id: c.id, nombre: c.nombre }, ...(c.subcategorias ?? []).map((s) => ({ id: s.id, nombre: s.nombre }))]) };
}

/** GET /api/ubicacion/zonas (publico). */
export const listarZonas = () => run<ZonaOpcion[]>(() => apiAxios.get({ url: '/ubicacion/zonas', config: { baseURL: publicBase } }));

/** POST /comercios/invitar (editar, 202): envia la invitacion por correo. */
export const invitarComercio = (body: { correo: string; nombre?: string }) =>
  run<{ invitado: boolean; correo: string }>(() => apiAxios.post({ url: '/comercios/invitar', data: body }));
