import type { Accion, Modulo } from '@/lib/constants/modules';
import type { Role } from '@/lib/constants/roles';

export type EstadoMiembro = 'A' | 'P' | 'S';
export type FiltroEstado = 'todos' | 'activos' | 'pendientes';

export interface Miembro {
  id: number;
  nombre: string;
  correo: string;
  rol: Role;
  rol_etiqueta: string;
  estado: EstadoMiembro;
  estado_texto: string;
  totp_activo: boolean;
  ultimo_acceso: string | null;
}

export interface ResumenEquipo {
  personas: number;
  activas: number;
  pendientes: number;
}

export interface ListaEquipo {
  data: Miembro[];
  total: number;
  resumen: ResumenEquipo;
}

/** Estado que se muestra: combina el estado del acceso con si ya configuro el segundo factor. */
export type EstadoVisible = 'activo' | 'sin2fa' | 'pendiente' | 'suspendido';

export interface InvitacionNueva {
  correo: string;
  nombres: string;
  apellidos: string;
  rol: Role;
}

/** Respuesta de POST /equipo; `invitacion_token` solo existe con DEV_MODE en el servidor. */
export interface MiembroInvitado extends Miembro {
  invitacion_token?: string;
}

export interface CambiosMiembro {
  rol?: Role;
  estado?: 'A' | 'S';
}

export type PermisoModulo = Record<Accion, boolean>;
export type PermisosRol = Partial<Record<Modulo, PermisoModulo>>;
/** Matriz de los roles editables (admin no aparece: siempre tiene todo). */
export type MatrizPermisos = Partial<Record<Role, PermisosRol>>;

export interface RolResumen {
  rol: Role;
  etiqueta: string;
  miembros: number;
}

export interface RespuestaPermisos {
  modulos: Modulo[];
  roles: RolResumen[];
  permisos: MatrizPermisos;
  ultima_modificacion: { por: string; fecha: string } | null;
}
