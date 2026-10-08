import { Banknote, MessageCircle, Store, Tag, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import type { Lang } from '@/lib/i18n';
import { PATHS } from '@/lib/routes/paths';
import { cn } from '@/lib/utils/cn';
import type { Actividad, CanjesCategoria, TopComercio } from '@/providers/resumenProvider';
import { avatarTone, formatNumber, initials, relativo } from '../utils/format';
import { Card } from './Card';

export function TopComerciosCard({ items, lang }: { items: TopComercio[]; lang: Lang }) {
  const t = useT();
  const max = Math.max(1, ...items.map((i) => i.canjes));
  return (
    <Card title={t('resumen.top.title')} subtitle={t('resumen.top.subtitle')}>
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">{t('resumen.top.vacio')}</p>
      ) : (
        <ol className="mt-3">
          {items.map((c) => (
            <li key={c.id} className="flex h-14 items-center gap-3">
              <span className="w-4 font-mono text-xs font-semibold text-ink-muted">{c.posicion}</span>
              <span className={cn('flex h-10 w-10 flex-none items-center justify-center rounded-full text-[13px] font-extrabold', avatarTone(c.id))}>
                {initials(c.nombre)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{c.nombre}</p>
                <div className="mt-1.5 h-2 rounded-pill bg-surface-2">
                  <div className="h-2 rounded-pill bg-primary" style={{ width: `${Math.round((c.canjes / max) * 100)}%` }} />
                </div>
              </div>
              <span className="min-w-[34px] text-right text-sm font-extrabold">{formatNumber(c.canjes, lang)}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/** Orden fijo de colores: la categoria N siempre pinta igual (identidad, no ranking cambiante). */
const SWATCH = ['bg-primary', 'bg-ink', 'bg-primary-deep', 'bg-primary-tint ring-1 ring-inset ring-line-strong', 'bg-ink-muted', 'bg-line-strong'];

export function CategoriasCard({ items, total, lang }: { items: CanjesCategoria[]; total: number; lang: Lang }) {
  const t = useT();
  const sum = items.reduce((a, c) => a + c.canjes, 0);
  return (
    <Card title={t('resumen.categorias.title')} subtitle={t('resumen.categorias.subtitle', { n: formatNumber(total, lang) })}>
      {items.length === 0 || sum === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">{t('resumen.categorias.vacio')}</p>
      ) : (
        <>
          <div className="mt-5 flex h-5 gap-0.5" role="img" aria-label={t('resumen.categorias.title')}>
            {items.map((c, i) => (
              <div
                key={c.categoria}
                className={cn('h-5 min-w-1', SWATCH[i % SWATCH.length], i === 0 ? 'rounded-l-pill rounded-r' : i === items.length - 1 ? 'rounded-l rounded-r-pill' : 'rounded')}
                style={{ width: `${(c.canjes / sum) * 100}%` }}
                title={`${c.categoria} · ${c.porcentaje}%`}
              />
            ))}
          </div>
          <ul className="mt-4">
            {items.map((c, i) => (
              <li key={c.categoria} className="flex h-[34px] items-center gap-2.5">
                <span className={cn('h-3 w-3 flex-none rounded-md', SWATCH[i % SWATCH.length])} />
                <span className="flex-1 truncate text-sm font-medium text-ink-soft">{c.categoria}</span>
                <span className="text-sm font-extrabold">{c.porcentaje}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

const ICONOS: Record<string, { icon: LucideIcon; tone: string }> = {
  comercio: { icon: Store, tone: 'bg-primary-tint text-primary-deep' },
  recarga: { icon: Banknote, tone: 'bg-primary-tint text-primary-deep' },
  promocion: { icon: Tag, tone: 'bg-primary-tint text-primary-deep' },
};

export function ActividadCard({ items, now }: { items: Actividad[]; now: Date }) {
  const t = useT();
  const { puede } = useAuth();
  return (
    <Card
      title={t('resumen.actividad.title')}
      subtitle={t('resumen.actividad.subtitle')}
      action={
        puede('auditoria') ? (
          <Link to={PATHS.auditoria} className="inline-flex min-h-11 items-center text-sm font-bold text-primary-deep">
            {t('resumen.actividad.verTodo')}
          </Link>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">{t('resumen.actividad.vacio')}</p>
      ) : (
        <ul className="mt-3">
          {items.map((a, i) => {
            const meta = ICONOS[a.tipo] ?? { icon: MessageCircle, tone: 'bg-surface-2 text-ink-soft' };
            const rel = relativo(a.fecha, now);
            const cuando = rel.unit === 'now' ? t('resumen.actividad.ahora') : t(`resumen.actividad.hace.${rel.unit}`, { n: rel.n });
            return (
              <li key={`${a.fecha}-${i}`} className="flex h-14 items-center gap-3">
                <span className={cn('flex h-10 w-10 flex-none items-center justify-center rounded-full', meta.tone)}>
                  <meta.icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{a.texto}</p>
                  <p className="truncate text-sm text-ink-muted">{[a.detalle, cuando].filter(Boolean).join(' · ')}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
