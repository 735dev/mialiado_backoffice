import { ArrowDownRight, ArrowUpRight, Banknote, Eye, Percent, Ticket, type LucideIcon } from 'lucide-react';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { ImpulsosResumen, Kpi } from '@/providers/impulsosProvider';
import { decimal, integer, money } from '../format';

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 96;
  const h = 32;
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * w).toFixed(1)},${(h - (v / max) * (h - 4) - 2).toFixed(1)}`).join(' ');
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${w} ${h}`} className="h-8 w-24 flex-none">
      <polyline points={pts} fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="stroke-primary-deep" />
    </svg>
  );
}

/** Variacion contra el periodo anterior: sube (verde), baja (rojo) o sin dato. */
function Variacion({ kpi, lang }: { kpi: Kpi; lang: 'es' | 'en' }) {
  const t = useT();
  const pts = kpi.variacion_pts;
  const value = pts ?? kpi.variacion_pct;
  if (value === null || value === undefined) return <span className="text-xs text-ink-muted">{t('impulsos.kpis.sinComparacion')}</span>;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  const texto = pts !== null && pts !== undefined ? `${decimal(Math.abs(value), lang)} ${t('impulsos.kpis.pts')}` : `${decimal(Math.abs(value), lang, 0)}%`;
  return (
    <span className={cn('inline-flex h-6 items-center gap-1 rounded-pill px-2 text-xs font-bold', up ? 'bg-primary-tint text-primary-deep' : 'bg-err-tint text-err-deep')}>
      <Icon size={12} aria-hidden="true" />
      {texto}
      <span className="sr-only">{t('impulsos.kpis.vsAnterior')}</span>
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, kpi, serie, lang }: { icon: LucideIcon; label: string; value: string; kpi: Kpi; serie?: number[]; lang: 'es' | 'en' }) {
  return (
    <li className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-e1">
      <div className="flex items-center justify-between gap-2 text-sm font-semibold text-ink-soft">
        {label}
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-primary-deep">
          <Icon size={16} aria-hidden="true" />
        </span>
      </div>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <div className="flex min-h-8 items-center justify-between gap-2">
        <Variacion kpi={kpi} lang={lang} />
        {serie && <Sparkline values={serie} />}
      </div>
    </li>
  );
}

export function KpiCards({ resumen, loading }: { resumen: ImpulsosResumen | null; loading: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const k = resumen?.kpis;
  if (!k) {
    return (
      <ul aria-label={t('impulsos.kpis.label')} aria-busy={loading} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="h-36 animate-pulse rounded-card bg-surface shadow-e1" />
        ))}
      </ul>
    );
  }
  return (
    <ul aria-label={t('impulsos.kpis.label')} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard icon={Banknote} label={t('impulsos.kpis.gasto')} value={money(k.gasto_total.valor, lang)} kpi={k.gasto_total} serie={resumen.serie.map((s) => s.gasto)} lang={lang} />
      <KpiCard icon={Eye} label={t('impulsos.kpis.vistas')} value={integer(k.vistas.valor, lang)} kpi={k.vistas} lang={lang} />
      <KpiCard icon={Percent} label={t('impulsos.kpis.ctr')} value={`${decimal(k.ctr.valor, lang)}%`} kpi={k.ctr} lang={lang} />
      <KpiCard icon={Ticket} label={t('impulsos.kpis.canjes')} value={integer(k.canjes_atribuidos.valor, lang)} kpi={k.canjes_atribuidos} serie={resumen.serie.map((s) => s.canjes)} lang={lang} />
    </ul>
  );
}
