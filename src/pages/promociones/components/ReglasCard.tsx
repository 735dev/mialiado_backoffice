import { Check, TriangleAlert } from 'lucide-react';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { PromoDetalle } from '@/providers/promocionesProvider';
import { money } from '../format';

/** Titulos de cada regla automatica del backend (`clave`); si llega una desconocida se muestra la clave. */
const TITULO: Record<string, string> = {
  descuento_maximo: 'promociones.reglas.descuentoMaximo',
  fotos: 'promociones.reglas.fotos',
  vigencia: 'promociones.reglas.vigencia',
  sin_acumulacion: 'promociones.reglas.sinAcumulacion',
  comercio_verificado: 'promociones.reglas.comercioVerificado',
};

export function ReglasCard({ p }: { p: PromoDetalle }) {
  const t = useT();
  const { cumplidas, total, checks } = p.reglas_automaticas;
  const todo = cumplidas === total;
  return (
    <section aria-labelledby="reglas-titulo" className="flex min-w-0 flex-col gap-4">
      <h3 id="reglas-titulo" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
        {t('promociones.reglas.titulo')}
        <span className={cn('rounded-pill px-2.5 py-0.5 font-mono text-xs font-bold', todo ? 'bg-primary-tint text-primary-deep' : 'bg-warn-tint text-warn')}>
          {t('promociones.reglas.nDeN', { n: cumplidas, total })}
        </span>
      </h3>
      <ul className="flex flex-col gap-3">
        {checks.map((c) => (
          <li key={c.clave} className="flex items-start gap-3">
            <span
              className={cn('mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full', c.ok ? 'bg-primary-tint text-primary-deep' : 'bg-warn-tint text-warn')}
            >
              {c.ok ? <Check size={14} aria-label={t('promociones.reglas.cumple')} /> : <TriangleAlert size={14} aria-label={t('promociones.reglas.noCumple')} />}
            </span>
            <span className="min-w-0 text-sm">
              <span className="block font-bold leading-5">{t(TITULO[c.clave] ?? c.clave)}</span>
              <span className="block text-ink-muted">{c.texto}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className={cn('rounded-card p-4 text-sm', todo ? 'bg-surface-2' : 'bg-warn-tint text-warn')}>
        {todo ? t('promociones.reglas.todoEnRegla', { comercio: p.comercio.nombre }) : t(total - cumplidas === 1 ? 'promociones.reglas.hayPendienteUno' : 'promociones.reglas.hayPendientes', { n: total - cumplidas })}
      </p>
    </section>
  );
}

const ETIQUETA = { aliado: 'Aliado', aliadopro: 'AliadoPro', aliadoplus: 'AliadoPlus' } as const;

export function PreciosPorNivel({ p }: { p: PromoDetalle }) {
  const t = useT();
  const { lang } = useLang();
  return (
    <section aria-labelledby="precios-titulo" className="flex flex-col gap-3">
      <h3 id="precios-titulo" className="font-bold">
        {t('promociones.precios.titulo')}
        {p.precio_normal !== null && <span className="ml-2 text-sm font-normal text-ink-muted">{t('promociones.precios.lista', { precio: money(p.precio_normal, lang) })}</span>}
      </h3>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {p.precios_por_nivel.map((n) => (
          <li key={n.nivel} className="rounded-card bg-surface-2 p-4">
            <p className="text-xs font-bold text-ink-soft">{ETIQUETA[n.nivel]}</p>
            <p className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight">{money(n.precio, lang)}</span>
              <span className="text-sm font-bold text-primary-deep">-{n.descuento_pct}%</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
