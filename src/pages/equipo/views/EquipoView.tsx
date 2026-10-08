import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.equipo;

// B15: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function EquipoView() {
  return <SectionPlaceholder code="B15" groupKey="nav.group.configuracion" titleKey="equipo.title" route={routeName} />;
}
