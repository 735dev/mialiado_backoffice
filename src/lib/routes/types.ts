import type { ComponentType } from 'react';
import type { Accion, Modulo } from '@/lib/constants/modules';
import type { Role } from '@/lib/constants/roles';

/**
 * Quien puede ver una pantalla:
 * - public: sin sesion (login).
 * - auth: cualquier persona del equipo con sesion (B18).
 * - { modulo, accion? }: el rol debe tener ese permiso en la matriz (por defecto ver); admin siempre pasa.
 * - { roles }: solo esos roles (ademas del permiso si se indica modulo).
 */
export type ScreenAccess = 'public' | 'auth' | { modulo?: Modulo; accion?: Accion; roles?: readonly Role[] };

/** shell muestra el menu lateral; plain es pantalla completa (login). */
export type ScreenLayout = 'shell' | 'plain';

export interface ScreenModule {
  default: ComponentType;
  /** Ruta que declara la propia vista; routes.test.ts comprueba que coincide con path. */
  routeName?: string;
}

export interface ScreenRoute {
  /** Codigo del prototipo: B02, B04... */
  code: string;
  path: string;
  load: () => Promise<ScreenModule>;
  access: ScreenAccess;
  layout: ScreenLayout;
}

export const ACCESS = {
  public: 'public',
  auth: 'auth',
  /** Pantalla de un modulo: exige ver (o la accion indicada) en la matriz. */
  modulo: (modulo: Modulo, accion: Accion = 'ver'): ScreenAccess => ({ modulo, accion }),
} as const;

/** Identidad de tipos para listas de pantallas por feature. */
export function defineScreens(screens: ScreenRoute[]): ScreenRoute[] {
  return screens;
}
