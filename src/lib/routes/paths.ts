/**
 * Rutas de TODAS las pantallas del panel (codigo del prototipo en comentario).
 * Una pantalla nueva con ruta nueva se agrega aqui UNA vez; las vistas usan estas constantes como routeName.
 * Rutas con parametros: buildPath(PATHS.comercio, { id }).
 */
export const PATHS = {
  login: '/login', // B01
  sinPermiso: '/sin-permiso', // B18
  resumen: '/resumen', // B02
  comercios: '/comercios', // B03
  comercio: '/comercios/:id', // B04
  usuarios: '/usuarios', // B05
  usuario: '/usuarios/:id', // B06
  promociones: '/promociones', // B07 (B17 es el modal Rechazar con motivo)
  impulsos: '/impulsos', // B08
  finanzas: '/finanzas', // B09
  niveles: '/niveles', // B10
  categorias: '/categorias', // B11
  notificaciones: '/notificaciones', // B12
  soporte: '/soporte', // B13
  reportes: '/reportes', // B14
  equipo: '/equipo', // B15
  auditoria: '/auditoria', // B16
} as const;

export function buildPath(path: string, params: Record<string, string | number> = {}): string {
  return path.replace(/:(\w+)/g, (_, key: string) => encodeURIComponent(String(params[key] ?? '')));
}
