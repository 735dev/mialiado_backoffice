import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de niveles. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B10',
    path: PATHS.niveles,
    load: () => import('./views/NivelesView'),
    access: ACCESS.modulo('niveles_reglas'),
    layout: 'shell',
  },
]);
