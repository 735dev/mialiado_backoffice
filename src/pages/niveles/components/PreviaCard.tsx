import { Badge } from '@/components/ui/Badge';
import { useT } from '@/lib/hooks/useT';
import { useFormato } from '../hooks/useFormato';
import type { Nivel } from '../models/reglas';
import type { PreviaCalculada } from '../utils/reglas';

interface PreviaCardProps {
  previa: PreviaCalculada;
  niveles: Nivel[];
  borrador: boolean;
}

/** Efecto de las reglas sobre un producto de ejemplo; refleja el borrador en vivo. */
export function PreviaCard({ previa, niveles, borrador }: PreviaCardProps) {
  const t = useT();
  const { money } = useFormato();
  const nombre = (codigo: string) => niveles.find((n) => n.codigo === codigo)?.nombre ?? codigo;
  const pro = previa.niveles[1] ?? previa.niveles[0];

  return (
    <section aria-labelledby="previa-titulo" className="rounded-panel bg-surface p-5 shadow-e1">
      <div className="flex items-center justify-between gap-3">
        <h2 id="previa-titulo" className="text-lg font-extrabold tracking-tight">
          {t('niveles.previa.titulo')}
        </h2>
        {borrador && <Badge tone="warn">{t('niveles.previa.borrador')}</Badge>}
      </div>
      <p className="mt-1 text-sm text-ink-muted">{t('niveles.previa.ejemplo', { precio: money(previa.precioNormal) })}</p>

      <ul className="mt-3 flex flex-col gap-2">
        {previa.niveles.map((n) => (
          <li key={n.nivel} className="flex items-center justify-between rounded-field bg-bg px-4 py-3">
            <span className="font-bold">{nombre(n.nivel)}</span>
            <span className="flex items-baseline gap-3">
              <span className="text-sm font-bold text-primary-deep">−{n.descuento_pct}%</span>
              <span className="font-extrabold tabular-nums">{money(n.precio)}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-sm text-ink-soft">
        {t('niveles.previa.flash', {
          pct: previa.flash.descuento_pct,
          nivel: nombre(pro?.nivel ?? ''),
          precio: money(previa.flash.precio),
        })}{' '}
        {t('niveles.previa.gana')}
      </p>
    </section>
  );
}
