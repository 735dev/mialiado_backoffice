/** Fila del registro (GET /auditoria). Los eventos no se pueden editar ni borrar: no hay endpoints para ello. */
export interface Evento {
  id: number;
  codigo: string;
  accion: string;
  modulo: string;
  objeto_tipo: string | null;
  objeto: string | null;
  ip: string | null;
  created_at: string;
  usuario_id: number | null;
  persona: string | null;
  rol: string | null;
}

export interface CambioCampo {
  campo: string;
  antes: unknown;
  despues: unknown;
}

export interface DetalleEvento extends Evento {
  detalle: { sesion?: string; version?: string | number; motivo?: string } & Record<string, unknown>;
  cambios: CambioCampo[];
  dispositivo: string | null;
}

/** Filtros que viajan al backend; todos opcionales (por defecto el servidor muestra los ultimos 7 dias). */
export interface ConsultaAuditoria {
  accion: string;
  modulo: string;
  usuario_id: string;
  desde: string;
  hasta: string;
  q: string;
}

export interface Persona {
  id: number;
  nombre: string;
}

/** Acciones que registra hoy el backend (aliado_backend/services, `registrar`). No hay endpoint que las liste. */
export const ACCIONES_CONOCIDAS = [
  'Acreditó',
  'Ajustó nivel',
  'Anotó',
  'Aprobó',
  'Bloqueó',
  'Canceló',
  'Conciliado',
  'Creó',
  'Desbloqueó',
  'Editó',
  'Eliminó',
  'Envió',
  'Envió mensaje',
  'Exportó',
  'Inició revisión',
  'Inició sesión',
  'Invitó',
  'Pidió cambios',
  'Programó',
  'Quitó',
  'Reactivó',
  'Reanudó',
  'Rechazó',
  'Reembolsó',
  'Reordenó',
  'Restableció',
  'Suspendió',
] as const;

/** Modulos tal como los guarda el backend en cada evento. */
export const MODULOS_CONOCIDOS = [
  'Auditoría',
  'Categorías',
  'Comercios',
  'Equipo',
  'Finanzas',
  'Impulsos',
  'Niveles y reglas',
  'Notificaciones',
  'Permisos por rol',
  'Promociones',
  'Reportes',
  'Sesión',
  'Soporte',
  'Usuarios',
] as const;
