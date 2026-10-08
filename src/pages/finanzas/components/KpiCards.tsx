import { TrendingDown, TrendingUp } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import { useFormato } from '../hooks/useFormato';
import type { Kpis } from '../models/finanzas';
import { formatPct } from '../utils/format';

function Delta({ value }: { value: number | null | undefined }) {
  const text = formatPct(value);
  if (text === null || value === null || value === undefined) return null;
  const up = value >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs font-bold', up ? 'text-primary-deep' : 'text-err-deep')}>
      <Icon size={14} aria-hidden="true" />
      {text}
    </span>
  );
}

function Card({ label, value, extra }: { label: string; value: string; extra?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-card bg-surface p-5 shadow-e1">
      <span className="text-sm font-semibold text-ink-muted">{label}</span>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-2xl font-extrabold tracking-tight">{value}</span>
        {extra}
      </div>
    </div>
  );
}

/** Tarjetas de B09: recargas del mes, pendientes por conciliar, comision y reembolsos. */
export function KpiCards({ kpis, isLoading }: { kpis: Kpis | null; isLoading: boolean }) {
  const t = useT();
  const { money } = useFormato();
  if (!kpis) {
    return (
      <div className="flex h-24 items-center justify-center rounded-card bg-surface text-ink-muted shadow-e1" aria-busy={isLoading}>
        {isLoading && <Spinner />}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" data-testid="kpis">
      <Card label={t('finanzas.kpi.recargasMes')} value={money(kpis.recargas_mes.valor)} extra={<Delta value={kpis.recargas_mes.variacion_pct} />} />
      <Card
        label={t('finanzas.kpi.pendientes')}
        value={`${kpis.pendientes.cantidad} · ${money(kpis.pendientes.monto)}`}
      />
      <Card label={t('finanzas.kpi.comision')} value={money(kpis.comision.valor)} extra={<Delta value={kpis.comision.variacion_pct} />} />
      <Card
        label={t('finanzas.kpi.reembolsos')}
        value={money(kpis.reembolsos.monto)}
        extra={<span className="text-xs font-bold text-ink-muted">{t(kpis.reembolsos.operaciones === 1 ? 'finanzas.kpi.operaciones_one' : 'finanzas.kpi.operaciones', { n: kpis.reembolsos.operaciones })}</span>}
      />
    </div>
  );
}
