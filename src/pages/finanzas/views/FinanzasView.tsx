import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.finanzas;

// B09: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function FinanzasView() {
  return <SectionPlaceholder code="B09" groupKey="nav.group.negocio" titleKey="finanzas.title" route={routeName} />;
}
