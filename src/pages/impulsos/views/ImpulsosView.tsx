import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.impulsos;

// B08: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function ImpulsosView() {
  return <SectionPlaceholder code="B08" groupKey="nav.group.operacion" titleKey="impulsos.title" route={routeName} />;
}
