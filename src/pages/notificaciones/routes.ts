import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de notificaciones. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B12',
    path: PATHS.notificaciones,
    load: () => import('./views/NotificacionesView'),
    access: ACCESS.modulo('notificaciones'),
    layout: 'shell',
  },
]);
