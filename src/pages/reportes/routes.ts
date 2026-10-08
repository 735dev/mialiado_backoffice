import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de reportes. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B14',
    path: PATHS.reportes,
    load: () => import('./views/ReportesView'),
    access: ACCESS.modulo('reportes'),
    layout: 'shell',
  },
]);
