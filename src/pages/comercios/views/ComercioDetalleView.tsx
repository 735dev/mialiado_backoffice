import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.comercio;

// B04: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function ComercioDetalleView() {
  return <SectionPlaceholder code="B04" groupKey="nav.group.operacion" titleKey="comercios.detailTitle" route={routeName} />;
}
