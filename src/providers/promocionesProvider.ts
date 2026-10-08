import type { AxiosError } from 'axios';
import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully, qs } from '@/lib/api/handlers';
import type { ApiResult, Paginated } from '@/lib/api/types';

// Contrato: aliado_backend/docs/api/admin.md (seccion Promociones, moderacion B07, B17). Los modelos conservan el formato del backend.

export type PromoTipo = 'descuento' | 'flash';
export type PromoNivel = 'aliado' | 'aliadopro' | 'aliadoplus';
export type PromoRevision = 'Listo' | 'Supera 50 %' | 'Sin foto';
export type MotivoRechazo = 'supera_maximo' | 'fotos_invalidas' | 'vigencia_incorrecta' | 'se_acumula' | 'contenido_enganoso' | 'otro';

export interface PromoFila {
  id: number;
  codigo: string;
  titulo: string;
  tipo: PromoTipo;
  foto: string | null;
  comercio: { id: number; nombre: string; logo_url: string | null };
  enviada_por: string;
  creada: string;
  descuento_base: number;
  descuento_max: number;
  alertas: { codigo: string; mensaje: string }[];
  revision: PromoRevision;
  tope: number;
}

export interface PromoConteos {
  todas: number;
  descuento: number;
  flash: number;
  sin_alertas: number;
}

export interface PromosPage extends Paginated<PromoFila> {
  conteos: PromoConteos | null;
}

export interface PromoDetalle extends PromoFila {
  estado: string;
  descripcion: string | null;
  fotos: string[];
  precio_normal: number | null;
  inicio: string | null;
  fin: string | null;
  hora_desde: string | null;
  hora_hasta: string | null;
  dias: string[] | string | null;
  condiciones: string[];
  precios_por_nivel: { nivel: PromoNivel; descuento_pct: number; precio: number; puntos_extra: number }[];
  reglas_automaticas: { cumplidas: number; total: number; checks: { clave: string; ok: boolean; texto: string }[] };
  comercio_detalle: { id: number; nombre: string; rif: string | null; verificacion: string; direccion: string | null };
  motivos_rechazo: { codigo: MotivoRechazo; texto: string }[];
}

export interface PromosQuery {
  tipo?: PromoTipo;
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

export function listarPromociones(params: PromosQuery): Promise<ApiResult<PromosPage>> {
  return run<PromosPage>(() => apiAxios.get({ url: `/promociones?${qs({ ...params })}` }), 'links');
}

export function obtenerPromocion(id: number): Promise<ApiResult<PromoDetalle>> {
  return run<PromoDetalle>(() => apiAxios.get({ url: `/promociones/${id}` }), 'id');
}

export function aprobarPromocion(id: number): Promise<ApiResult<{ id: number; estado: 'activa' | 'programada' }>> {
  return run(() => apiAxios.post({ url: `/promociones/${id}/aprobar`, data: {} }), 'id');
}

export function rechazarPromocion(id: number, motivo: MotivoRechazo, comentario?: string): Promise<ApiResult<{ id: number; estado: string }>> {
  return run(() => apiAxios.post({ url: `/promociones/${id}/rechazar`, data: { motivo, ...(comentario ? { comentario } : {}) } }), 'id');
}

export function pedirCambiosPromocion(id: number, comentario: string): Promise<ApiResult<{ id: number; estado: string }>> {
  return run(() => apiAxios.post({ url: `/promociones/${id}/pedir-cambios`, data: { comentario } }), 'id');
}

export function aprobarSinAlertas(): Promise<ApiResult<{ aprobadas: number }>> {
  return run(() => apiAxios.post({ url: '/promociones/aprobar-sin-alertas', data: {} }), 'aprobadas');
}
