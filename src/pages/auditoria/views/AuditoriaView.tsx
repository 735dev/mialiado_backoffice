import { Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { notify } from '@/lib/utils/notify';
import { FiltrosAuditoria } from '../components/FiltrosAuditoria';
import { RegistroEventos } from '../components/RegistroEventos';
import { useAuditoria, usePersonas } from '../hooks/useAuditoria';
import { exportarEventos } from '../providers/auditoriaProvider';
import { guardarArchivo, nombreSeguro } from '@/lib/utils/descarga';
import { hoyCaracas } from '../utils/fechas';

export const routeName = PATHS.auditoria;

// B16 · Auditoria: registro inmutable y paginado de las acciones del equipo, con filtros, detalle y exportacion CSV.
export default function AuditoriaView() {
  const t = useT();
  const { puede } = useAuth();
  const registro = useAuditoria();
  const personas = usePersonas(puede('equipo', 'ver'), registro.items);
  const [exportando, setExportando] = useState(false);

  const exportar = async () => {
    setExportando(true);
    const res = await exportarEventos(registro.consulta);
    setExportando(false);
    if (res.ok) {
      guardarArchivo(res.data, nombreSeguro(`auditoria-${hoyCaracas()}`, 'csv'));
      notify.toast.success(t('auditoria.exported'));
    } else notify.fromApiError(res);
  };

  return (
    <section className="flex flex-col gap-5" data-screen="B16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('auditoria.title')}</h1>
          <p className="mt-1 text-ink-muted">{t('auditoria.subtitle')}</p>
        </div>
        <Button variant="secondary" size="md" onClick={() => void exportar()} isLoading={exportando}>
          <Download size={16} aria-hidden="true" />
          {t('auditoria.export')}
        </Button>
      </header>

      <section aria-label={t('auditoria.table.aria')} className="rounded-[28px] bg-surface shadow-e1">
        <FiltrosAuditoria methods={registro.methods} personas={personas} />
        <RegistroEventos registro={registro} />
      </section>
    </section>
  );
}
