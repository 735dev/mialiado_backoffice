import type { AxiosError } from 'axios';
import { apiAxios } from '@/lib/api/api';
import { handleErrorAxios, handleMessageAxios, isSuccessfully, qs } from '@/lib/api/handlers';
import type { ApiResult, Paginated } from '@/lib/api/types';

// Contrato: aliado_backend/docs/api/admin.md (seccion Usuarios B05, B06). Los modelos conservan el formato del backend.

export type NivelCodigo = 'aliado' | 'aliadopro' | 'aliadoplus';
export type UsuarioTab = 'todos' | NivelCodigo | 'bloqueados';
export type UsuarioEstado = 'Activo' | 'Bloqueado';

export interface UsuarioFila {
  id: number;
  nombre: string;
  usuario: string;
  foto_url: string | null;
  ciudad: string | null;
  nivel: NivelCodigo;
  compras: number;
  ahorro_total: number;
  estado: UsuarioEstado;
  ultimo_acceso: string | null;
}

export interface UsuariosResumen {
  total: number;
  bloqueados: { usuarios: number; porcentaje: number };
  niveles: { nivel: NivelCodigo; usuarios: number; porcentaje: number; desde: number }[];
}

export interface UsuariosPage extends Paginated<UsuarioFila> {
  resumen: UsuariosResumen | null;
}

export interface UsuariosQuery {
  tab?: UsuarioTab;
  ciudad?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface CanjeResumen {
  id: number;
  folio: string;
  fecha: string;
  comercio: string;
  promocion: string | null;
  descuento_pct: number;
  ahorro: number;
  estado: 'Canjeado' | 'Anulado';
}

export interface ProgresoNivel {
  codigo: NivelCodigo;
  nombre: string;
  puntos_extra: number;
  compras: number;
  compras_mes: number;
  es_maximo: boolean;
  bajo_por_inactividad: boolean;
  siguiente: { codigo: NivelCodigo; nombre: string; faltan: number } | null;
  mantenimiento: { requeridas: number; hechas: number; faltan: number };
}

export interface UsuarioDetalle {
  id: number;
  nombre: string;
  usuario: string;
  correo: string;
  telefono: string | null;
  foto_url: string | null;
  ciudad: string | null;
  cedula: string | null;
  carnet_plus: boolean;
  estado: UsuarioEstado;
  motivo_bloqueo: string | null;
  nivel_forzado: NivelCodigo | null;
  registro: string;
  ultimo_acceso: string | null;
  compras: number;
  ahorro_total: number;
  comercios_visitados: number;
  primera_compra: string | null;
  calificaciones: { total: number; promedio: number; comercios: number };
  progreso: ProgresoNivel;
  ultimos_canjes: CanjeResumen[];
}

export interface CanjeFila {
  id: number;
  folio: string;
  created_at: string;
  descuento: number;
  descuento_pct: number;
  total: number;
  estado: string;
  comercio: string;
  promocion: string | null;
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

const base = (id: number) => `/usuarios/${id}`;

export function listarUsuarios(params: UsuariosQuery): Promise<ApiResult<UsuariosPage>> {
  return run<UsuariosPage>(() => apiAxios.get({ url: `/usuarios?${qs({ ...params, tab: params.tab === 'todos' ? undefined : params.tab })}` }), 'links');
}

export function obtenerUsuario(id: number): Promise<ApiResult<UsuarioDetalle>> {
  return run<UsuarioDetalle>(() => apiAxios.get({ url: base(id) }), 'id');
}

export function listarCanjesUsuario(id: number, params: { page?: number; limit?: number }): Promise<ApiResult<Paginated<CanjeFila>>> {
  return run<Paginated<CanjeFila>>(() => apiAxios.get({ url: `${base(id)}/canjes?${qs(params)}` }), 'links');
}

export function bloquearUsuario(id: number, motivo: string): Promise<ApiResult<UsuarioDetalle>> {
  return run<UsuarioDetalle>(() => apiAxios.post({ url: `${base(id)}/bloquear`, data: { motivo } }), 'id');
}

export function desbloquearUsuario(id: number): Promise<ApiResult<UsuarioDetalle>> {
  return run<UsuarioDetalle>(() => apiAxios.post({ url: `${base(id)}/desbloquear`, data: {} }), 'id');
}

/** `nivel: null` devuelve al calculo automatico por compras. */
export function cambiarNivelUsuario(id: number, nivel: NivelCodigo | null, motivo: string): Promise<ApiResult<UsuarioDetalle>> {
  return run<UsuarioDetalle>(() => apiAxios.post({ url: `${base(id)}/nivel`, data: { nivel, motivo } }), 'id');
}

export function enviarMensajeUsuario(id: number, titulo: string, mensaje: string): Promise<ApiResult<{ enviado: boolean }>> {
  return run<{ enviado: boolean }>(() => apiAxios.post({ url: `${base(id)}/mensaje`, data: { titulo, mensaje } }), 'enviado');
}
