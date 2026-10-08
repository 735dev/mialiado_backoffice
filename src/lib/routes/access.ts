import type { Accion, Modulo, Permisos } from '@/lib/constants/modules';
import type { Role } from '@/lib/constants/roles';
import type { ScreenAccess } from './types';

export type AccessDecision = 'allow' | 'login' | 'forbidden';

export interface Session {
  isAuthenticated: boolean;
  role: Role | null;
  permisos: Permisos | null;
}

/** admin siempre puede; el resto depende de la matriz que entrega el backend. Sin matriz cargada no hay permiso. */
export function can(session: Pick<Session, 'role' | 'permisos'>, modulo: Modulo, accion: Accion = 'ver'): boolean {
  if (session.role === 'admin') return true;
  return session.permisos?.[modulo]?.[accion] === true;
}

/** Logica pura de los guards (probada en access.test.ts). */
export function decideAccess(access: ScreenAccess, session: Session): AccessDecision {
  if (access === 'public') return 'allow';
  if (!session.isAuthenticated || !session.role) return 'login';
  if (access === 'auth') return 'allow';
  if (access.roles && !access.roles.includes(session.role)) return 'forbidden';
  if (access.modulo && !can(session, access.modulo, access.accion ?? 'ver')) return 'forbidden';
  return 'allow';
}

/** Primera ruta de la que la persona puede ver el modulo (menu y redireccion tras el login). B18 si no tiene ninguna. */
export function homePath(session: Pick<Session, 'role' | 'permisos'>, secciones: ReadonlyArray<{ id: Modulo; ruta: string }>, fallback: string): string {
  return secciones.find((s) => can(session, s.id))?.ruta ?? fallback;
}
