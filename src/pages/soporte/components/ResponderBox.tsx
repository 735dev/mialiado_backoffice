import { CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';
import { applyServerErrors } from '@/lib/utils/applyServerErrors';
import { cn } from '@/lib/utils/cn';
import { notify } from '@/lib/utils/notify';
import type { PlantillaRespuesta, TicketDetalle } from '../models/ticket';
import { actualizarTicket, responderTicket } from '../providers/soporteProvider';
import { RESPUESTA_MAX, respuestaSchema, type RespuestaForm } from '../schemas/soporteSchemas';
import { Segmented } from '@/components/ui/Segmented';

interface ResponderBoxProps {
  ticket: TicketDetalle;
  plantillas: PlantillaRespuesta[];
  /** Texto elegido en el modal de plantillas; `n` cambia aunque se repita el texto. */
  insertar: { texto: string; n: number } | null;
  onChanged: () => void;
}

/** Responder al solicitante o dejar una nota interna; «Resolver y cerrar» / «Reabrir» cambian el estado. */
export function ResponderBox({ ticket, plantillas, insertar, onChanged }: ResponderBoxProps) {
  const t = useT();
  const id = useId();
  const methods = useZodForm<RespuestaForm>(respuestaSchema, { tipo: 'mensaje', cuerpo: '' });
  const [busy, setBusy] = useState<'send' | 'state' | null>(null);
  const tipo = methods.watch('tipo');
  const cuerpo = methods.watch('cuerpo');
  const resuelto = ticket.estado === 'resuelto';

  useEffect(() => {
    if (insertar) methods.setValue('cuerpo', insertar.texto.slice(0, RESPUESTA_MAX), { shouldValidate: true, shouldDirty: true });
  }, [insertar, methods]);

  const enviar = async (v: RespuestaForm): Promise<boolean> => {
    const res = await responderTicket(ticket.id, { cuerpo: v.cuerpo.trim(), tipo: v.tipo });
    if (!res.ok) {
      applyServerErrors(methods.setError, res);
      notify.fromApiError(res);
      return false;
    }
    methods.reset({ tipo: v.tipo, cuerpo: '' });
    notify.toast.success(t(v.tipo === 'nota' ? 'soporte.reply.noteSaved' : 'soporte.reply.sent'));
    return true;
  };

  const onSubmit = async (v: RespuestaForm) => {
    setBusy('send');
    if (await enviar(v)) onChanged();
    setBusy(null);
  };

  const cambiarEstado = async () => {
    // Si hay texto escrito se envia antes de cerrar, para que la persona reciba la respuesta final.
    if (!resuelto && cuerpo.trim() !== '') {
      if (!(await methods.trigger())) return;
      setBusy('state');
      if (!(await enviar(methods.getValues()))) {
        setBusy(null);
        return;
      }
    }
    setBusy('state');
    const res = await actualizarTicket(ticket.id, { estado: resuelto ? 'abierto' : 'resuelto' });
    setBusy(null);
    if (res.ok) {
      notify.toast.success(t(resuelto ? 'soporte.reply.reopened' : 'soporte.reply.resolved'));
      onChanged();
    } else notify.fromApiError(res);
  };

  const error = methods.formState.errors.cuerpo?.message;

  return (
    <Form methods={methods} onSubmit={onSubmit} className="gap-3 border-t border-line px-4 py-5 md:px-7" aria-label={t('soporte.reply.aria')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Controller
          control={methods.control}
          name="tipo"
          render={({ field }) => (
            <Segmented
              label={t('soporte.reply.mode')}
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'mensaje', label: t('soporte.reply.reply') },
                { value: 'nota', label: t('soporte.reply.note') },
              ]}
            />
          )}
        />
        {plantillas.length > 0 && <span className="text-xs font-medium text-ink-muted">{t('soporte.reply.quick')}</span>}
      </div>
      {plantillas.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {plantillas.slice(0, 4).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => methods.setValue('cuerpo', p.cuerpo.slice(0, RESPUESTA_MAX), { shouldValidate: true, shouldDirty: true })}
              className="inline-flex h-11 md:h-9 items-center rounded-pill bg-surface-2 px-4 text-sm font-semibold text-ink-soft hover:bg-primary-tint hover:text-primary-deep"
            >
              {p.nombre}
            </button>
          ))}
        </div>
      )}
      <div
        className={cn(
          'rounded-[20px] border-[1.5px] bg-surface px-4 py-3 focus-within:border-primary-deep focus-within:ring-1 focus-within:ring-primary-deep',
          error ? 'border-err ring-1 ring-err' : tipo === 'nota' ? 'border-warn bg-warn-tint' : 'border-line-strong',
        )}
      >
        <label htmlFor={id} className="sr-only">
          {t(tipo === 'nota' ? 'soporte.reply.noteLabel' : 'soporte.reply.label', { nombre: ticket.solicitante.nombre })}
        </label>
        <textarea
          id={id}
          rows={3}
          maxLength={RESPUESTA_MAX}
          aria-invalid={error ? true : undefined}
          placeholder={t(tipo === 'nota' ? 'soporte.reply.notePlaceholder' : 'soporte.reply.placeholder', { nombre: ticket.solicitante.nombre })}
          className="w-full resize-none border-0 bg-transparent text-[15px] leading-6 text-ink outline-none placeholder:text-ink-muted"
          {...methods.register('cuerpo')}
        />
        <div className="flex justify-end">
          <span className="font-mono text-xs text-ink-muted">
            {cuerpo.length} / {RESPUESTA_MAX}
          </span>
        </div>
      </div>
      {error && (
        <small role="alert" className="text-sm font-medium text-err">
          {t(error)}
        </small>
      )}
      <div className="flex flex-wrap justify-end gap-3">
        <Button type="button" variant="secondary" size="md" onClick={() => void cambiarEstado()} isLoading={busy === 'state'} disabled={busy !== null}>
          {resuelto ? <RotateCcw size={16} aria-hidden="true" /> : <CheckCircle2 size={16} aria-hidden="true" />}
          {t(resuelto ? 'soporte.reply.reopen' : 'soporte.reply.resolve')}
        </Button>
        <Button type="submit" isLoading={busy === 'send'} disabled={busy !== null}>
          <Send size={16} aria-hidden="true" />
          {t(tipo === 'nota' ? 'soporte.reply.saveNote' : 'soporte.reply.send')}
        </Button>
      </div>
    </Form>
  );
}
