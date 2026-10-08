import { apiAxios } from '@/lib/api/api';
import type { ApiResult } from '@/lib/api/types';
import { env } from '@/lib/config/env';
import type {
  CatalogoColumnas,
  Categoria,
  CuerpoProgramado,
  CuerpoReporte,
  EstimacionReporte,
  PaginaReportes,
  Programado,
  Reporte,
  Zona,
} from '../models/reporte';
import { buildQuery, run, runBlob } from './http';

// Contrato: aliado_backend/docs/api/admin.md, seccion «Reportes (B14)».

export function obtenerColumnas(): Promise<ApiResult<CatalogoColumnas>> {
  return run(() => apiAxios.get({ url: '/reportes/columnas' }));
}

export function estimarReporte(body: CuerpoReporte): Promise<ApiResult<EstimacionReporte>> {
  return run(() => apiAxios.post({ url: '/reportes/estimar', data: body }));
}

/** Se genera al momento; el 422 de PDF («aun no esta disponible») llega con el `detail` del servidor. */
export function generarReporte(body: CuerpoReporte): Promise<ApiResult<Reporte>> {
  return run(() => apiAxios.post({ url: '/reportes', data: body }));
}

export function listarReportes(p: { page: number; limit: number }): Promise<ApiResult<PaginaReportes>> {
  return run(() => apiAxios.get({ url: `/reportes${buildQuery({ page: p.page, limit: p.limit })}` }));
}

/** Archivo binario (CSV con BOM o XLSX). Va por apiAxios con el token en el encabezado: nunca se pone el token en una URL. */
export function descargarReporte(id: number): Promise<ApiResult<Blob>> {
  return runBlob(() => apiAxios.get({ url: `/reportes/${id}/descargar`, config: { responseType: 'blob' } }));
}

export function listarProgramados(): Promise<ApiResult<Programado[]>> {
  return run(() => apiAxios.get({ url: '/reportes/programados' }));
}

export function crearProgramado(body: CuerpoProgramado): Promise<ApiResult<Programado>> {
  return run(() => apiAxios.post({ url: '/reportes/programados', data: body }));
}

export function borrarProgramado(id: number): Promise<ApiResult<null>> {
  return run(() => apiAxios.delete({ url: `/reportes/programados/${id}` }), () => null);
}

const baseApp = (): string => env.apiBase.replace(/\/admin\/?$/, '');

/** Categorias visibles (endpoint publico de la app: GET /api/categorias) para el filtro del reporte. */
export function listarCategorias(): Promise<ApiResult<Categoria[]>> {
  return run(() => apiAxios.get({ url: '/categorias', config: { baseURL: baseApp() } }));
}

/** Zonas conocidas (endpoint publico de la app: GET /api/ubicacion/zonas). */
export function listarZonas(): Promise<ApiResult<Zona[]>> {
  return run(() => apiAxios.get({ url: '/ubicacion/zonas', config: { baseURL: baseApp() } }));
}
