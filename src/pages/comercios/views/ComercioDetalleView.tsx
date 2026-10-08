import { ArrowLeft, PauseCircle, Pencil, Play, SearchX } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { useAppSelector } from '@/lib/store/hooks';
import { notify } from '@/lib/utils/notify';
import {
  activarComercio,
  aprobarComercio,
  editarComercio,
  iniciarRevision,
  rechazarComercio,
  revisarDocumento,
  suspenderComercio,
  type DocumentoComercio,
  type EdicionComercio,
} from '@/providers/comerciosProvider';
import { ComercioAvatar, EstadoBadge } from '../components/Badges';
import { DecisionPanel, type ChecklistState } from '../components/DecisionPanel';
import { DatosCard, DocumentosCard, TimelineCard, UbicacionCard } from '../components/DetalleCards';
import { EditarComercioModal } from '../components/EditarComercioModal';
import { RechazarModal } from '../components/RechazarModal';
import { SuspenderModal } from '../components/SuspenderModal';
import { useComercioDetalle } from '../hooks/useComercioDetalle';
import { formatDate } from '@/lib/utils/format';

export const routeName = PATHS.comercio;

// B04: Verificacion de comercio. Datos, documentos, ubicacion, linea de tiempo y decision (aprobar / rechazar = B17).
export default function ComercioDetalleView() {
  const t = useT();
  const { id: rawId } = useParams();
  const id = Number(rawId);
  const { puede } = useAuth();
  const lang = useAppSelector((s) => s.lang.current);
  const { estado, retry, run, busy } = useComercioDetalle(id);
  const [checklist, setChecklist] = useState<ChecklistState>({ direccion: false, contacto: false });
  const [rechazando, setRechazando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [suspendiendo, setSuspendiendo] = useState(false);
  const puedeEditar = puede('comercios', 'editar');
  const puedeAprobar = puede('comercios', 'aprobar');

  const back = (
    <Link to={PATHS.comercios} className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold text-ink-soft hover:text-ink">
      <ArrowLeft size={18} aria-hidden="true" />
      {t('comercios.detalle.volver')}
    </Link>
  );

  if (!Number.isFinite(id) || estado.status === 'error') {
    const status = estado.status === 'error' ? estado.error.status : 404;
    return (
      <div data-screen="B04" className="flex flex-col gap-5">
      <h2 className="sr-only">{t('comercios.detailTitle')}</h2>
        {back}
        <div className="rounded-card bg-surface shadow-e1">
          <EmptyState
            icon={<SearchX size={36} aria-hidden="true" />}
            title={status === 404 ? t('comercios.detalle.noEncontrado') : t('comercios.detalle.errorTitle')}
            description={estado.status === 'error' && status !== 404 ? t(estado.error.detail) : undefined}
            action={
              status === 404 ? undefined : (
                <Button size="md" variant="secondary" onClick={retry}>
                  {t('common.retry')}
                </Button>
              )
            }
          />
        </div>
      </div>
    );
  }

  if (estado.status === 'loading') {
    return (
      <div data-screen="B04" className="flex flex-col gap-5">
      <h2 className="sr-only">{t('comercios.detailTitle')}</h2>
        {back}
        <div className="flex justify-center py-24 text-primary-deep" aria-live="polite">
          <Spinner size={36} />
        </div>
      </div>
    );
  }

  const c = estado.data;
  const revisionIniciada = c.linea_de_tiempo.some((e) => e.evento.startsWith('Revisión iniciada'));
  const toggleDoc = (d: DocumentoComercio) =>
    void run(() => revisarDocumento(c.id, d.id, !d.revisado));
  const toggleTipo = (tipo: string) => {
    const d = c.documentos.find((x) => x.tipo === tipo);
    if (d) toggleDoc(d);
  };
  const aprobar = () => {
    const faltan = 5 - (c.documentos.filter((d) => d.revisado).length + Number(checklist.direccion) + Number(checklist.contacto));
    const msg = faltan > 0 ? t('comercios.decision.confirmarAprobarFaltan', { n: faltan }) : t('comercios.decision.confirmarAprobar', { nombre: c.nombre });
    notify.confirm(msg, () => void run(() => aprobarComercio(c.id), t('comercios.decision.aprobado', { nombre: c.nombre })));
  };
  const rechazar = async (body: { motivo: string; comentario?: string }) => {
    const ok = await run(() => rechazarComercio(c.id, body), t('comercios.rechazo.hecho', { nombre: c.nombre }));
    if (ok) setRechazando(false);
  };

  const editar = (body: EdicionComercio) => run(() => editarComercio(c.id, body), t('comercios.editar.hecho', { nombre: c.nombre }));
  const suspender = async (motivo: string) => {
    const ok = await run(() => suspenderComercio(c.id, motivo), t('comercios.suspender.hecho', { nombre: c.nombre }));
    if (ok) setSuspendiendo(false);
  };
  const activar = () => notify.confirm(t('comercios.activar.confirmar', { nombre: c.nombre }), () => void run(() => activarComercio(c.id), t('comercios.activar.hecho', { nombre: c.nombre })));
  const BTN = 'inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-surface px-5 text-sm font-bold text-ink ring-1 ring-inset ring-line-strong disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div data-screen="B04" className="flex flex-col gap-5">
      <h2 className="sr-only">{t('comercios.detailTitle')}</h2>
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        {t('nav.group.operacion')} · {t('nav.comercios')}
      </p>
      {back}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ComercioAvatar id={c.id} nombre={c.nombre} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="break-words text-[28px] font-extrabold leading-9 tracking-tight md:text-[34px] md:leading-10">{c.nombre}</h1>
          <p className="mt-1 text-ink-muted">
            {[c.categoria, c.zona, t('comercios.detalle.registrado', { fecha: formatDate(c.created_at, lang) })].filter(Boolean).join(' · ')}
          </p>
        </div>
        <EstadoBadge estado={c.estado} />
      </div>

      {puedeEditar && (
        <div className="flex flex-wrap gap-3">
          <button type="button" className={BTN} disabled={busy} onClick={() => setEditando(true)}>
            <Pencil size={16} aria-hidden="true" />
            {t('comercios.editar.boton')}
          </button>
          {c.estado === 'Suspendido' ? (
            <button type="button" className={BTN} disabled={busy} onClick={activar}>
              <Play size={16} aria-hidden="true" />
              {t('comercios.activar.boton')}
            </button>
          ) : c.estado === 'Activo' ? (
            <button type="button" className={`${BTN} !text-err-deep`} disabled={busy} onClick={() => setSuspendiendo(true)}>
              <PauseCircle size={16} aria-hidden="true" />
              {t('comercios.suspender.boton')}
            </button>
          ) : null}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <DatosCard c={c} />
          <DocumentosCard documentos={c.documentos} puedeEditar={puedeEditar} busy={busy} onToggle={toggleDoc} />
          <UbicacionCard c={c} confirmada={checklist.direccion} />
          <TimelineCard c={c} lang={lang} pendienteDecision={c.verificacion === 'pendiente'} />
        </div>
        <DecisionPanel
          c={c}
          checklist={checklist}
          puedeEditar={puedeEditar}
          puedeAprobar={puedeAprobar}
          busy={busy}
          revisionIniciada={revisionIniciada}
          onToggleDoc={toggleTipo}
          onToggleLocal={(k) => setChecklist((s) => ({ ...s, [k]: !s[k] }))}
          onRevision={() => void run(() => iniciarRevision(c.id), t('comercios.decision.revisionIniciada'))}
          onAprobar={aprobar}
          onRechazar={() => setRechazando(true)}
        />
      </div>

      {puedeEditar && <EditarComercioModal open={editando} c={c} busy={busy} onClose={() => setEditando(false)} onSubmit={editar} />}
      {puedeEditar && <SuspenderModal open={suspendiendo} objeto={`${c.nombre} · ${c.rif}`} busy={busy} onClose={() => setSuspendiendo(false)} onSubmit={suspender} />}
      {puedeAprobar && <RechazarModal open={rechazando} objeto={`${c.nombre} · ${c.rif}`} busy={busy} onClose={() => setRechazando(false)} onSubmit={rechazar} />}
    </div>
  );
}
