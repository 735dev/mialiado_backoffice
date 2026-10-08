import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.niveles;

// B10: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function NivelesView() {
  return <SectionPlaceholder code="B10" groupKey="nav.group.configuracion" titleKey="niveles.title" route={routeName} />;
}
