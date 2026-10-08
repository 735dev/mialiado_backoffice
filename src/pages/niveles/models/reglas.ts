export type NivelCodigo = 'aliado' | 'aliadopro' | 'aliadoplus';

export interface Nivel {
  codigo: NivelCodigo | string;
  nombre: string;
  orden: number;
  desde: number;
  puntos_extra: number;
  usuarios: number;
  hasta?: number | null;
}

export interface ReglasValores {
  ventana_anulacion_min: number;
  descuento_max_pct: number;
  recarga_minima: number;
  compras_mes_mantener: number;
  dias_baja_nivel: number;
  moderacion_previa: boolean;
  puja_minima: number;
  qr_vigencia_seg: number;
  combinacion: string;
}

export interface Version {
  version: number;
  resumen: string;
  fecha: string;
  autor: string;
}

export interface VistaPrevia {
  precio_normal: number;
  descuento_base: number;
  niveles: Array<{ nivel: string; descuento_pct: number; precio: number; puntos_extra?: number }>;
  ejemplo_flash: { descuento_pct: number; precio_aliadopro: number; nota?: string };
}

export interface Reglas {
  version: number;
  niveles: Nivel[];
  reglas: ReglasValores;
  vista_previa: VistaPrevia;
  versiones: Version[];
}

/** Campos editables de las reglas (todo menos `combinacion`, que es informativa). */
export const REGLA_KEYS = [
  'ventana_anulacion_min',
  'descuento_max_pct',
  'recarga_minima',
  'compras_mes_mantener',
  'dias_baja_nivel',
  'moderacion_previa',
  'puja_minima',
  'qr_vigencia_seg',
] as const;
export type ReglaKey = (typeof REGLA_KEYS)[number];

/** Body de PUT /reglas: solo lo que cambio (los tres niveles juntos si cambia alguno). */
export interface ReglasPayload extends Partial<Pick<ReglasValores, ReglaKey>> {
  niveles?: Array<{ codigo: string; desde: number; puntos_extra: number }>;
  resumen?: string;
}
