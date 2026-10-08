import { ArrowLeft, Send, SlidersHorizontal, UserX } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { notify } from '@/lib/utils/notify';
import { Avatar } from '@/components/ui/Avatar';
import { BloquearPanel } from '../components/BloquearPanel';
import { CanjesCard } from '../components/CanjesCard';
import { KpisUsuario, PerfilCard, ProgresoNivelCard } from '../components/DetalleTarjetas';
import { MensajeModal } from '../components/MensajeModal';
import { NivelBadge } from '../components/NivelBadge';
import { NivelModal } from '../components/NivelModal';
import { EstadoBadge } from '../components/UsuariosTabla';
import { useUsuarioDetalle } from '../hooks/useUsuarioDetalle';

export const routeName = PATHS.usuario;

/** B06 Usuario, detalle: perfil, nivel y progreso, historial de canjes, ajuste de nivel, mensaje y bloqueo. */
export default function UsuarioDetalleView() {
  const t = useT();
  const navigate = useNavigate();
  const { puede } = useAuth();
  const id = Number(useParams().id);
  const d = useUsuarioDetalle(id);
  const [modal, setModal] = useState<'nivel' | 'mensaje' | null>(null);
  const puedeEditar = puede('usuarios', 'editar');
  const u = d.usuario;
  const volver = () => navigate(PATHS.usuarios);

  if (!u) {
    const noExiste = d.error?.status === 404 || Number.isNaN(id);
    return (
      <section data-screen="B06" className="max-w-[1200px]">
        {d.loading ? (
          <div className="flex items-center justify-center gap-3 py-24 text-ink-muted" aria-live="polite">
            <Spinner />
            {t('common.loading')}
          </div>
        ) : (
          <EmptyState
            icon={<UserX size={40} />}
            title={t(noExiste ? 'usuarios.detalle.noEncontrado' : 'usuarios.detalle.errorTitulo')}
            description={d.error?.detail ? t(d.error.detail) : undefined}
            action={
              <div className="flex gap-3">
                <Button variant="secondary" size="md" onClick={volver}>
                  {t('usuarios.detalle.volver')}
                </Button>
                {!noExiste && (
                  <Button size="md" onClick={d.reintentar}>
                    {t('common.retry')}
                  </Button>
                )}
              </div>
            }
          />
        )}
      </section>
    );
  }

  const confirmarBloqueo = (motivo: string) =>
    notify.confirm(t('usuarios.bloqueo.confirmarBloquear', { nombre: u.nombre }), () => void d.bloquear(motivo, t('usuarios.bloqueo.bloqueado')));
  const confirmarDesbloqueo = () =>
    notify.confirm(t('usuarios.bloqueo.confirmarDesbloquear', { nombre: u.nombre }), () => void d.desbloquear(t('usuarios.bloqueo.desbloqueado')));

  return (
    <section data-screen="B06" className="flex max-w-[1200px] flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            onClick={volver}
            aria-label={t('usuarios.detalle.volver')}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface shadow-e1"
          >
            <ArrowLeft size={20} />
          </button>
          <Avatar tone="warn" name={u.nombre} src={u.foto_url} size={72} />
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-extrabold tracking-tight">{u.nombre}</h1>
            <p className="flex flex-wrap items-center gap-2 text-ink-muted">
              <span>@{u.usuario}</span>
              <NivelBadge nivel={u.progreso.codigo} />
              <EstadoBadge estado={u.estado} />
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="md" disabled={!puedeEditar} onClick={() => setModal('nivel')}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            {t('usuarios.detalle.ajustarNivel')}
          </Button>
          <Button size="md" disabled={!puedeEditar} onClick={() => setModal('mensaje')}>
            <Send size={18} aria-hidden="true" />
            {t('usuarios.detalle.enviarMensaje')}
          </Button>
        </div>
      </header>

      {!puedeEditar && <p className="rounded-field bg-surface-2 px-4 py-3 text-sm text-ink-soft">{t('usuarios.detalle.soloLectura')}</p>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <KpisUsuario u={u} />
          <ProgresoNivelCard u={u} />
          <CanjesCard u={u} />
        </div>
        <aside className="flex flex-col gap-6">
          <PerfilCard u={u} />
        </aside>
      </div>

      <BloquearPanel usuario={u} puedeEditar={puedeEditar} busy={d.busy} onBloquear={confirmarBloqueo} onDesbloquear={confirmarDesbloqueo} />

      <NivelModal
        key={`nivel-${u.nivel_forzado ?? 'auto'}`}
        usuario={u}
        open={modal === 'nivel'}
        onClose={() => setModal(null)}
        onSubmit={async (nivel, motivo) => (await d.cambiarNivel(nivel === 'auto' ? null : nivel, motivo, t('usuarios.nivel.guardado'))).ok}
      />
      <MensajeModal
        usuario={u}
        open={modal === 'mensaje'}
        onClose={() => setModal(null)}
        onSubmit={async (v) => {
          const res = await d.enviarMensaje(v.titulo, v.mensaje);
          if (res.ok) notify.toast.success(t('usuarios.mensaje.enviado'));
          else notify.fromApiError(res);
          return res.ok;
        }}
      />
    </section>
  );
}
