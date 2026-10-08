import { ArrowLeft, MessageSquare, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import { notify } from '@/lib/utils/notify';
import { useMiembros } from '../hooks/useCatalogos';
import { useTicket } from '../hooks/useTicket';
import { PRIORIDADES, type CambiosTicket, type EstadoTicket, type PlantillaRespuesta, type Prioridad, type TicketDetalle } from '../models/ticket';
import { actualizarTicket } from '../providers/soporteProvider';
import { formatDateTime, formatMoney } from '@/lib/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { HiloMensajes } from './HiloMensajes';
import { PrioridadBadge } from './PrioridadBadge';
import { ResponderBox } from './ResponderBox';

interface DetalleProps {
  ticketId: number | null;
  plantillas: PlantillaRespuesta[];
  insertar: { texto: string; n: number } | null;
  /** Cuando algo cambia (respuesta, estado...), la bandeja se recarga. */
  onChanged: () => void;
  onBack: () => void;
  className?: string;
}

/** Conversacion del ticket elegido: cabecera con solicitante, asignacion, estado y prioridad; hilo y caja de respuesta. */
export function DetalleTicket({ ticketId, plantillas, insertar, onChanged, onBack, className }: DetalleProps) {
  const t = useT();
  const { puede } = useAuth();
  const { ticket, isLoading, failed, reload } = useTicket(ticketId);
  const canEdit = puede('soporte', 'editar');
  const alCambiar = () => {
    reload();
    onChanged();
  };
  const base = cn('flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-surface shadow-e1', className);

  if (ticketId === null) {
    return (
      <section aria-label={t('soporte.thread.aria')} className={cn(base, 'items-center justify-center')}>
        <EmptyState icon={<MessageSquare size={40} />} title={t('soporte.detail.noneTitle')} description={t('soporte.detail.noneText')} />
      </section>
    );
  }
  if (isLoading) {
    return (
      <section aria-label={t('soporte.thread.aria')} aria-busy="true" className={cn(base, 'items-center justify-center py-24')}>
        <Spinner size={32} className="text-primary-deep" />
      </section>
    );
  }
  if (failed || !ticket) {
    return (
      <section aria-label={t('soporte.thread.aria')} className={cn(base, 'items-center justify-center')}>
        <EmptyState
          title={t('soporte.detail.errorTitle')}
          description={t('soporte.detail.errorText')}
          action={
            <Button variant="secondary" size="md" onClick={reload}>
              {t('common.retry')}
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section aria-label={t('soporte.thread.aria')} className={base}>
      <CabeceraTicket ticket={ticket} canEdit={canEdit} onBack={onBack} onChanged={alCambiar} />
      {ticket.cobro && <CobroCard cobro={ticket.cobro} />}
      <HiloMensajes mensajes={ticket.mensajes} />
      {canEdit ? (
        <ResponderBox key={ticket.id} ticket={ticket} plantillas={plantillas} insertar={insertar} onChanged={alCambiar} />
      ) : (
        <p className="border-t border-line px-7 py-4 text-sm text-ink-muted">{t('soporte.detail.readOnly')}</p>
      )}
    </section>
  );
}

function CobroCard({ cobro }: { cobro: NonNullable<TicketDetalle['cobro']> }) {
  const t = useT();
  const { lang } = useLang();
  const diferencia = cobro.descuento_pct !== cobro.esperado_pct;
  return (
    <div className="mx-4 mb-1 flex items-center gap-3.5 rounded-[20px] bg-bg px-4 py-3 md:mx-7">
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-tint text-primary-deep">
        <Receipt size={18} aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-bold">
          {cobro.comercio} · {cobro.promocion} · {formatDateTime(cobro.fecha, lang)}
        </div>
        <div className="text-sm text-ink-muted">
          {t('soporte.cobro.folio')} <span className="font-mono text-[13px] text-ink-soft">{cobro.folio}</span> · {t('soporte.cobro.consumo')} {formatMoney(cobro.consumo, lang)} ·{' '}
          {t('soporte.cobro.cobrado')} {formatMoney(cobro.cobrado, lang)}
          {diferencia && ` · ${t('soporte.cobro.esperado')} ${formatMoney(cobro.esperado, lang)} (−${cobro.esperado_pct}%)`}
        </div>
      </div>
    </div>
  );
}

interface CabeceraProps {
  ticket: TicketDetalle;
  canEdit: boolean;
  onBack: () => void;
  onChanged: () => void;
}

function CabeceraTicket({ ticket, canEdit, onBack, onChanged }: CabeceraProps) {
  const t = useT();
  const { user, puede } = useAuth();
  const miembros = useMiembros(canEdit && puede('equipo', 'ver'));
  const yo = user ? Number(user.id) : null;
  const s = ticket.solicitante;

  const cambiar = async (cambios: CambiosTicket) => {
    const res = await actualizarTicket(ticket.id, cambios);
    if (res.ok) {
      notify.toast.success(t('soporte.detail.updated'));
      onChanged();
    } else notify.fromApiError(res);
  };

  const opciones = new Map<number, string>();
  if (yo !== null) opciones.set(yo, t('soporte.detail.me'));
  for (const m of miembros) if (!opciones.has(m.id)) opciones.set(m.id, m.nombre);
  if (ticket.asignado_a !== null && !opciones.has(ticket.asignado_a)) opciones.set(ticket.asignado_a, ticket.asignado ?? `#${ticket.asignado_a}`);

  const asignar = (valor: string) => {
    const id = Number(valor);
    if (!valor) return;
    void cambiar(id === yo ? { asignar_a_mi: true } : { asignado_a: id });
  };

  return (
    <div className="flex flex-col gap-4 border-b border-line px-4 pb-5 pt-5 md:px-7 md:pt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <button type="button" onClick={onBack} className="mb-2 inline-flex h-11 items-center gap-1.5 rounded-pill text-sm font-bold text-primary-deep md:hidden">
            <ArrowLeft size={16} aria-hidden="true" />
            {t('soporte.detail.back')}
          </button>
          <div className="font-mono text-xs font-medium uppercase tracking-widest text-ink-muted">
            {t('soporte.detail.ticket', { codigo: ticket.codigo })} · {t(`soporte.origen.${ticket.origen}`)}
          </div>
          <h2 className="mt-1 break-words text-xl font-extrabold leading-7 tracking-tight md:text-2xl">{ticket.asunto}</h2>
        </div>
        <PrioridadBadge prioridad={ticket.prioridad} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={s.nombre} />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">
              {s.nombre} {s.nivel && <span className="font-medium text-ink-muted">· {s.nivel}</span>}
            </div>
            <div className="truncate text-xs text-ink-muted">
              {[s.usuario ? `@${s.usuario}` : null, s.compras !== null ? t('soporte.detail.purchases', { n: s.compras }) : null, s.correo].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label={t('soporte.detail.assignee')}
            value={ticket.asignado_a ?? ''}
            disabled={!canEdit}
            onChange={(e) => asignar(e.target.value)}
            className="h-11 w-auto rounded-pill px-4 text-sm font-semibold"
          >
            <option value="" disabled>
              {t('soporte.detail.unassigned')}
            </option>
            {[...opciones].map(([id, nombre]) => (
              <option key={id} value={id}>
                {nombre}
              </option>
            ))}
          </Select>
          <Select
            aria-label={t('soporte.detail.state')}
            value={ticket.estado}
            disabled={!canEdit}
            onChange={(e) => void cambiar({ estado: e.target.value as EstadoTicket })}
            className="h-11 w-auto rounded-pill px-4 text-sm font-semibold"
          >
            <option value="abierto">{t('soporte.estado.abierto')}</option>
            <option value="resuelto">{t('soporte.estado.resuelto')}</option>
          </Select>
          <Select
            aria-label={t('soporte.detail.priority')}
            value={ticket.prioridad}
            disabled={!canEdit}
            onChange={(e) => void cambiar({ prioridad: e.target.value as Prioridad })}
            className="h-11 w-auto rounded-pill px-4 text-sm font-semibold"
          >
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {t(`soporte.prioridad.${p}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
