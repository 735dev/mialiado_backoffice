import { PATHS } from '@/lib/routes/paths';
import { defineScreens } from '@/lib/routes/types';

/** Pantallas de finanzas. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B09',
    path: PATHS.finanzas,
    load: () => import('./views/FinanzasView'),
    // Solo finanzas y admin; ademas la matriz de permisos debe dar `ver` del modulo.
    access: { modulo: 'finanzas', accion: 'ver', roles: ['admin', 'finanzas'] },
    layout: 'shell',
  },
]);
