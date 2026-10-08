import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.promociones;

// B07: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function PromocionesView() {
  return <SectionPlaceholder code="B07" groupKey="nav.group.operacion" titleKey="promociones.title" route={routeName} />;
}
