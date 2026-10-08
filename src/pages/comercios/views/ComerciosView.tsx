import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.comercios;

// B03: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function ComerciosView() {
  return <SectionPlaceholder code="B03" groupKey="nav.group.operacion" titleKey="comercios.title" route={routeName} />;
}
