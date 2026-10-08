import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de usuarios. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B05',
    path: PATHS.usuarios,
    load: () => import('./views/UsuariosView'),
    access: ACCESS.modulo('usuarios'),
    layout: 'shell',
  },
  {
    code: 'B06',
    path: PATHS.usuario,
    load: () => import('./views/UsuarioDetalleView'),
    access: ACCESS.modulo('usuarios'),
    layout: 'shell',
  },
]);
