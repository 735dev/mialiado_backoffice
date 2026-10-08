import { useState } from 'react';
import { useZodForm } from '@/components/form/useZodForm';
import { useT } from '@/lib/hooks/useT';
import { applyServerErrors } from '@/lib/utils/applyServerErrors';
import { notify } from '@/lib/utils/notify';
import type { ModoEnvio, Plantilla } from '../models/notificacion';
import { crearNotificacion, enviarPrueba, estimarAlcance } from '../providers/notificacionesProvider';
import { borradorSchema, MENSAJE_MAX, notificacionSchema, TITULO_MAX, valoresIniciales, type NotificacionForm } from '../schemas/notificacionSchema';
import { aCuerpo } from '../utils/payload';

export type AccionEnCurso = 'send' | 'draft' | 'test' | null;

interface Args {
  /** Se llama tras crear, programar o guardar: recarga el historial. */
  onDone: () => void;
}

/** Formulario de B12: validacion Zod, confirmacion antes de enviar a todos y manejo de errores del servidor. */
export function useComposer({ onDone }: Args) {
  const t = useT();
  const methods = useZodForm(notificacionSchema, valoresIniciales);
  const [busy, setBusy] = useState<AccionEnCurso>(null);

  const ejecutar = async (v: NotificacionForm, modo: ModoEnvio) => {
    setBusy(modo === 'borrador' ? 'draft' : 'send');
    const res = await crearNotificacion(aCuerpo(v, modo));
    setBusy(null);
    if (!res.ok) {
      applyServerErrors(methods.setError, res);
      notify.fromApiError(res);
      return;
    }
    if (res.data.reprogramada) notify.warning(t('notificaciones.reprogramada'));
    else if (modo === 'borrador') notify.toast.success(t('notificaciones.toast.draft'));
    else if (modo === 'programar') notify.toast.success(t('notificaciones.toast.scheduled'));
    else notify.toast.success(t('notificaciones.toast.sent', { n: res.data.enviados }));
    methods.reset(valoresIniciales);
    onDone();
  };

  const onSubmit = async (v: NotificacionForm) => {
    if (v.cuando === 'programar') {
      await ejecutar(v, 'programar');
      return;
    }
    // El aviso dice a cuantas personas llega: se consulta el alcance justo antes de confirmar.
    const est = await estimarAlcance({ segmento: v.segmento, niveles: v.niveles, zonas: v.zonas });
    notify.confirm(t('notificaciones.confirmSend', { n: est.ok ? est.data.alcance : '—' }), () => void ejecutar(v, 'ahora'));
  };

  const guardarBorrador = () => {
    const r = borradorSchema.safeParse(methods.getValues());
    if (!r.success) {
      for (const issue of r.error.issues) methods.setError(issue.path[0] as keyof NotificacionForm, { message: issue.message });
      return;
    }
    void ejecutar(r.data, 'borrador');
  };

  const probar = async () => {
    if (!(await methods.trigger(['titulo', 'mensaje']))) return;
    const { titulo, mensaje } = methods.getValues();
    setBusy('test');
    const res = await enviarPrueba({ titulo: titulo.trim(), mensaje: mensaje.trim() });
    setBusy(null);
    if (res.ok) notify.toast.success(t('notificaciones.toast.test'));
    else notify.fromApiError(res);
  };

  const aplicarPlantilla = (p: Plantilla) => {
    methods.setValue('titulo', (p.titulo ?? p.nombre).slice(0, TITULO_MAX), { shouldValidate: true, shouldDirty: true });
    methods.setValue('mensaje', p.cuerpo.slice(0, MENSAJE_MAX), { shouldValidate: true, shouldDirty: true });
  };

  const nueva = () => {
    methods.reset(valoresIniciales);
    methods.setFocus('titulo');
  };

  return { methods, busy, onSubmit, guardarBorrador, probar, aplicarPlantilla, nueva };
}
