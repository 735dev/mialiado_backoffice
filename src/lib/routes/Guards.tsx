import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/lib/store/hooks';
import { SECCIONES } from '@/lib/secciones';
import { decideAccess, homePath } from './access';
import { PATHS } from './paths';
import type { ScreenAccess } from './types';

/** Estado que deja el guard al redirigir: de donde vino y que modulo faltaba (lo lee B18). */
export interface GuardState {
  guardFrom?: string;
  modulo?: string;
}

/**
 * Guard por rol y por permiso de modulo. Sin sesion manda al login; con sesion pero sin permiso a B18 (que es
 * accesible para cualquier persona del equipo, asi que nunca hay ciclo). Nunca redirige a donde ya esta ni de
 * vuelta a la pantalla de la que viene.
 */
export function RequireAccess({ access, children }: { access: ScreenAccess; children?: ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.user?.role ?? null);
  const permisos = useAppSelector((s) => s.auth.permisos);
  const location = useLocation();
  const session = { isAuthenticated, role, permisos };
  const decision = decideAccess(access, session);

  if (decision === 'allow') return <>{children ?? <Outlet />}</>;

  const target = decision === 'login' ? PATHS.login : PATHS.sinPermiso;
  const from = (location.state as GuardState | null)?.guardFrom;
  if (target === location.pathname || target === from) return null; // ya esta ahi o seria rebotar: se corta
  const modulo = typeof access === 'object' ? access.modulo : undefined;
  return <Navigate to={target} replace state={{ guardFrom: location.pathname, modulo } satisfies GuardState} />;
}

/** Pantallas publicas (login): con sesion vuelven al inicio de la persona. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.user?.role ?? null);
  const permisos = useAppSelector((s) => s.auth.permisos);
  if (isAuthenticated && role) return <Navigate to={homePath({ role, permisos }, SECCIONES, PATHS.sinPermiso)} replace />;
  return <>{children}</>;
}
