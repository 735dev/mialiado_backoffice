import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.resumen;

// B02: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function ResumenView() {
  return <SectionPlaceholder code="B02" groupKey="nav.group.general" titleKey="resumen.title" route={routeName} />;
}
