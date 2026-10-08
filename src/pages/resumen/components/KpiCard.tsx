import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { Kpi } from '@/providers/resumenProvider';

interface KpiCardProps {
  label: string;
  icon: LucideIcon;
  kpi: Kpi;
  /** Valor ya formateado (12.480, $4.860,00). */
  value: string;
}

/** Metrica del resumen: icono en circulo, cifra grande y variacion contra el mes anterior. */
export function KpiCard({ label, icon: Icon, kpi, value }: KpiCardProps) {
  const t = useT();
  const hasNuevos = typeof kpi.nuevos === 'number';
  const delta = hasNuevos ? (kpi.nuevos as number) : kpi.variacion_pct;
  const down = (delta ?? 0) < 0;
  const Arrow = down ? ArrowDownRight : ArrowUpRight;
  const text = delta === null || delta === undefined ? null : hasNuevos ? `${down ? '' : '+'}${delta}` : `${Math.abs(delta)}%`;

  return (
    <section className="rounded-card bg-surface p-[22px] shadow-e1" aria-label={label}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink-muted">{label}</span>
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-tint text-primary-deep">
          <Icon size={18} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2.5 break-words text-[34px] font-extrabold leading-10 tracking-tight">{value}</p>
      <div className="mt-3 flex flex-col items-start gap-1.5">
        {text !== null ? (
          <span
            className={cn(
              'inline-flex h-7 items-center gap-1 rounded-pill pl-2 pr-2.5 text-xs font-bold',
              down ? 'bg-err-tint text-err-deep' : 'bg-primary-tint text-primary-deep',
            )}
          >
            <Arrow size={14} aria-hidden="true" />
            {text}
          </span>
        ) : (
          <span className="inline-flex h-7 items-center text-xs font-bold text-ink-muted">{t('resumen.kpi.sinBase')}</span>
        )}
        <span className="text-xs font-medium text-ink-muted">{t('resumen.kpi.vsMes')}</span>
      </div>
    </section>
  );
}
