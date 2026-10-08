import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { Dias, ImpulsosResumen } from '@/providers/impulsosProvider';
import { niceMax } from '../format';
import { formatInteger, formatMoney, formatShortDate } from '@/lib/utils/format';

const W = 640;
const H = 250;
const M = { l: 48, r: 36, t: 12, b: 28 };
const DIAS: Dias[] = [7, 30, 90];

/** Barras de gasto diario (eje izquierdo, USD) y linea de canjes atribuidos (eje derecho). SVG propio, sin libreria de graficos. */
export function GastoChart({ resumen, dias, onDias, loading }: { resumen: ImpulsosResumen | null; dias: Dias; onDias: (d: Dias) => void; loading: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const serie = resumen?.serie ?? [];
  const maxGasto = niceMax(Math.max(0, ...serie.map((s) => s.gasto)));
  const maxCanjes = niceMax(Math.max(0, ...serie.map((s) => s.canjes)));
  const pw = W - M.l - M.r;
  const ph = H - M.t - M.b;
  const step = serie.length > 0 ? pw / serie.length : pw;
  const barW = Math.max(2, step * 0.62);
  const x = (i: number) => M.l + step * i + step / 2;
  const yG = (v: number) => M.t + ph - (v / maxGasto) * ph;
  const yC = (v: number) => M.t + ph - (v / maxCanjes) * ph;
  const linea = serie.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${yC(s.canjes).toFixed(1)}`).join(' ');
  const marcas = [0, 0.25, 0.5, 0.75, 1];
  const etiquetas = serie.length > 0 ? [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round((serie.length - 1) * f)) : [];
  const totalGasto = serie.reduce((a, s) => a + s.gasto, 0);
  const totalCanjes = serie.reduce((a, s) => a + s.canjes, 0);

  return (
    <section aria-labelledby="chart-titulo" className="flex min-w-0 flex-col gap-3 rounded-card bg-surface p-5 shadow-e1">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="chart-titulo" className="text-xl font-extrabold tracking-tight">{t('impulsos.chart.titulo')}</h2>
          <p className="text-sm text-ink-muted">{t('impulsos.chart.subtitulo', { dias })}</p>
        </div>
        <div role="tablist" aria-label={t('impulsos.chart.periodo')} className="flex rounded-pill bg-surface-2 p-1">
          {DIAS.map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={dias === d}
              onClick={() => onDias(d)}
              className={cn('h-11 md:h-9 rounded-pill px-4 text-sm font-semibold', dias === d ? 'bg-surface font-bold text-ink shadow-e1' : 'text-ink-muted')}
            >
              {d} d
            </button>
          ))}
        </div>
      </header>

      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft">
        <li className="flex items-center gap-2"><span aria-hidden="true" className="h-3 w-3 rounded-sm bg-primary" />{t('impulsos.chart.gastoDiario')}</li>
        <li className="flex items-center gap-2"><span aria-hidden="true" className="h-0.5 w-4 bg-ink" />{t('impulsos.chart.canjes')}</li>
      </ul>

      {loading && serie.length === 0 ? (
        <div className="h-[250px] animate-pulse rounded-field bg-surface-2" aria-busy="true" />
      ) : serie.length === 0 ? (
        <p className="py-16 text-center text-ink-muted">{t('impulsos.chart.vacio')}</p>
      ) : (
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={t('impulsos.chart.resumen', { dias, gasto: formatMoney(totalGasto, lang), canjes: formatInteger(totalCanjes, lang) })}
          className={cn('h-auto w-full', loading && 'opacity-60')}
        >
          {marcas.map((f) => (
            <g key={f}>
              <line x1={M.l} x2={W - M.r} y1={M.t + ph * (1 - f)} y2={M.t + ph * (1 - f)} className="stroke-line" strokeWidth="1" />
              <text x={M.l - 8} y={M.t + ph * (1 - f) + 4} textAnchor="end" className="fill-ink-muted text-[10px]">{formatMoney(maxGasto * f, lang, maxGasto < 10 ? 2 : 0)}</text>
              <text x={W - M.r + 8} y={M.t + ph * (1 - f) + 4} className="fill-ink-muted text-[10px]">{formatInteger(Math.round(maxCanjes * f), lang)}</text>
            </g>
          ))}
          {serie.map((s, i) => (
            <rect key={s.fecha} x={x(i) - barW / 2} y={yG(s.gasto)} width={barW} height={Math.max(0, M.t + ph - yG(s.gasto))} rx={Math.min(3, barW / 2)} className="fill-primary" />
          ))}
          <path d={linea} fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="stroke-ink" />
          {etiquetas.map((i, n) => (
            <text key={i} x={x(i)} y={H - 8} textAnchor={n === 0 ? 'start' : n === etiquetas.length - 1 ? 'end' : 'middle'} className="fill-ink-muted text-[10px]">
              {formatShortDate(serie[i]?.fecha ?? '', lang)}
            </text>
          ))}
        </svg>
      )}
    </section>
  );
}
