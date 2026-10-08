import { useT } from '@/lib/hooks/useT';
import { useAppSelector } from '@/lib/store/hooks';
import type { Nivel } from '../models/reglas';
import type { ReglasFormValues } from '../schemas/reglas';
import { formatCount } from '../utils/format';
import { NumField } from './NumField';

interface NivelesCardProps {
  niveles: Nivel[];
  values: ReglasFormValues;
  disabled: boolean;
}

const nan = (n: number) => (Number.isFinite(n) ? n : 0);

/** Tabla de niveles: cada tramo empieza donde termina el anterior; se edita el "Hasta" y los puntos extra. */
export function NivelesCard({ niveles, values, disabled }: NivelesCardProps) {
  const t = useT();
  const lang = useAppSelector((s) => s.lang.current);
  const desde = [0, nan(values.hasta0) + 1, nan(values.hasta1) + 1];
  const hasta = ['hasta0', 'hasta1'] as const;
  const extra = ['extra0', 'extra1', 'extra2'] as const;

  return (
    <section aria-labelledby="niveles-titulo" className="rounded-panel bg-surface p-5 shadow-e1 md:p-6">
      <h2 id="niveles-titulo" className="text-lg font-extrabold tracking-tight">
        {t('niveles.niveles.titulo')}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{t('niveles.niveles.descripcion')}</p>

      <div className="mt-4 hidden grid-cols-[1.4fr_0.6fr_1fr_1fr] gap-3 border-b border-line pb-2 text-xs font-bold uppercase tracking-wider text-ink-muted md:grid">
        <span>{t('niveles.niveles.nivel')}</span>
        <span>{t('niveles.niveles.desde')}</span>
        <span className="text-right">{t('niveles.niveles.hasta')}</span>
        <span className="text-right">{t('niveles.niveles.puntos')}</span>
      </div>

      <ul className="divide-y divide-line">
        {niveles.map((n, i) => (
          <li key={n.codigo} className="grid grid-cols-2 items-center gap-3 py-4 md:grid-cols-[1.4fr_0.6fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <div className="font-extrabold">{n.nombre}</div>
              <div className="text-xs text-ink-muted">{t(n.usuarios === 1 ? 'niveles.niveles.usuarios_one' : 'niveles.niveles.usuarios', { n: formatCount(n.usuarios, lang) })}</div>
            </div>
            <div className="text-sm">
              <span className="mr-2 text-xs font-bold uppercase text-ink-muted md:hidden">{t('niveles.niveles.desde')}</span>
              <span className="font-bold tabular-nums">{desde[i]}</span>
            </div>
            <div className="flex justify-end">
              {i < 2 ? (
                <NumField
                  name={hasta[i] as 'hasta0' | 'hasta1'}
                  label={t('niveles.niveles.hastaDe', { nivel: n.nombre })}
                  unit={t('niveles.niveles.compras')}
                  disabled={disabled}
                />
              ) : (
                <span className="text-sm text-ink-muted">{t('niveles.niveles.enAdelante')}</span>
              )}
            </div>
            <div className="col-span-2 flex justify-end md:col-span-1">
              <NumField
                name={extra[i] as 'extra0' | 'extra1' | 'extra2'}
                label={t('niveles.niveles.puntosDe', { nivel: n.nombre })}
                prefix="+"
                unit={t('niveles.niveles.pts')}
                disabled={disabled}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
