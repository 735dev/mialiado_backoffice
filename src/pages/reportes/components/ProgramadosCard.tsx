import { CalendarClock, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { notify } from '@/lib/utils/notify';
import type { useProgramados } from '../hooks/useReportes';
import type { Programado } from '../models/reporte';
import { borrarProgramado } from '../providers/reportesProvider';
import { fmtHora, nombreDia } from '../utils/format';

interface Props {
  programados: ReturnType<typeof useProgramados>;
  canEdit: boolean;
  onNew: () => void;
}

export function ProgramadosCard({ programados: p, canEdit, onNew }: Props) {
  const t = useT();
  const { lang } = useLang();

  const cuando = (r: Programado): string => {
    const hora = fmtHora(r.hora, lang);
    const formato = r.formato.toUpperCase();
    if (r.frecuencia === 'semanal') return t('reportes.scheduled.weekly', { dia: nombreDia(r.dia ?? 0, lang), hora, formato });
    if (r.frecuencia === 'mensual') return t('reportes.scheduled.monthly', { dia: r.dia ?? 1, hora, formato });
    return t('reportes.scheduled.daily', { hora, formato });
  };

  const borrar = (r: Programado) =>
    notify.confirm(t('reportes.scheduled.confirmDelete', { nombre: r.nombre }), () => {
      void borrarProgramado(r.id).then((res) => {
        if (res.ok) {
          notify.toast.success(t('reportes.scheduled.deleted'));
          p.reload();
        } else notify.fromApiError(res);
      });
    });

  return (
    <section aria-label={t('reportes.scheduled.title')} className="rounded-[28px] bg-surface p-5 shadow-e1 md:p-6">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold tracking-tight">{t('reportes.scheduled.title')}</h2>
        {canEdit && (
          <Button variant="secondary" size="md" onClick={onNew}>
            <Plus size={16} aria-hidden="true" />
            {t('reportes.scheduled.new')}
          </Button>
        )}
      </div>
      {p.isLoading && p.items.length === 0 ? (
        <div className="flex justify-center py-8" aria-busy="true">
          <Spinner size={26} className="text-primary-deep" />
        </div>
      ) : p.items.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">{t('reportes.scheduled.empty')}</p>
      ) : (
        <ul>
          {p.items.map((r) => (
            <li key={r.id} className="flex items-center gap-3.5 border-t border-line py-3.5 first:border-t-0">
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary-tint text-primary-deep">
                <CalendarClock size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold">{r.nombre}</div>
                <div className="text-[13px] text-ink-muted">{cuando(r)}</div>
                <div className="truncate text-[13px] text-ink-muted">{t('reportes.scheduled.to', { correo: r.destinatario })}</div>
              </div>
              <Badge tone={r.activo ? 'ok' : 'neutral'}>{t(r.activo ? 'reportes.scheduled.active' : 'reportes.scheduled.paused')}</Badge>
              {canEdit && (
                <button
                  type="button"
                  aria-label={t('reportes.scheduled.delete', { nombre: r.nombre })}
                  onClick={() => borrar(r)}
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-err-tint text-err-deep"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
