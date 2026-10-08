import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import type { ImpulsosResumen } from '@/providers/impulsosProvider';
import { formatInteger, formatMoney } from '@/lib/utils/format';

const FILAS = [
  { clave: 'en_curso', label: 'impulsos.estado.en_curso', dot: 'bg-primary', seg: 'bg-primary' },
  { clave: 'finalizadas', label: 'impulsos.estado.finalizada', dot: 'bg-ink', seg: 'bg-ink' },
  { clave: 'pausadas', label: 'impulsos.estado.pausada', dot: 'bg-line-strong', seg: 'bg-line-strong' },
] as const;

/** Campanas por estado (barra apilada y conteos) y la puja diaria promedio con su minimo. */
export function EstadoCampanasCard({ resumen }: { resumen: ImpulsosResumen | null }) {
  const t = useT();
  const { lang } = useLang();
  const c = resumen?.campanas;
  const total = Math.max(1, c?.total ?? 0);
  return (
    <section aria-labelledby="estado-titulo" className="flex min-w-0 flex-col gap-4 rounded-card bg-surface p-5 shadow-e1">
      <header>
        <h2 id="estado-titulo" className="text-xl font-extrabold tracking-tight">{t('impulsos.campanas.titulo')}</h2>
        <p className="text-sm text-ink-muted">{c ? t('impulsos.campanas.total', { n: formatInteger(c.total, lang) }) : t('common.loading')}</p>
      </header>
      <div aria-hidden="true" className="flex h-2.5 gap-0.5 overflow-hidden rounded-pill bg-surface-2">
        {c && FILAS.map((f) => (c[f.clave] > 0 ? <div key={f.clave} className={f.seg} style={{ width: `${(c[f.clave] / total) * 100}%` }} /> : null))}
      </div>
      <ul className="flex flex-col gap-3">
        {FILAS.map((f) => (
          <li key={f.clave} className="flex items-center gap-3 text-sm">
            <span aria-hidden="true" className={`h-3 w-3 rounded-full ${f.dot}`} />
            <span className="flex-1">{t(f.label)}</span>
            <span className="text-base font-extrabold">{c ? formatInteger(c[f.clave], lang) : '-'}</span>
          </li>
        ))}
      </ul>
      <div className="rounded-card bg-surface-2 p-4">
        <p className="text-xs text-ink-muted">{t('impulsos.campanas.pujaPromedio')}</p>
        <p className="text-3xl font-extrabold tracking-tight">{resumen ? formatMoney(resumen.puja_promedio, lang) : '-'}</p>
        <p className="text-sm text-ink-soft">{resumen ? t('impulsos.campanas.minimo', { monto: formatMoney(resumen.puja_minima, lang) }) : ''}</p>
      </div>
    </section>
  );
}
