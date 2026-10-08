import { Bell } from 'lucide-react';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { Estimacion } from '../models/notificacion';
import { fmtCompacto, fmtFechaLarga, fmtNumero } from '../utils/format';

interface VistaPreviaProps {
  titulo: string;
  mensaje: string;
  segmentoTexto: string;
  /** «Sáb 3 oct, 10:00 am» o «Ahora». */
  saleTexto: string;
  hora: string;
  fecha: Date;
  lang: string;
  estimacion: Estimacion | null;
  loading: boolean;
}

/** Vista previa del prototipo: alcance estimado, resumen del envio y el telefono con la pantalla bloqueada. */
export function VistaPrevia({ titulo, mensaje, segmentoTexto, saleTexto, hora, fecha, lang, estimacion, loading }: VistaPreviaProps) {
  const t = useT();
  return (
    <aside aria-label={t('notificaciones.preview.aria')} className="flex w-full flex-none flex-col gap-4 rounded-[28px] bg-surface p-5 shadow-e2 lg:w-[372px]">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-medium uppercase tracking-widest text-ink-muted">{t('notificaciones.preview.title')}</span>
        <span className="inline-flex h-7 items-center rounded-pill bg-surface-2 px-3 text-xs font-semibold text-ink-soft">
          {t('notificaciones.preview.lock')}
        </span>
      </div>

      <div className="flex items-center gap-4 rounded-card bg-primary-tint px-5 py-4 text-primary-deep" aria-busy={loading}>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{t('notificaciones.preview.reach')}</div>
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <span className="text-3xl font-extrabold tracking-tight">{estimacion ? fmtCompacto(estimacion.alcance, lang) : '—'}</span>
            {estimacion && (
              <span className="text-sm font-semibold">{t('notificaciones.preview.of', { n: fmtNumero(estimacion.total_usuarios, lang) })}</span>
            )}
          </div>
        </div>
        {estimacion && (
          <span className="ml-auto inline-flex h-8 items-center rounded-pill bg-surface px-3.5 text-sm font-bold">{estimacion.porcentaje}%</span>
        )}
      </div>

      <dl className="text-sm">
        <Fila label={t('notificaciones.preview.segment')} value={segmentoTexto} />
        <Fila label={t('notificaciones.preview.sale')} value={saleTexto} />
        <Fila
          label={t('notificaciones.preview.openRate')}
          value={estimacion?.tasa_apertura_tipica != null ? `${estimacion.tasa_apertura_tipica}%` : '—'}
        />
      </dl>

      <div className="mt-auto flex justify-center overflow-hidden" aria-hidden="true">
        <div className="relative h-[300px] w-full max-w-[332px] rounded-t-[44px] bg-ink px-4 pt-3 text-center text-bg dark:bg-bg dark:ring-1 dark:ring-line-strong">
          <div className="mx-auto h-[22px] w-[84px] rounded-pill bg-black" />
          <div className="mt-4 text-sm font-medium opacity-70">{fmtFechaLarga(fecha, lang)}</div>
          <div className="text-6xl font-extrabold leading-[68px] tracking-tight">{hora}</div>
          <div className="mt-5 flex justify-center">
            <div className={cn('w-full max-w-[300px] rounded-card bg-surface/95 px-4 py-3.5 text-left text-ink shadow-e1')}>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-ink-muted">
                <span className="flex h-[18px] w-[18px] items-center justify-center rounded-[6px] bg-primary text-primary-on">
                  <Bell size={11} />
                </span>
                ALIADO
                <span className="ml-auto font-medium">{t('notificaciones.preview.now')}</span>
              </div>
              <div className="mt-2 break-words text-[15px] font-bold leading-5">{titulo || t('notificaciones.preview.emptyTitle')}</div>
              <div className="mt-0.5 break-words text-sm leading-5 text-ink-soft">{mensaje || t('notificaciones.preview.emptyMessage')}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Fila({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-t border-line py-2.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-bold">{value}</dd>
    </div>
  );
}
