import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.auditoria;

// B16: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function AuditoriaView() {
  return <SectionPlaceholder code="B16" groupKey="nav.group.configuracion" titleKey="auditoria.title" route={routeName} />;
}
