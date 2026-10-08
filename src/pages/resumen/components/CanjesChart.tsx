import { useMemo, useState } from 'react';
import { useT } from '@/lib/hooks/useT';
import type { Lang } from '@/lib/i18n';
import { cn } from '@/lib/utils/cn';
import type { DiasResumen, PuntoCanjes } from '@/providers/resumenProvider';
import { formatDay, niceScale } from '../utils/format';
import { formatInteger } from '@/lib/utils/format';
import { Card } from './Card';

const RANGOS: DiasResumen[] = [7, 30, 90];
const W = 628;
const H = 318;
const LEFT = 40;
const RIGHT = 624;
const TOP = 44;
const BASE = 272;

interface Props {
  serie: PuntoCanjes[];
  total: number;
  dias: DiasResumen;
  onDias: (d: DiasResumen) => void;
  lang: Lang;
  loading: boolean;
}

/** Barras de canjes por dia + linea de media de 7 dias, con tooltip por columna y tabla alternativa. */
export function CanjesChart({ serie, total, dias, onDias, lang, loading }: Props) {
  const t = useT();
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const geo = useMemo(() => {
    const max = Math.max(0, ...serie.map((p) => p.canjes));
    const { top, step } = niceScale(max);
    const slot = serie.length ? (RIGHT - LEFT) / serie.length : 0;
    const barW = Math.max(2, Math.min(12, slot * 0.62));
    const y = (v: number) => BASE - (v / top) * (BASE - TOP);
    const peak = max > 0 ? serie.findIndex((p) => p.canjes === max) : -1;
    const cx = (i: number) => LEFT + slot * i + slot / 2;
    const line = serie
      .map((p, i) => (p.media_7d == null ? null : `${cx(i).toFixed(1)},${y(p.media_7d).toFixed(1)}`))
      .filter((v): v is string => v !== null)
      .join(' ');
    const ticks = Array.from({ length: 5 }, (_, i) => i * step);
    return { slot, barW, y, peak, cx, line, ticks };
  }, [serie]);

  const labelEvery = Math.max(1, Math.ceil(serie.length / 6));
  const active = hover !== null ? serie[hover] : undefined;
  const tipLeft = hover !== null ? Math.min(70, Math.max(2, (geo.cx(hover) / W) * 100 - 12)) : 0;

  return (
    <Card
      title={t('resumen.canjes.title')}
      subtitle={t('resumen.canjes.subtitle', { dias, total: formatInteger(total, lang) })}
      action={
        <div role="group" aria-label={t('resumen.canjes.rango')} className="inline-flex flex-none items-center gap-0.5 rounded-pill bg-surface-2 p-1">
          {RANGOS.map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={d === dias}
              onClick={() => onDias(d)}
              className={cn(
                'h-11 whitespace-nowrap rounded-pill px-3.5 text-sm md:px-[18px]',
                d === dias ? 'bg-surface font-bold text-ink shadow-e1' : 'font-semibold text-ink-muted',
              )}
            >
              {t('resumen.canjes.dias', { n: d })}
            </button>
          ))}
        </div>
      }
      className={cn(loading && 'opacity-70 transition-opacity')}
    >
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-medium text-ink-muted">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-md bg-primary" />
          {t('resumen.canjes.leyendaDia')}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-sm bg-ink" />
          {t('resumen.canjes.leyendaMedia')}
        </span>
        <button type="button" onClick={() => setAsTable((v) => !v)} className="ml-auto min-h-11 font-semibold text-primary-deep underline-offset-2 hover:underline">
          {asTable ? t('resumen.canjes.verGrafico') : t('resumen.canjes.verTabla')}
        </button>
      </div>

      {serie.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-muted">{t('resumen.canjes.vacio')}</p>
      ) : asTable ? (
        <div className="mt-2 max-h-80 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-xs uppercase tracking-wider text-ink-muted">
                <th className="py-2">{t('resumen.canjes.colDia')}</th>
                <th className="py-2 text-right">{t('resumen.canjes.colCanjes')}</th>
                <th className="py-2 text-right">{t('resumen.canjes.colMedia')}</th>
              </tr>
            </thead>
            <tbody>
              {serie.map((p) => (
                <tr key={p.fecha} className="border-t border-line">
                  <td className="py-2">{formatDay(p.fecha, lang)}</td>
                  <td className="py-2 text-right font-bold">{formatInteger(p.canjes, lang)}</td>
                  <td className="py-2 text-right text-ink-muted">
                    {p.media_7d == null ? '–' : p.media_7d.toLocaleString(lang === 'es' ? 'de-DE' : 'en-US', { maximumFractionDigits: 1 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative mt-1" onMouseLeave={() => setHover(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('resumen.canjes.aria', { dias, total: formatInteger(total, lang) })} className="h-auto w-full">
            {geo.ticks.map((v) => (
              <g key={v}>
                <line x1={LEFT} x2={RIGHT} y1={geo.y(v)} y2={geo.y(v)} className="stroke-line" strokeWidth="1" />
                <text x={LEFT - 12} y={geo.y(v) + 4} textAnchor="end" fontSize="12" className="fill-ink-muted">
                  {formatInteger(v, lang)}
                </text>
              </g>
            ))}
            {serie.map((p, i) => {
              const h = Math.max(p.canjes > 0 ? 2 : 0, BASE - geo.y(p.canjes));
              return (
                <rect
                  key={p.fecha}
                  x={geo.cx(i) - geo.barW / 2}
                  y={BASE - h}
                  width={geo.barW}
                  height={h}
                  rx={Math.min(6, geo.barW / 2)}
                  className={i === geo.peak ? 'fill-ink' : 'fill-primary'}
                  opacity={hover !== null && hover !== i ? 0.55 : 1}
                />
              );
            })}
            {geo.line && <polyline points={geo.line} fill="none" className="stroke-ink" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
            {serie.map((p, i) =>
              i % labelEvery === 0 ? (
                <text key={`l-${p.fecha}`} x={geo.cx(i)} y={296} textAnchor="middle" fontSize="12" className="fill-ink-muted">
                  {formatDay(p.fecha, lang)}
                </text>
              ) : null,
            )}
            {serie.map((p, i) => (
              <rect
                key={`h-${p.fecha}`}
                data-testid="canjes-col"
                x={LEFT + geo.slot * i}
                y={TOP - 10}
                width={geo.slot}
                height={BASE - TOP + 10}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
              />
            ))}
          </svg>
          {active && (
            <div role="tooltip" className="pointer-events-none absolute top-2 z-10 rounded-field bg-ink px-3 py-2 text-xs text-bg shadow-e2" style={{ left: `${tipLeft}%` }}>
              <p className="font-bold">{formatDay(active.fecha, lang)}</p>
              <p>{t('resumen.canjes.tipCanjes', { n: formatInteger(active.canjes, lang) })}</p>
              {active.media_7d != null && <p className="opacity-80">{t('resumen.canjes.tipMedia', { n: Math.round(active.media_7d) })}</p>}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
