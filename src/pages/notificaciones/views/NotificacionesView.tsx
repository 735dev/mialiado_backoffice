import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.notificaciones;

// B12: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function NotificacionesView() {
  return <SectionPlaceholder code="B12" groupKey="nav.group.comunidad" titleKey="notificaciones.title" route={routeName} />;
}
