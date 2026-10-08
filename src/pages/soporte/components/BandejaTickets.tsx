import { Inbox, Search } from 'lucide-react';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Select } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { useBandeja } from '../hooks/useBandeja';
import { PRIORIDADES, type OrigenTicket, type Prioridad, type TabBandeja, type TicketResumen } from '../models/ticket';
import { hace } from '../utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { PrioridadBadge } from './PrioridadBadge';
import { Segmented } from '@/components/ui/Segmented';

const TABS: TabBandeja[] = ['abiertos', 'mios', 'resueltos'];

interface BandejaProps {
  bandeja: ReturnType<typeof useBandeja>;
  selectedId: number | null;
  /** Tickets abiertos en esta sesion: ya no se muestran como «sin leer» aunque la lista no se haya recargado. */
  leidos: ReadonlySet<number>;
  onSelect: (id: number) => void;
  className?: string;
}

/** Bandeja de tickets paginada (408 px en escritorio, ancho completo en movil). */
export function BandejaTickets({ bandeja: b, selectedId, leidos, onSelect, className }: BandejaProps) {
  const t = useT();
  const { lang } = useLang();
  const yaLeidos = b.items.filter((i) => i.sin_leer && leidos.has(i.id)).length;
  const sinLeer = b.conteos ? Math.max(0, b.conteos.sin_leer - yaLeidos) : 0;
  const etiqueta = (tab: TabBandeja) => {
    const n = b.conteos?.[tab];
    return n !== undefined && tab !== 'resueltos' ? `${t(`soporte.tabs.${tab}`)} ${n}` : t(`soporte.tabs.${tab}`);
  };

  return (
    <section aria-label={t('soporte.inbox.aria')} className={cn('flex min-w-0 flex-col gap-3 rounded-[28px] bg-surface p-3 shadow-e1 md:p-4', className)}>
      <div className="flex flex-col gap-3.5 px-1.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight">{t('soporte.inbox.title')}</h2>
          <span className="text-sm font-semibold text-ink-muted">{t('soporte.inbox.unread', { n: sinLeer })}</span>
        </div>
        <Segmented
          label={t('soporte.inbox.filter')}
          value={b.tab}
          onChange={b.setTab}
          options={TABS.map((tab) => ({ value: tab, label: etiqueta(tab) }))}
        />
        <label className="flex h-12 items-center gap-2.5 rounded-pill bg-surface-2 px-4 text-ink-muted focus-within:ring-2 focus-within:ring-primary-deep">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">{t('soporte.inbox.searchLabel')}</span>
          <input
            type="search"
            value={b.busqueda}
            onChange={(e) => b.setBusqueda(e.target.value)}
            placeholder={t('soporte.inbox.search')}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Select
            aria-label={t('soporte.inbox.priorityFilter')}
            value={b.prioridad}
            onChange={(e) => b.setPrioridad(e.target.value as Prioridad | '')}
            className="h-10 rounded-pill px-4 text-sm"
          >
            <option value="">{t('soporte.inbox.allPriorities')}</option>
            {PRIORIDADES.map((p) => (
              <option key={p} value={p}>
                {t(`soporte.prioridad.${p}`)}
              </option>
            ))}
          </Select>
          <Select
            aria-label={t('soporte.inbox.originFilter')}
            value={b.origen}
            onChange={(e) => b.setOrigen(e.target.value as OrigenTicket | '')}
            className="h-10 rounded-pill px-4 text-sm"
          >
            <option value="">{t('soporte.inbox.allOrigins')}</option>
            <option value="usuario">{t('soporte.origen.usuario')}</option>
            <option value="comercio">{t('soporte.origen.comercio')}</option>
          </Select>
        </div>
      </div>

      {b.isLoading && b.items.length === 0 ? (
        <div className="flex justify-center py-12" aria-busy="true">
          <Spinner size={30} className="text-primary-deep" />
        </div>
      ) : b.items.length === 0 ? (
        <EmptyState
          className="py-10"
          icon={<Inbox size={36} />}
          title={t('soporte.inbox.emptyTitle')}
          description={t('soporte.inbox.emptyText')}
          action={
            <Button variant="secondary" size="md" onClick={b.reload}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : (
        <ul className={cn('flex flex-col gap-0.5', b.isLoading && 'opacity-60')} aria-busy={b.isLoading}>
          {b.items.map((tk) => (
            <Fila key={tk.id} ticket={tk} activo={tk.id === selectedId} sinLeer={tk.sin_leer && !leidos.has(tk.id)} lang={lang} onSelect={onSelect} />
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-col items-center gap-2 px-1 py-2">
        <span className="text-sm text-ink-muted">{t('soporte.inbox.count', { shown: b.items.length, total: b.total })}</span>
        <PaginatedComplete page={b.page} limit={b.limit} total={b.total} links={b.links} onPageChange={b.setPage} />
      </div>
    </section>
  );
}

interface FilaProps {
  ticket: TicketResumen;
  activo: boolean;
  sinLeer: boolean;
  lang: string;
  onSelect: (id: number) => void;
}

function Fila({ ticket: tk, activo, sinLeer, lang, onSelect }: FilaProps) {
  const t = useT();
  const nombre = tk.origen === 'comercio' && tk.comercio ? tk.comercio : tk.solicitante;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(tk.id)}
        aria-current={activo ? 'true' : undefined}
        className={cn('flex w-full items-center gap-3 rounded-[20px] p-3.5 text-left transition-colors', activo ? 'bg-primary-tint' : 'hover:bg-surface-2')}
      >
        <span className="flex w-2.5 flex-none justify-center">
          {sinLeer && <span className="h-2.5 w-2.5 rounded-full bg-primary ring-[1.5px] ring-primary-deep" aria-label={t('soporte.inbox.unreadDot')} />}
        </span>
        <Avatar name={nombre} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className={cn('truncate text-sm', sinLeer ? 'font-extrabold' : 'font-semibold')}>
              {nombre} <span className="font-medium text-ink-muted">· {t(`soporte.origen.${tk.origen}`)}</span>
            </span>
            <span className="flex-none text-xs text-ink-muted">{hace(tk.updated_at, lang)}</span>
          </span>
          <span className={cn('mt-0.5 block truncate text-sm', sinLeer ? 'font-bold text-ink' : 'text-ink-muted')}>{tk.asunto}</span>
          <span className="mt-1.5 flex items-center gap-2">
            <PrioridadBadge prioridad={tk.prioridad} />
            <span className="font-mono text-xs text-ink-muted">{tk.codigo}</span>
          </span>
        </span>
      </button>
    </li>
  );
}
