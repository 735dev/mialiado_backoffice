import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.soporte;

// B13: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function SoporteView() {
  return <SectionPlaceholder code="B13" groupKey="nav.group.comunidad" titleKey="soporte.title" route={routeName} />;
}
