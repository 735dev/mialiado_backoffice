import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de auditoria. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B16',
    path: PATHS.auditoria,
    load: () => import('./views/AuditoriaView'),
    access: ACCESS.modulo('auditoria'),
    layout: 'shell',
  },
]);
