import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de comercios. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B03',
    path: PATHS.comercios,
    load: () => import('./views/ComerciosView'),
    access: ACCESS.modulo('comercios'),
    layout: 'shell',
  },
  {
    code: 'B04',
    path: PATHS.comercio,
    load: () => import('./views/ComercioDetalleView'),
    access: ACCESS.modulo('comercios'),
    layout: 'shell',
  },
]);
