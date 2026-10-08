import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Acceso al panel: login con segundo factor (B01) y pantalla Sin permiso (B18). */
export const routes = defineScreens([
  {
    code: 'B01',
    path: PATHS.login,
    load: () => import('./views/LoginView'),
    access: ACCESS.public,
    layout: 'plain',
  },
  {
    code: 'B18',
    path: PATHS.sinPermiso,
    load: () => import('./views/SinPermisoView'),
    access: ACCESS.auth,
    layout: 'shell',
  },
]);
