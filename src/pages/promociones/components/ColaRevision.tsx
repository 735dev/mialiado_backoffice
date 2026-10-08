import { ChevronDown, Percent, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { PromoFila, PromoRevision } from '@/providers/promocionesProvider';
import { haceCuanto, initials } from '../format';

export function TipoPill({ tipo }: { tipo: PromoFila['tipo'] }) {
  const t = useT();
  const flash = tipo === 'flash';
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-pill px-3 text-xs font-bold',
        flash ? 'bg-ink text-bg' : 'bg-primary-tint text-primary-deep',
      )}
    >
      {flash ? <Zap size={12} aria-hidden="true" /> : <Percent size={12} aria-hidden="true" />}
      {t(flash ? 'promociones.tipo.flash' : 'promociones.tipo.descuento')}
    </span>
  );
}

const REVISION_TONE: Record<PromoRevision, 'ok' | 'warn' | 'err'> = { Listo: 'ok', 'Sin foto': 'warn', 'Supera 50 %': 'err' };
const REVISION_KEY: Record<PromoRevision, string> = { Listo: 'listo', 'Sin foto': 'sinFoto', 'Supera 50 %': 'supera' };

export function RevisionBadge({ revision, tope }: { revision: PromoRevision; tope: number }) {
  const t = useT();
  return <Badge tone={REVISION_TONE[revision] ?? 'neutral'}>{t(`promociones.revision.${REVISION_KEY[revision] ?? 'listo'}`, { tope })}</Badge>;
}

interface Props {
  items: PromoFila[];
  total: number;
  activeId: number | null;
  isLoading: boolean;
  restantes: number;
  onSelect: (id: number) => void;
  onMore: () => void;
}

/** Cola de revision: una tarjeta por promocion, las mas antiguas arriba; la seleccionada se resalta en verde. */
export function ColaRevision({ items, total, activeId, isLoading, restantes, onSelect, onMore }: Props) {
  const t = useT();
  const { lang } = useLang();
  return (
    <section aria-labelledby="cola-titulo" className="flex min-w-0 flex-col gap-3">
      <header className="px-1">
        <h2 id="cola-titulo" className="text-xl font-extrabold tracking-tight">
          {t('promociones.cola.titulo')}
        </h2>
        <p className="text-sm text-ink-muted">{t('promociones.cola.pendientes', { n: total })}</p>
      </header>
      <ul className={cn('flex flex-col gap-3', isLoading && 'opacity-60')}>
        {items.map((p) => {
          const active = p.id === activeId;
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(p.id)}
                className={cn(
                  'flex w-full flex-col gap-3 rounded-card bg-surface p-4 text-left shadow-e1 ring-2 ring-inset',
                  active ? 'ring-primary' : 'ring-transparent',
                )}
              >
                <span className="flex items-start gap-3">
                  <span aria-hidden="true" className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-warn-tint text-sm font-extrabold text-warn">
                    {initials(p.comercio.nombre)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-bold leading-5">{p.titulo}</span>
                    <span className="block truncate text-sm text-ink-muted">
                      {p.comercio.nombre} · {t('promociones.cola.plus', { pct: p.descuento_max })}
                    </span>
                  </span>
                  <span className="flex-none text-xs text-ink-muted">{haceCuanto(p.creada, lang)}</span>
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <TipoPill tipo={p.tipo} />
                    <span className="rounded-pill bg-primary px-3 py-1 text-sm font-extrabold text-primary-on">-{p.descuento_base}%</span>
                  </span>
                  <RevisionBadge revision={p.revision} tope={p.tope} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {isLoading && items.length > 0 && (
        <div className="flex justify-center py-2 text-ink-muted">
          <Spinner size={20} />
        </div>
      )}
      {restantes > 0 && (
        <Button variant="ghost" size="md" onClick={onMore} disabled={isLoading} className="self-center text-primary-deep">
          <ChevronDown size={18} aria-hidden="true" />
          {t('promociones.cola.verRestantes', { n: restantes })}
        </Button>
      )}
    </section>
  );
}
