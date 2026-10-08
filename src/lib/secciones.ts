// Secciones del panel, en el orden del prototipo (aliado_prototipos/backoffice).
// Cada seccion es un modulo de permisos del backend: el menu solo muestra las que el rol puede ver.
import type { Modulo } from '@/lib/constants/modules';
import { PATHS } from '@/lib/routes/paths';

export type GrupoSeccion = 'general' | 'operacion' | 'negocio' | 'comunidad' | 'configuracion';

export interface Seccion {
  /** Modulo de permisos (tambien clave nav.<id> en i18n). */
  id: Modulo;
  ruta: string;
  grupo: GrupoSeccion;
  /** Codigo del prototipo que la disena. */
  pantalla: string;
  /** Nombre de icono en components/shell/icons.tsx. */
  icono: string;
}

export const SECCIONES: Seccion[] = [
  { id: 'resumen', ruta: PATHS.resumen, grupo: 'general', pantalla: 'B02', icono: 'home' },
  { id: 'comercios', ruta: PATHS.comercios, grupo: 'operacion', pantalla: 'B03', icono: 'store' },
  { id: 'usuarios', ruta: PATHS.usuarios, grupo: 'operacion', pantalla: 'B05', icono: 'users' },
  { id: 'promociones', ruta: PATHS.promociones, grupo: 'operacion', pantalla: 'B07', icono: 'tag' },
  { id: 'impulsos', ruta: PATHS.impulsos, grupo: 'operacion', pantalla: 'B08', icono: 'bolt' },
  { id: 'finanzas', ruta: PATHS.finanzas, grupo: 'negocio', pantalla: 'B09', icono: 'wallet' },
  { id: 'reportes', ruta: PATHS.reportes, grupo: 'negocio', pantalla: 'B14', icono: 'chart' },
  { id: 'notificaciones', ruta: PATHS.notificaciones, grupo: 'comunidad', pantalla: 'B12', icono: 'bell' },
  { id: 'soporte', ruta: PATHS.soporte, grupo: 'comunidad', pantalla: 'B13', icono: 'life' },
  { id: 'niveles_reglas', ruta: PATHS.niveles, grupo: 'configuracion', pantalla: 'B10', icono: 'sliders' },
  { id: 'categorias', ruta: PATHS.categorias, grupo: 'configuracion', pantalla: 'B11', icono: 'grid' },
  { id: 'equipo', ruta: PATHS.equipo, grupo: 'configuracion', pantalla: 'B15', icono: 'shield' },
  { id: 'auditoria', ruta: PATHS.auditoria, grupo: 'configuracion', pantalla: 'B16', icono: 'scroll' },
];

export const GRUPOS: GrupoSeccion[] = ['general', 'operacion', 'negocio', 'comunidad', 'configuracion'];
