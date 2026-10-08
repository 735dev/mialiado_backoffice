import { Download, FileSpreadsheet, FileText, RotateCcw } from 'lucide-react';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import type { useDescarga, useDescargas } from '../hooks/useReportes';
import type { EstadoReporte, Reporte } from '../models/reporte';
import { fmtBytes, fmtFechaHora } from '../utils/format';

const TONO: Record<EstadoReporte, 'ok' | 'err' | 'neutral' | 'warn'> = { listo: 'ok', fallo: 'err', vencido: 'neutral', generando: 'warn' };

interface Props {
  descargas: ReturnType<typeof useDescargas>;
  descarga: ReturnType<typeof useDescarga>;
  canEdit: boolean;
  /** «Generar de nuevo»: precarga el generador con el tipo, formato y nombre de este reporte. */
  onRepeat: (r: Reporte) => void;
}

/** Historial de reportes generados (se guardan 30 dias) con descarga segura. */
export function DescargasRecientes({ descargas: d, descarga, canEdit, onRepeat }: Props) {
  const t = useT();
  const { lang } = useLang();
  return (
    <section id="descargas-recientes" aria-label={t('reportes.downloads.title')} className="scroll-mt-6 rounded-[28px] bg-surface p-5 shadow-e1 md:p-6">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-extrabold tracking-tight">{t('reportes.downloads.title')}</h2>
        <span className="text-xs font-medium text-ink-muted">{t('reportes.downloads.kept')}</span>
      </div>

      {d.isLoading && d.items.length === 0 ? (
        <div className="flex justify-center py-10" aria-busy="true">
          <Spinner size={28} className="text-primary-deep" />
        </div>
      ) : d.items.length === 0 ? (
        <EmptyState className="py-8" icon={<FileText size={36} />} title={t('reportes.downloads.emptyTitle')} description={t('reportes.downloads.emptyText')} />
      ) : (
        <ul className={d.isLoading ? 'opacity-60' : undefined} aria-busy={d.isLoading}>
          {d.items.map((r) => (
            <li key={r.id} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-surface-2 text-ink-soft">
                {r.formato === 'xlsx' ? <FileSpreadsheet size={18} aria-hidden="true" /> : <FileText size={18} aria-hidden="true" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{r.nombre}</div>
                <div className="text-xs text-ink-muted">
                  {[r.formato.toUpperCase(), fmtBytes(r.bytes, lang), fmtFechaHora(r.created_at, lang)].filter(Boolean).join(' · ')}
                </div>
              </div>
              <Badge tone={TONO[r.estado]}>{t(`reportes.downloads.estado.${r.estado}`)}</Badge>
              <div className="flex w-10 flex-none justify-end">
                {r.estado === 'listo' ? (
                  <button
                    type="button"
                    aria-label={t('reportes.downloads.download', { nombre: r.nombre })}
                    disabled={descarga.enCurso !== null}
                    onClick={() => void descarga.descargar(r)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-ink-soft hover:bg-primary-tint hover:text-primary-deep disabled:opacity-50"
                  >
                    {descarga.enCurso === r.id ? <Spinner size={16} /> : <Download size={18} />}
                  </button>
                ) : (
                  canEdit && (
                    <button
                      type="button"
                      aria-label={t('reportes.downloads.again', { nombre: r.nombre })}
                      onClick={() => onRepeat(r)}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-bg text-ink-soft hover:bg-primary-tint hover:text-primary-deep"
                    >
                      <RotateCcw size={18} />
                    </button>
                  )
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {d.total > 0 && (
        <div className="mt-3 flex flex-col items-center gap-2 border-t border-line pt-4">
          <span className="text-sm text-ink-muted">{t('reportes.downloads.count', { shown: d.items.length, total: d.total })}</span>
          <PaginatedComplete page={d.page} limit={d.limit} total={d.total} links={d.links} onPageChange={d.setPage} />
        </div>
      )}
      {d.items.length === 0 && !d.isLoading && (
        <div className="flex justify-center">
          <Button variant="ghost" size="md" onClick={d.reload}>
            {t('common.retry')}
          </Button>
        </div>
      )}
    </section>
  );
}
