// Secciones del panel, en el orden del prototipo (aliado_prototipos/backoffice).
// `pantalla` es el código del prototipo que la diseña.

export interface Seccion {
  ruta: string;
  nombre: string;
  grupo: string;
  pantalla: string;
}

export const SECCIONES: Seccion[] = [
  { ruta: '/resumen', nombre: 'Resumen', grupo: 'General', pantalla: 'B02' },
  { ruta: '/comercios', nombre: 'Comercios', grupo: 'Operación', pantalla: 'B03' },
  { ruta: '/usuarios', nombre: 'Usuarios', grupo: 'Operación', pantalla: 'B05' },
  { ruta: '/promociones', nombre: 'Promociones', grupo: 'Operación', pantalla: 'B07' },
  { ruta: '/impulsos', nombre: 'Impulsos', grupo: 'Operación', pantalla: 'B08' },
  { ruta: '/finanzas', nombre: 'Finanzas', grupo: 'Negocio', pantalla: 'B09' },
  { ruta: '/reportes', nombre: 'Reportes', grupo: 'Negocio', pantalla: 'B14' },
  { ruta: '/notificaciones', nombre: 'Notificaciones', grupo: 'Comunidad', pantalla: 'B12' },
  { ruta: '/soporte', nombre: 'Soporte', grupo: 'Comunidad', pantalla: 'B13' },
  { ruta: '/niveles', nombre: 'Niveles y reglas', grupo: 'Configuración', pantalla: 'B10' },
  { ruta: '/categorias', nombre: 'Categorías', grupo: 'Configuración', pantalla: 'B11' },
  { ruta: '/equipo', nombre: 'Equipo y roles', grupo: 'Configuración', pantalla: 'B15' },
  { ruta: '/auditoria', nombre: 'Auditoría', grupo: 'Configuración', pantalla: 'B16' },
];
