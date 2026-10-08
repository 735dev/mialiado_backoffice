import { Clock, QrCode } from 'lucide-react';
import { useState } from 'react';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { PromoDetalle, PromoNivel } from '@/providers/promocionesProvider';
import { diasRestantes } from '../format';
import { formatMoney, formatShortDate } from '@/lib/utils/format';
import { TipoPill } from './ColaRevision';

const NIVELES: { codigo: PromoNivel; label: string }[] = [
  { codigo: 'aliado', label: 'Aliado' },
  { codigo: 'aliadopro', label: 'AliadoPro' },
  { codigo: 'aliadoplus', label: 'AliadoPlus' },
];

function horario(p: PromoDetalle): string {
  const dias = Array.isArray(p.dias) ? p.dias.join(', ') : (p.dias ?? '');
  const horas = p.hora_desde && p.hora_hasta ? `${p.hora_desde.slice(0, 5)} – ${p.hora_hasta.slice(0, 5)}` : '';
  return [dias, horas].filter(Boolean).join(' · ');
}

/** "Asi lo vera el usuario": tarjeta oscura con el precio del nivel elegido, horario y vigencia. */
export function PromoPreview({ p }: { p: PromoDetalle }) {
  const t = useT();
  const { lang } = useLang();
  const [nivel, setNivel] = useState<PromoNivel>('aliadoplus');
  const precio = p.precios_por_nivel.find((x) => x.nivel === nivel) ?? p.precios_por_nivel[0];
  const resto = diasRestantes(p.fin);
  const foto = p.fotos[0] ?? p.foto;

  return (
    <div className="flex flex-col items-center gap-4 rounded-card bg-surface-2 p-4">
      <p className="text-xs font-medium text-ink-muted">{t('promociones.preview.asiLoVera', { nombre: p.enviada_por })}</p>
      <article className="flex w-full max-w-[312px] flex-col gap-4 overflow-hidden rounded-card bg-ink p-5 text-bg">
        {foto && <img src={foto} alt="" className="-mx-5 -mt-5 mb-1 h-32 w-[calc(100%+2.5rem)] max-w-none object-cover" />}
        <div className="flex items-center justify-between gap-2">
          <TipoPill tipo={p.tipo} />
          <span className="font-mono text-xs opacity-70">{p.codigo}</span>
        </div>
        <div>
          <h3 className="text-2xl font-extrabold leading-7 tracking-tight">{p.titulo}</h3>
          <p className="text-sm opacity-70">{p.comercio_detalle.nombre}{p.comercio_detalle.direccion ? ` · ${p.comercio_detalle.direccion}` : ''}</p>
        </div>
        {precio && (
          <p className="flex flex-wrap items-center gap-3">
            <span className="rounded-pill bg-primary px-3 py-1 text-lg font-extrabold text-primary-on">-{precio.descuento_pct}%</span>
            {p.precio_normal !== null && <span className="text-sm line-through opacity-60">{formatMoney(p.precio_normal, lang)}</span>}
            <span className="text-xl font-extrabold">{formatMoney(precio.precio, lang)}</span>
          </p>
        )}
        <div className="flex flex-col gap-2 border-t border-dashed border-bg/30 pt-3 text-sm">
          {horario(p) && (
            <p className="flex items-center gap-2 font-bold">
              <Clock size={16} aria-hidden="true" />
              {horario(p)}
            </p>
          )}
          <p className="flex justify-between gap-2 text-xs opacity-80">
            <span>{t('promociones.preview.vigente', { desde: formatShortDate(p.inicio, lang), hasta: formatShortDate(p.fin, lang) })}</span>
            {resto !== null && <span>{t(resto === 1 ? 'promociones.preview.quedaUno' : 'promociones.preview.quedan', { n: resto })}</span>}
          </p>
        </div>
        <div aria-hidden="true" className="flex h-12 items-center justify-center gap-2 rounded-pill bg-primary font-bold text-primary-on">
          <QrCode size={18} />
          {t('promociones.preview.canjear')}
        </div>
      </article>
      <div role="tablist" aria-label={t('promociones.preview.nivel')} className="flex rounded-pill bg-surface-2 p-1 ring-1 ring-inset ring-line">
        {NIVELES.map((n) => (
          <button
            key={n.codigo}
            type="button"
            role="tab"
            aria-selected={nivel === n.codigo}
            onClick={() => setNivel(n.codigo)}
            className={cn('h-11 md:h-9 rounded-pill px-3 text-sm font-semibold', nivel === n.codigo ? 'bg-surface font-bold text-ink shadow-e1' : 'text-ink-muted')}
          >
            {n.label}
          </button>
        ))}
      </div>
    </div>
  );
}
