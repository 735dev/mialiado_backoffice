import { ChevronDown, Search } from 'lucide-react';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { CategoriaOpcion, ConteosComercios, TabComercios, ZonaOpcion } from '@/providers/comerciosProvider';
import type { FiltrosState } from '../hooks/useComerciosLista';

const TABS: Array<{ id: TabComercios; key: keyof ConteosComercios }> = [
  { id: 'todos', key: 'todos' },
  { id: 'por_verificar', key: 'por_verificar' },
  { id: 'activos', key: 'activos' },
  { id: 'suspendidos', key: 'suspendidos' },
];

const PILL_SELECT =
  'h-11 w-full appearance-none rounded-pill bg-surface pl-4 pr-9 text-sm font-semibold text-ink ring-1 ring-inset ring-line-strong focus:outline-none focus:ring-2 focus:ring-primary-deep';

interface Props {
  filtros: FiltrosState;
  conteos: ConteosComercios | null;
  categorias: CategoriaOpcion[];
  zonas: ZonaOpcion[];
  onChange: (p: Partial<FiltrosState>) => void;
}

/** Pestanas con conteo (segmentado), buscador por nombre/RIF y filtros de categoria y zona. */
export function FiltrosBar({ filtros, conteos, categorias, zonas, onChange }: Props) {
  const t = useT();
  return (
    <div className="flex flex-col gap-4 p-4 md:p-5 xl:flex-row xl:items-center xl:justify-between">
      <div role="tablist" aria-label={t('comercios.tabs.label')} className="inline-flex max-w-full items-center gap-0.5 self-start overflow-x-auto rounded-pill bg-surface-2 p-1">
        {TABS.map((tab) => {
          const active = filtros.tab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange({ tab: tab.id })}
              className={cn(
                'h-11 flex-none whitespace-nowrap rounded-pill px-4 text-sm md:px-[18px]',
                active ? 'bg-surface font-bold text-ink shadow-e1' : 'font-semibold text-ink-muted',
              )}
            >
              {t(`comercios.tabs.${tab.id}`)}
              <span className="ml-2 tabular-nums">{conteos ? conteos[tab.key] : '–'}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,180px)_minmax(0,160px)] xl:w-auto xl:grid-cols-[260px_180px_160px]">
        <label className="flex h-12 items-center gap-2.5 rounded-pill bg-surface px-[18px] text-ink-muted ring-1 ring-inset ring-line-strong focus-within:ring-2 focus-within:ring-primary-deep">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            value={filtros.q}
            onChange={(e) => onChange({ q: e.target.value })}
            aria-label={t('comercios.filtros.buscar')}
            placeholder={t('comercios.filtros.buscar')}
            className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-muted"
          />
        </label>
        <div className="relative">
          <select
            aria-label={t('comercios.filtros.categoria')}
            value={filtros.categoriaId ?? ''}
            onChange={(e) => onChange({ categoriaId: e.target.value ? Number(e.target.value) : null })}
            className={PILL_SELECT}
          >
            <option value="">{t('comercios.filtros.categoria')}</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        </div>
        <div className="relative">
          <select aria-label={t('comercios.filtros.zona')} value={filtros.zona} onChange={(e) => onChange({ zona: e.target.value })} className={PILL_SELECT}>
            <option value="">{t('comercios.filtros.zona')}</option>
            {zonas.map((z) => (
              <option key={z.id} value={z.nombre}>
                {z.nombre}
              </option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        </div>
      </div>
    </div>
  );
}
