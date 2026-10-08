import { Search } from 'lucide-react';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import { useFormato } from '../hooks/useFormato';
import { ESTADOS, type Conteos, type FiltroEstado, type Recarga } from '../models/finanzas';
import { metodoKey } from '../utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { EstadoBadge } from './EstadoBadge';

interface RecargasTableProps {
  items: Recarga[];
  isLoading: boolean;
  total: number;
  page: number;
  limit: number;
  links: { next: string | null; previous: string | null };
  onPageChange: (page: number) => void;
  estado: FiltroEstado;
  onEstado: (e: FiltroEstado) => void;
  texto: string;
  onTexto: (t: string) => void;
  conteos: Conteos | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const TABS: FiltroEstado[] = ['todas', ...ESTADOS];

export function RecargasTable(p: RecargasTableProps) {
  const t = useT();
  const { money, dateTime } = useFormato();
  const metodo = (m: string) => {
    const k = metodoKey(m);
    return k ? t(k) : m;
  };
  const from = p.total === 0 ? 0 : (p.page - 1) * p.limit + 1;
  const to = Math.min(p.page * p.limit, p.total);

  return (
    <section aria-label={t('finanzas.tabla.titulo')} className="flex min-w-0 flex-col gap-4 rounded-panel bg-surface p-4 shadow-e1 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-tight">{t('finanzas.tabla.titulo')}</h2>
        <div className="relative w-full sm:w-72">
          <label htmlFor="buscar-recarga" className="sr-only">
            {t('finanzas.tabla.buscar')}
          </label>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            id="buscar-recarga"
            type="search"
            value={p.texto}
            onChange={(e) => p.onTexto(e.target.value)}
            placeholder={t('finanzas.tabla.buscarPlaceholder')}
            className="h-11 w-full rounded-pill border-[1.5px] border-line-strong bg-bg pl-11 pr-4 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-deep"
          />
        </div>
      </div>

      <div role="tablist" aria-label={t('finanzas.tabla.filtro')} className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = p.estado === tab;
          const count = tab === 'pendiente' ? p.conteos?.pendiente : undefined;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => p.onEstado(tab)}
              className={cn(
                'inline-flex h-11 md:h-9 items-center gap-1.5 rounded-pill px-4 text-sm font-bold',
                active ? 'bg-ink text-bg' : 'bg-surface-2 text-ink-soft hover:text-ink',
              )}
            >
              {t(`finanzas.tabs.${tab}`)}
              {count !== undefined && count > 0 && (
                <span className={cn('rounded-pill px-1.5 text-xs', active ? 'bg-bg text-ink' : 'bg-warn-tint text-warn')}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="relative min-h-40" aria-busy={p.isLoading}>
        {p.isLoading && p.items.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-ink-muted">
            <Spinner />
          </div>
        ) : p.items.length === 0 ? (
          <EmptyState title={t('finanzas.tabla.vacioTitulo')} description={t('finanzas.tabla.vacioTexto')} className="py-10" />
        ) : (
          <>
            <table className="hidden w-full border-collapse text-left text-sm md:table">
              <thead>
                <tr className="border-b border-line text-xs font-bold uppercase tracking-wider text-ink-muted">
                  <th scope="col" className="py-3 pr-3">{t('finanzas.col.transaccion')}</th>
                  <th scope="col" className="px-3 py-3">{t('finanzas.col.metodo')}</th>
                  <th scope="col" className="px-3 py-3 text-right">{t('finanzas.col.monto')}</th>
                  <th scope="col" className="px-3 py-3">{t('finanzas.col.estado')}</th>
                  <th scope="col" className="py-3 pl-3">{t('finanzas.col.fecha')}</th>
                </tr>
              </thead>
              <tbody className={cn(p.isLoading && 'opacity-50')}>
                {p.items.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => p.onSelect(r.id)}
                    className={cn('cursor-pointer border-b border-line last:border-0 hover:bg-surface-2', p.selectedId === r.id && 'bg-primary-tint')}
                  >
                    <td className="py-3 pr-3">
                      <button type="button" onClick={() => p.onSelect(r.id)} aria-pressed={p.selectedId === r.id} className="flex items-center gap-3 text-left">
                        <Avatar name={r.comercio} src={r.logo_url} tone="primary" />
                        <span className="flex flex-col">
                          <span className="font-bold">{r.comercio}</span>
                          <span className="font-mono text-xs text-ink-muted">{r.referencia}</span>
                        </span>
                      </button>
                    </td>
                    <td className="px-3 py-3">{metodo(r.metodo)}</td>
                    <td className="px-3 py-3 text-right font-bold tabular-nums">{money(r.monto)}</td>
                    <td className="px-3 py-3">
                      <EstadoBadge estado={r.estado} />
                    </td>
                    <td className="py-3 pl-3 text-ink-muted">{dateTime(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className={cn('flex flex-col gap-2 md:hidden', p.isLoading && 'opacity-50')}>
              {p.items.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => p.onSelect(r.id)}
                    aria-pressed={p.selectedId === r.id}
                    className={cn('flex w-full items-center gap-3 rounded-card p-3 text-left', p.selectedId === r.id ? 'bg-primary-tint' : 'bg-bg')}
                  >
                    <Avatar name={r.comercio} src={r.logo_url} tone="primary" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-bold">{r.comercio}</span>
                      <span className="font-mono text-xs text-ink-muted">{r.referencia}</span>
                      <span className="text-xs text-ink-muted">
                        {metodo(r.metodo)} · {dateTime(r.created_at)}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="font-bold tabular-nums">{money(r.monto)}</span>
                      <EstadoBadge estado={r.estado} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="flex items-center gap-3">
          <p className="text-sm text-ink-muted">{t('finanzas.tabla.rango', { from, to, total: p.total })}</p>
        </div>
        <PaginatedComplete page={p.page} limit={p.limit} total={p.total} links={p.links} onPageChange={p.onPageChange} />
      </div>
    </section>
  );
}
