import { FileText, Plus } from 'lucide-react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { EditorNotificacion } from '../components/EditorNotificacion';
import { HistorialNotificaciones } from '../components/HistorialNotificaciones';
import { PlantillasModal } from '../components/PlantillasModal';
import { useComposer } from '../hooks/useComposer';
import { useHistorial } from '../hooks/useHistorial';
import type { NotificacionForm } from '../schemas/notificacionSchema';

export const routeName = PATHS.notificaciones;

// B12 · Notificaciones masivas: composer con segmentacion y programacion (horario silencioso 10 pm a 7 am), vista previa e historial.
export default function NotificacionesView() {
  const t = useT();
  const { puede } = useAuth();
  const canEdit = puede('notificaciones', 'editar');
  const historial = useHistorial();
  const composer = useComposer({ onDone: historial.reload });
  const [plantillas, setPlantillas] = useState(false);
  const actual = useWatch({ control: composer.methods.control }) as Partial<NotificacionForm>;

  return (
    <section className="flex flex-col gap-5" data-screen="B12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('notificaciones.title')}</h1>
          <p className="mt-1 text-ink-muted">{t('notificaciones.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="md" onClick={() => setPlantillas(true)}>
            <FileText size={16} aria-hidden="true" />
            {t('notificaciones.templates.open')}
          </Button>
          {canEdit && (
            <Button size="md" onClick={composer.nueva}>
              <Plus size={16} aria-hidden="true" />
              {t('notificaciones.newNotification')}
            </Button>
          )}
        </div>
      </header>

      {canEdit ? (
        <EditorNotificacion composer={composer} />
      ) : (
        <p role="status" className="rounded-card bg-surface-2 px-5 py-4 text-sm font-medium text-ink-soft">
          {t('notificaciones.readOnly')}
        </p>
      )}

      <HistorialNotificaciones historial={historial} canEdit={canEdit} />

      <PlantillasModal
        open={plantillas}
        onOpenChange={setPlantillas}
        canEdit={canEdit}
        actual={{ titulo: actual.titulo ?? '', mensaje: actual.mensaje ?? '' }}
        onUse={composer.aplicarPlantilla}
      />
    </section>
  );
}
