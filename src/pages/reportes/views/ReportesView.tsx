import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.reportes;

// B14: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function ReportesView() {
  return <SectionPlaceholder code="B14" groupKey="nav.group.negocio" titleKey="reportes.title" route={routeName} />;
}
