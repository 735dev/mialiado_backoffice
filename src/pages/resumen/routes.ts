import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de resumen. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B02',
    path: PATHS.resumen,
    load: () => import('./views/ResumenView'),
    access: ACCESS.modulo('resumen'),
    layout: 'shell',
  },
]);
