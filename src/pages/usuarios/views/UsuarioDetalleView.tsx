import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.usuario;

// B06: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function UsuarioDetalleView() {
  return <SectionPlaceholder code="B06" groupKey="nav.group.operacion" titleKey="usuarios.detailTitle" route={routeName} />;
}
