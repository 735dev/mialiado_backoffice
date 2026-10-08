import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de promociones. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B07',
    path: PATHS.promociones,
    load: () => import('./views/PromocionesView'),
    access: ACCESS.modulo('promociones'),
    layout: 'shell',
  },
]);
