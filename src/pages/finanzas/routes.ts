import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de finanzas. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B09',
    path: PATHS.finanzas,
    load: () => import('./views/FinanzasView'),
    access: ACCESS.modulo('finanzas'),
    layout: 'shell',
  },
]);
