import { BellOff, Send, Trash2 } from 'lucide-react';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/hooks/useLang';
import { useT, type TFunction } from '@/lib/hooks/useT';
import { notify } from '@/lib/utils/notify';
import type { useHistorial } from '../hooks/useHistorial';
import type { EstadoNotificacion, Notificacion, TabHistorial } from '../models/notificacion';
import { cancelarNotificacion, enviarNotificacion } from '../providers/notificacionesProvider';
import { fmtFechaHora } from '../utils/format';
import { formatInteger } from '@/lib/utils/format';
import { Segmented } from '@/components/ui/Segmented';

const TONO: Record<EstadoNotificacion, 'neutral' | 'ok' | 'warn' | 'err'> = {
  borrador: 'neutral',
  programada: 'warn',
  enviada: 'ok',
  parcial: 'err',
};

const TABS: TabHistorial[] = ['todos', 'programados', 'enviados'];

interface HistorialProps {
  historial: ReturnType<typeof useHistorial>;
  canEdit: boolean;
}

/** Historial de envios: tabla en escritorio, tarjetas en movil. */
export function HistorialNotificaciones({ historial: h, canEdit }: HistorialProps) {
  const t = useT();
  const { lang } = useLang();

  const enviar = (n: Notificacion) =>
    notify.confirm(t('notificaciones.history.confirmSend', { titulo: n.titulo }), () => {
      void enviarNotificacion(n.id).then((res) => {
        if (res.ok) {
          notify.toast.success(t('notificaciones.toast.sent', { n: formatInteger(res.data.enviados, lang) }));
          h.reload();
        } else notify.fromApiError(res);
      });
    });

  const cancelar = (n: Notificacion) =>
    notify.confirm(t('notificaciones.history.confirmCancel', { titulo: n.titulo }), () => {
      void cancelarNotificacion(n.id).then((res) => {
        if (res.ok) {
          notify.toast.success(t('notificaciones.toast.cancelled'));
          h.reload();
        } else notify.fromApiError(res);
      });
    });

  return (
    <section aria-label={t('notificaciones.history.title')} className="rounded-card bg-surface shadow-e1">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5">
        <h2 className="text-xl font-extrabold tracking-tight">{t('notificaciones.history.title')}</h2>
        <Segmented
          label={t('notificaciones.history.filter')}
          value={h.tab}
          onChange={h.setTab}
          options={TABS.map((tab) => ({ value: tab, label: t(`notificaciones.history.tabs.${tab}`) }))}
        />
      </div>

      {h.isLoading && h.items.length === 0 ? (
        <div className="flex justify-center py-16" aria-busy="true">
          <Spinner size={32} className="text-primary-deep" />
        </div>
      ) : h.items.length === 0 ? (
        <EmptyState
          icon={<BellOff size={40} />}
          title={t('notificaciones.history.emptyTitle')}
          description={t('notificaciones.history.emptyText')}
          action={
            <Button variant="secondary" size="md" onClick={h.reload}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : (
        <div className={h.isLoading ? 'opacity-60' : undefined} aria-busy={h.isLoading}>
          <Tabla items={h.items} lang={lang} t={t} canEdit={canEdit} onSend={enviar} onCancel={cancelar} />
          <Tarjetas items={h.items} lang={lang} t={t} canEdit={canEdit} onSend={enviar} onCancel={cancelar} />
        </div>
      )}

      <div className="flex flex-col items-center gap-3 border-t border-line px-5 py-4 sm:flex-row sm:justify-between">
        <span className="text-sm font-medium text-ink-muted">{t('notificaciones.history.count', { shown: h.items.length, total: h.total })}</span>
        <PaginatedComplete page={h.page} limit={h.limit} total={h.total} links={h.links} onPageChange={h.setPage} />
      </div>
    </section>
  );
}

interface ListaProps {
  items: Notificacion[];
  lang: string;
  t: TFunction;
  canEdit: boolean;
  onSend: (n: Notificacion) => void;
  onCancel: (n: Notificacion) => void;
}

const fechaDe = (n: Notificacion): string | null => n.enviada_at ?? n.programada_para ?? n.created_at;
const pendiente = (n: Notificacion): boolean => n.estado === 'programada' || n.estado === 'borrador';

function Apertura({ n, t }: { n: Notificacion; t: TFunction }) {
  if (n.estado === 'programada' || n.estado === 'borrador') return <span className="text-ink-muted">{t('notificaciones.history.pending')}</span>;
  return (
    <div className="flex items-center gap-2.5">
      <b className="w-10 font-extrabold">{n.apertura_pct}%</b>
      <div className="h-2 flex-1 rounded bg-line" role="presentation">
        <div className="h-2 rounded bg-primary" style={{ width: `${Math.min(100, n.apertura_pct)}%` }} />
      </div>
    </div>
  );
}

function Acciones({ n, t, canEdit, onSend, onCancel }: Omit<ListaProps, 'items' | 'lang'> & { n: Notificacion }) {
  if (!canEdit || !pendiente(n)) return null;
  return (
    <div className="flex justify-end gap-1.5">
      <button
        type="button"
        aria-label={t('notificaciones.history.sendNow', { titulo: n.titulo })}
        onClick={() => onSend(n)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-tint text-primary-deep"
      >
        <Send size={16} />
      </button>
      <button
        type="button"
        aria-label={t('notificaciones.history.cancel', { titulo: n.titulo })}
        onClick={() => onCancel(n)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-err-tint text-err-deep"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function Tabla({ items, lang, t, canEdit, onSend, onCancel }: ListaProps) {
  const head = ['date', 'title', 'segment', 'sent', 'opening', 'state'] as const;
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead>
          <tr>
            {head.map((c) => (
              <th key={c} scope="col" className={`h-11 px-3 font-mono text-xs font-medium uppercase tracking-widest text-ink-muted ${c === 'sent' ? 'text-right' : ''}`}>
                {t(`notificaciones.history.cols.${c}`)}
              </th>
            ))}
            <th scope="col" className="w-24 px-3">
              <span className="sr-only">{t('notificaciones.history.cols.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((n) => (
            <tr key={n.id} className="border-t border-line align-middle">
              <td className="h-16 px-3 text-ink-muted">{fmtFechaHora(fechaDe(n), lang)}</td>
              <td className="px-3 font-bold">{n.titulo}</td>
              <td className="px-3">{n.segmento_texto}</td>
              <td className="px-3 text-right font-extrabold">{n.estado === 'programada' ? formatInteger(n.destinatarios, lang) : formatInteger(n.enviados, lang)}</td>
              <td className="min-w-[150px] px-3">
                <Apertura n={n} t={t} />
              </td>
              <td className="px-3">
                <Badge tone={TONO[n.estado]}>{t(`notificaciones.estado.${n.estado}`)}</Badge>
              </td>
              <td className="px-3">
                <Acciones n={n} t={t} canEdit={canEdit} onSend={onSend} onCancel={onCancel} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tarjetas({ items, lang, t, canEdit, onSend, onCancel }: ListaProps) {
  return (
    <ul className="divide-y divide-line md:hidden">
      {items.map((n) => (
        <li key={n.id} className="flex flex-col gap-2 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <b className="min-w-0 break-words">{n.titulo}</b>
            <Badge tone={TONO[n.estado]}>{t(`notificaciones.estado.${n.estado}`)}</Badge>
          </div>
          <div className="text-xs text-ink-muted">
            {fmtFechaHora(fechaDe(n), lang)} · {n.segmento_texto}
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span>
              <b className="font-extrabold">{formatInteger(n.estado === 'programada' ? n.destinatarios : n.enviados, lang)}</b> {t('notificaciones.history.cols.sent').toLowerCase()}
            </span>
            <div className="w-36">
              <Apertura n={n} t={t} />
            </div>
          </div>
          <Acciones n={n} t={t} canEdit={canEdit} onSend={onSend} onCancel={onCancel} />
        </li>
      ))}
    </ul>
  );
}
