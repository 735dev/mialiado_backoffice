import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { notify } from '@/lib/utils/notify';
import { EditarMiembroModal } from '../components/EditarMiembroModal';
import { InvitarModal } from '../components/InvitarModal';
import { MatrizPermisos } from '../components/MatrizPermisos';
import { MiembrosCard } from '../components/MiembrosCard';
import { useEquipo } from '../hooks/useEquipo';
import { usePermisos } from '../hooks/usePermisos';
import type { Miembro } from '../models/equipo';
import { actualizarMiembro, eliminarMiembro, restablecer2fa } from '../providers/equipoProvider';

export const routeName = PATHS.equipo;

// B15 · Equipo y roles: miembros (invitar, editar rol, suspender, restablecer 2FA, quitar) y matriz de permisos por modulo.
export default function EquipoView() {
  const t = useT();
  const { puede } = useAuth();
  const canEdit = puede('equipo', 'editar');
  const equipo = useEquipo();
  const permisos = usePermisos();
  const [invitar, setInvitar] = useState(false);
  const [editando, setEditando] = useState<Miembro | null>(null);

  const recargar = () => {
    equipo.reload();
    permisos.reload();
  };

  /** Confirma, ejecuta la accion y recarga; los errores (incluido el 409 de tu propio acceso) salen con el texto del servidor. */
  const confirmar = (texto: string, exito: string, accion: () => Promise<{ ok: boolean }>) =>
    notify.confirm(texto, () => {
      void accion().then((res) => {
        if (res.ok) {
          notify.toast.success(exito);
          recargar();
        } else notify.fromApiError(res as Parameters<typeof notify.fromApiError>[0]);
      });
    });

  const alternarSuspension = (m: Miembro) => {
    const suspender = m.estado !== 'S';
    confirmar(
      t(suspender ? 'equipo.confirm.suspend' : 'equipo.confirm.reactivate', { nombre: m.nombre }),
      t(suspender ? 'equipo.toast.suspended' : 'equipo.toast.reactivated'),
      () => actualizarMiembro(m.id, { estado: suspender ? 'S' : 'A' }),
    );
  };

  return (
    <section className="flex flex-col gap-5" data-screen="B15">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('equipo.title')}</h1>
          <p className="mt-1 text-ink-muted">{t('equipo.subtitle')}</p>
        </div>
        {canEdit && (
          <Button size="md" onClick={() => setInvitar(true)}>
            <UserPlus size={16} aria-hidden="true" />
            {t('equipo.invite.open')}
          </Button>
        )}
      </header>

      <MiembrosCard
        equipo={equipo}
        canEdit={canEdit}
        onEdit={setEditando}
        onToggleSuspension={alternarSuspension}
        onReset2fa={(m) => confirmar(t('equipo.confirm.reset2fa', { nombre: m.nombre }), t('equipo.toast.reset2fa'), () => restablecer2fa(m.id))}
        onDelete={(m) => confirmar(t('equipo.confirm.delete', { nombre: m.nombre }), t('equipo.toast.deleted'), () => eliminarMiembro(m.id))}
      />
      <MatrizPermisos permisos={permisos} canEdit={canEdit} />

      <InvitarModal open={invitar} onOpenChange={setInvitar} onInvited={recargar} />
      <EditarMiembroModal miembro={editando} onClose={() => setEditando(null)} onSaved={recargar} />
    </section>
  );
}
