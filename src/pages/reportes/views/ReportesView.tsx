import { History } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { DescargasRecientes } from '../components/DescargasRecientes';
import { GeneradorReporte, type PresetGenerador } from '../components/GeneradorReporte';
import { ProgramadosCard } from '../components/ProgramadosCard';
import { ProgramarModal } from '../components/ProgramarModal';
import { useCatalogos, useDescarga, useDescargas, useProgramados } from '../hooks/useReportes';
import type { Reporte } from '../models/reporte';

export const routeName = PATHS.reportes;

// B14 · Reportes: generador (CSV/XLSX; PDF no existe en el backend), programados y descargas recientes.
export default function ReportesView() {
  const t = useT();
  const { puede } = useAuth();
  const canEdit = puede('reportes', 'editar');
  const catalogos = useCatalogos();
  const descargas = useDescargas();
  const descarga = useDescarga();
  const programados = useProgramados();
  const [programar, setProgramar] = useState(false);
  const [preset, setPreset] = useState<PresetGenerador | null>(null);

  const repetir = (r: Reporte) => {
    setPreset((prev) => ({ tipo: r.tipo, formato: r.formato, nombre: r.nombre, n: (prev?.n ?? 0) + 1 }));
    document.getElementById('generador-reporte')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="flex flex-col gap-5" data-screen="B14">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('reportes.title')}</h1>
          <p className="mt-1 text-ink-muted">{t('reportes.subtitle')}</p>
        </div>
        <Button
          variant="secondary"
          size="md"
          onClick={() => document.getElementById('descargas-recientes')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })}
        >
          <History size={16} aria-hidden="true" />
          {t('reportes.fullHistory')}
        </Button>
      </header>

      <div className="flex flex-col items-start gap-5 xl:flex-row">
        <div id="generador-reporte" className="w-full min-w-0 scroll-mt-6 xl:w-auto">
          <GeneradorReporte catalogos={catalogos} canEdit={canEdit} preset={preset} onGenerated={descargas.reload} onSchedule={() => setProgramar(true)} />
        </div>
        <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
          <ProgramadosCard programados={programados} canEdit={canEdit} onNew={() => setProgramar(true)} />
          <DescargasRecientes descargas={descargas} descarga={descarga} canEdit={canEdit} onRepeat={repetir} />
        </div>
      </div>

      <ProgramarModal open={programar} onOpenChange={setProgramar} onCreated={programados.reload} />
    </section>
  );
}
