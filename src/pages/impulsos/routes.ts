import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de impulsos. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B08',
    path: PATHS.impulsos,
    load: () => import('./views/ImpulsosView'),
    access: ACCESS.modulo('impulsos'),
    layout: 'shell',
  },
]);
