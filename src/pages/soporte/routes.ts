import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de soporte. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B13',
    path: PATHS.soporte,
    load: () => import('./views/SoporteView'),
    access: ACCESS.modulo('soporte'),
    layout: 'shell',
  },
]);
