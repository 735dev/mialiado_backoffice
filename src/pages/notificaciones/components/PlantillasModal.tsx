import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useT } from '@/lib/hooks/useT';
import { applyServerErrors } from '@/lib/utils/applyServerErrors';
import { notify } from '@/lib/utils/notify';
import { usePlantillas } from '../hooks/useCatalogos';
import type { Plantilla } from '../models/notificacion';
import { borrarPlantilla, crearPlantilla } from '../providers/notificacionesProvider';
import { plantillaSchema, type PlantillaForm } from '../schemas/notificacionSchema';
import { Modal } from '@/components/ui/Modal';

interface PlantillasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  /** Texto que hay hoy en el composer, para guardarlo como plantilla. */
  actual: { titulo: string; mensaje: string };
  onUse: (p: Plantilla) => void;
}

export function PlantillasModal({ open, onOpenChange, canEdit, actual, onUse }: PlantillasModalProps) {
  const t = useT();
  const plantillas = usePlantillas(open);
  const methods = useZodForm(plantillaSchema, { nombre: '' });
  const [saving, setSaving] = useState(false);
  const puedeGuardar = canEdit && actual.titulo.trim() !== '' && actual.mensaje.trim() !== '';

  const guardar = async (v: PlantillaForm) => {
    setSaving(true);
    const res = await crearPlantilla({ nombre: v.nombre.trim(), titulo: actual.titulo.trim(), cuerpo: actual.mensaje.trim() });
    setSaving(false);
    if (!res.ok) {
      applyServerErrors(methods.setError, res);
      notify.fromApiError(res);
      return;
    }
    notify.toast.success(t('notificaciones.templates.saved'));
    methods.reset({ nombre: '' });
    plantillas.reload();
  };

  const borrar = (p: Plantilla) =>
    notify.confirm(t('notificaciones.templates.confirmDelete', { nombre: p.nombre }), () => {
      void borrarPlantilla(p.id).then((res) => {
        if (res.ok) plantillas.reload();
        else notify.fromApiError(res);
      });
    });

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title={t('notificaciones.templates.title')} description={t('notificaciones.templates.description')}>
      {plantillas.isLoading ? (
        <div className="flex justify-center py-8" aria-busy="true">
          <Spinner size={28} className="text-primary-deep" />
        </div>
      ) : plantillas.items.length === 0 ? (
        <p className="py-4 text-center text-sm text-ink-muted">{t('notificaciones.templates.empty')}</p>
      ) : (
        <ul className="divide-y divide-line">
          {plantillas.items.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{p.nombre}</div>
                <div className="line-clamp-2 text-xs text-ink-muted">{p.cuerpo}</div>
              </div>
              {canEdit && (
                <Button
                  size="md"
                  onClick={() => {
                    onUse(p);
                    onOpenChange(false);
                  }}
                >
                  {t('notificaciones.templates.use')}
                </Button>
              )}
              {canEdit && (
                <button
                  type="button"
                  aria-label={t('notificaciones.templates.delete', { nombre: p.nombre })}
                  onClick={() => borrar(p)}
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-err-tint text-err-deep"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {puedeGuardar && (
        <Form methods={methods} onSubmit={guardar} className="mt-5 gap-3 border-t border-line pt-5">
          <FormInput<PlantillaForm> name="nombre" label="notificaciones.templates.nameLabel" placeholder="notificaciones.templates.namePlaceholder" />
          <Button type="submit" size="md" isLoading={saving}>
            {t('notificaciones.templates.saveCurrent')}
          </Button>
        </Form>
      )}
    </Modal>
  );
}
