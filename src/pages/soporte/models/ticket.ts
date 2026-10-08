import type { Paginated } from '@/lib/api/types';

export const PRIORIDADES = ['alta', 'media', 'baja'] as const;
export type Prioridad = (typeof PRIORIDADES)[number];
export type EstadoTicket = 'abierto' | 'resuelto';
export type OrigenTicket = 'usuario' | 'comercio';
export type TabBandeja = 'abiertos' | 'mios' | 'resueltos';
export type TipoMensaje = 'mensaje' | 'nota' | 'sistema';

/** Fila de la bandeja (GET /soporte/tickets). */
export interface TicketResumen {
  id: number;
  codigo: string;
  asunto: string;
  prioridad: Prioridad;
  estado: EstadoTicket;
  origen: OrigenTicket;
  sin_leer: boolean;
  created_at: string;
  updated_at: string;
  asignado_a: number | null;
  usuario_id: number | null;
  comercio: string | null;
  solicitante: string;
}

export interface ConteosBandeja {
  sin_leer: number;
  abiertos: number;
  mios: number;
  resueltos: number;
}

export type PaginaBandeja = Paginated<TicketResumen> & { conteos: ConteosBandeja };

export interface ConsultaBandeja {
  tab: TabBandeja;
  q: string;
  prioridad: Prioridad | '';
  origen: OrigenTicket | '';
}

export interface Solicitante {
  id: number;
  nombre: string;
  usuario: string | null;
  tipo: OrigenTicket;
  nivel: string | null;
  compras: number | null;
  correo: string | null;
}

export interface CobroTicket {
  id: number;
  folio: string;
  comercio: string;
  promocion: string;
  fecha: string;
  consumo: number;
  cobrado: number;
  descuento_pct: number;
  esperado_pct: number;
  esperado: number;
  estado: string;
}

export interface MensajeTicket {
  id: number;
  tipo: TipoMensaje;
  cuerpo: string;
  adjunto: string | null;
  created_at: string;
  autor_id: number | null;
  autor: string;
  es_solicitante: boolean;
}

export interface TicketDetalle {
  id: number;
  codigo: string;
  asunto: string;
  prioridad: Prioridad;
  estado: EstadoTicket;
  origen: OrigenTicket;
  created_at: string;
  updated_at: string;
  asignado_a: number | null;
  /** Nombre completo de quien lo tiene asignado. */
  asignado: string | null;
  sin_leer: boolean;
  solicitante: Solicitante;
  cobro: CobroTicket | null;
  mensajes: MensajeTicket[];
}

export interface PlantillaRespuesta {
  id: number;
  ambito: 'push' | 'soporte';
  nombre: string;
  titulo: string | null;
  cuerpo: string;
}

export interface CambiosTicket {
  prioridad?: Prioridad;
  estado?: EstadoTicket;
  asignado_a?: number;
  asignar_a_mi?: boolean;
}

export interface NuevoTicket {
  usuario_id: number;
  asunto: string;
  mensaje: string;
  prioridad: Prioridad;
}

export interface UsuarioBusqueda {
  id: number;
  nombre: string;
  usuario: string;
  nivel: string | null;
}

export interface MiembroEquipo {
  id: number;
  nombre: string;
  rol_etiqueta: string;
  estado: 'A' | 'P' | 'S';
}
