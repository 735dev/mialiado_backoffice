/** Modulos de permisos del backend. Cada seccion del menu es un modulo (matriz de B15). */
export const MODULOS = [
  'resumen',
  'comercios',
  'usuarios',
  'promociones',
  'impulsos',
  'finanzas',
  'reportes',
  'notificaciones',
  'soporte',
  'niveles_reglas',
  'categorias',
  'equipo',
  'auditoria',
] as const;
export type Modulo = (typeof MODULOS)[number];

export type Accion = 'ver' | 'editar' | 'aprobar';
export interface PermisoModulo {
  ver: boolean;
  editar: boolean;
  aprobar: boolean;
}
/** Matriz que entrega GET /auth/me: { modulo: { ver, editar, aprobar } }. */
export type Permisos = Partial<Record<Modulo, PermisoModulo>>;
