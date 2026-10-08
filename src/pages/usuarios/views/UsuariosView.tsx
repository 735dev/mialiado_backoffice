import SectionPlaceholder from '@/components/layout/SectionPlaceholder';
import { PATHS } from '@/lib/routes/paths';

export const routeName = PATHS.usuarios;

// B05: pantalla provisional. Reemplaza el cuerpo por la pantalla real del prototipo.
export default function UsuariosView() {
  return <SectionPlaceholder code="B05" groupKey="nav.group.operacion" titleKey="usuarios.title" route={routeName} />;
}
