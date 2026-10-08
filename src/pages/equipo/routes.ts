import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de equipo. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B15',
    path: PATHS.equipo,
    load: () => import('./views/EquipoView'),
    access: ACCESS.modulo('equipo'),
    layout: 'shell',
  },
]);
