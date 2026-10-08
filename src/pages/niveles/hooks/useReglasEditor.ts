import { useCallback, useEffect, useState } from 'react';
import { useT } from '@/lib/hooks/useT';
import { notify } from '@/lib/utils/notify';
import { useZodForm } from '@/components/form/useZodForm';
import { guardarReglas, restaurarVersion } from '../providers/reglasProvider';
import type { Reglas } from '../models/reglas';
import { reglasSchema, type ReglasFormValues } from '../schemas/reglas';
import { buildPayload, diffCambios, toFormValues } from '../utils/reglas';

/**
 * Borrador de B10: formulario RHF + Zod sobre lo publicado. Publicar valida, pide confirmacion (rige para toda la red)
 * y crea una version nueva; restaurar crea otra con el contenido de una anterior.
 */
export function useReglasEditor(data: Reglas, onSaved: () => void) {
  const t = useT();
  const form = useZodForm<ReglasFormValues>(reglasSchema, toFormValues(data));
  const [pending, setPending] = useState<ReglasFormValues | null>(null);
  const [busy, setBusy] = useState(false);

  const { reset } = form;
  useEffect(() => {
    reset(toFormValues(data));
  }, [data, reset]);

  const values = form.watch();
  const cambios = diffCambios(values, data);

  const descartar = useCallback(() => reset(toFormValues(data)), [reset, data]);

  /** Con el formulario ya validado por Zod, abre la confirmacion; no toca el backend. */
  const solicitarPublicar = useCallback((v: ReglasFormValues) => setPending(v), []);

  const publicar = useCallback(
    async (resumen: string) => {
      if (!pending) return;
      setBusy(true);
      const res = await guardarReglas(buildPayload(pending, data, resumen));
      setBusy(false);
      if (!res.ok) {
        notify.fromApiError(res);
        return;
      }
      setPending(null);
      notify.toast.success(t('niveles.toast.publicado'));
      onSaved();
    },
    [pending, data, onSaved, t],
  );

  const restaurar = useCallback(
    async (version: number) => {
      setBusy(true);
      const res = await restaurarVersion(version);
      setBusy(false);
      if (!res.ok) {
        notify.fromApiError(res);
        return false;
      }
      notify.toast.success(t('niveles.toast.restaurada', { v: version }));
      onSaved();
      return true;
    },
    [onSaved, t],
  );

  return { form, values, cambios, busy, pending, cancelarPublicar: () => setPending(null), solicitarPublicar, publicar, descartar, restaurar };
}
