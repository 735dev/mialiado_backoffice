import { PATHS } from '@/lib/routes/paths';
import { ACCESS, defineScreens } from '@/lib/routes/types';

/** Pantallas de categorias. Para sumar una: crea la vista en views/ y agrega su entrada aqui. */
export const routes = defineScreens([
  {
    code: 'B11',
    path: PATHS.categorias,
    load: () => import('./views/CategoriasView'),
    access: ACCESS.modulo('categorias'),
    layout: 'shell',
  },
]);
