import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.categorias;

// B11: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function CategoriasView() {
  return <SectionPlaceholder code="B11" groupKey="nav.group.configuracion" titleKey="categorias.title" route={routeName} />;
}
