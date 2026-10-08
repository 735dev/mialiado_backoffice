import type { Paginated } from '@/lib/api/types';

export const SEGMENTOS = ['todos', 'nivel', 'zona', 'inactivos'] as const;
export type Segmento = (typeof SEGMENTOS)[number];

export const NIVELES = ['aliado', 'aliadopro', 'aliadoplus'] as const;
export type NivelCodigo = (typeof NIVELES)[number];

export type EstadoNotificacion = 'borrador' | 'programada' | 'enviada' | 'parcial';
export type TabHistorial = 'todos' | 'programados' | 'enviados';
export type ModoEnvio = 'ahora' | 'programar' | 'borrador';

/** Fila del historial (GET /notificaciones). */
export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  segmento: Segmento;
  segmento_texto: string;
  filtro: { niveles?: string[]; zonas?: string[] } | null;
  programada_para: string | null;
  estado: EstadoNotificacion;
  destinatarios: number;
  enviados: number;
  aperturas: number;
  apertura_pct: number;
  enviada_at: string | null;
  created_at: string;
  /** Solo en la respuesta de POST /notificaciones cuando cayo en horario silencioso. */
  reprogramada?: boolean;
}

export interface ConsultaHistorial {
  tab: TabHistorial;
}

export type PaginaHistorial = Paginated<Notificacion>;

export interface Estimacion {
  alcance: number;
  total_usuarios: number;
  porcentaje: number;
  tasa_apertura_tipica: number | null;
}

export interface ParamsEstimar {
  segmento: Segmento;
  niveles: NivelCodigo[];
  zonas: string[];
}

export interface Plantilla {
  id: number;
  ambito: 'push' | 'soporte';
  nombre: string;
  titulo: string | null;
  cuerpo: string;
}

export interface NuevaNotificacion {
  titulo: string;
  mensaje: string;
  segmento: Segmento;
  niveles?: NivelCodigo[];
  zonas?: string[];
  modo: ModoEnvio;
  programada_para?: string;
}

export interface Zona {
  id: number;
  nombre: string;
}
