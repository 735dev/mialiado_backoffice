import type { Paginated } from '@/lib/api/types';

export const TIPOS = ['canjes', 'comercios', 'usuarios', 'recargas', 'impulsos', 'valoraciones'] as const;
export type TipoReporte = (typeof TIPOS)[number];

export const FORMATOS = ['csv', 'xlsx', 'pdf'] as const;
export type FormatoReporte = (typeof FORMATOS)[number];
/** El backend solo genera CSV y XLSX; PDF responde 422. */
export const FORMATOS_DISPONIBLES: readonly FormatoReporte[] = ['csv', 'xlsx'];

export const NIVELES = ['aliado', 'aliadopro', 'aliadoplus'] as const;
export type NivelCodigo = (typeof NIVELES)[number];

export const FRECUENCIAS = ['diario', 'semanal', 'mensual'] as const;
export type Frecuencia = (typeof FRECUENCIAS)[number];

export type EstadoReporte = 'listo' | 'fallo' | 'vencido' | 'generando';

/** Fila de «Descargas recientes» (GET /reportes). */
export interface Reporte {
  id: number;
  nombre: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  estado: EstadoReporte;
  filas: number | null;
  bytes: number | null;
  created_at: string;
}

export type PaginaReportes = Paginated<Reporte>;

export interface CuerpoReporte {
  tipo: TipoReporte;
  nombre?: string;
  desde?: string;
  hasta?: string;
  categoria_id?: number;
  zona?: string;
  nivel?: NivelCodigo;
  columnas?: string[];
  formato: FormatoReporte;
}

export interface EstimacionReporte {
  filas: number;
  columnas: number;
  bytes_aprox: number;
}

export interface CatalogoColumnas {
  columnas: Record<TipoReporte, string[]>;
  por_defecto: Record<TipoReporte, string[]>;
}

export interface Programado {
  id: number;
  nombre: string;
  tipo: TipoReporte;
  formato: FormatoReporte;
  frecuencia: Frecuencia;
  dia: number | null;
  hora: string;
  destinatario: string;
  activo: boolean;
  columnas: string[] | null;
}

export interface CuerpoProgramado {
  tipo: TipoReporte;
  nombre: string;
  formato: FormatoReporte;
  frecuencia: Frecuencia;
  dia?: number;
  hora: string;
  destinatario: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  subcategorias?: { id: number; nombre: string }[];
}

export interface Zona {
  id: number;
  nombre: string;
}
