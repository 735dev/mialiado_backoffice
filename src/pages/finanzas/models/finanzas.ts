import type { Paginated } from '@/lib/api/types';

export const ESTADOS = ['pendiente', 'acreditada', 'rechazada', 'reembolsada'] as const;
export type EstadoRecarga = (typeof ESTADOS)[number];
export type FiltroEstado = 'todas' | EstadoRecarga;

export interface Recarga {
  id: number;
  referencia: string;
  metodo: string;
  monto: number;
  comision: number;
  estado: EstadoRecarga;
  created_at: string;
  comercio_id: number;
  comercio: string;
  logo_url: string | null;
}

export interface Kpis {
  recargas_mes: { valor: number; variacion_pct: number | null };
  pendientes: { cantidad: number; monto: number };
  comision: { valor: number; variacion_pct: number | null };
  reembolsos: { monto: number; operaciones: number };
}

export type Conteos = Record<FiltroEstado, number>;

export interface ResumenFinanzas {
  kpis: Kpis;
  conteos: Conteos;
}

export interface EventoLinea {
  evento: string;
  /** ISO; los eventos aun abiertos traen `hace_min` en su lugar. */
  fecha?: string | null;
  hace_min?: number | null;
}

export interface RecargaDetalle {
  id: number;
  referencia: string;
  metodo: string;
  monto: number;
  comision: number;
  estado: EstadoRecarga;
  proveedor_ref: string | null;
  conciliado_por: string | null;
  created_at: string;
  acreditada_at: string | null;
  comercio: { id: number; nombre: string; logo_url: string | null };
  saldo_actual: number;
  saldo_tras_acreditar: number | null;
  linea_de_tiempo: EventoLinea[];
}

export interface RecargasQuery {
  estado: FiltroEstado;
  q: string;
}

export type RecargasPage = Paginated<Recarga>;
