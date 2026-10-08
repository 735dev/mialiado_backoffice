import { Info } from 'lucide-react';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/FormTextarea';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import { COMENTARIO_MAX, MOTIVOS_RECHAZO, MOTIVO_TEXTO, rechazoSchema, type RechazoValues } from '../schemas/comercios';
import { Modal } from '@/components/ui/Modal';

interface Props {
  open: boolean;
  /** "Nombre · RIF" del comercio. */
  objeto: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (body: { motivo: string; comentario?: string }) => void | Promise<unknown>;
}

/** B17 · Rechazar con motivo (adaptado a comercios): motivo obligatorio + comentario para el dueno. */
export function RechazarModal({ open, objeto, busy, onClose, onSubmit }: Props) {
  const t = useT();
  const methods = useZodForm<RechazoValues>(rechazoSchema, { comentario: '' });
  const comentario = methods.watch('comentario') ?? '';

  const close = () => {
    methods.reset({ comentario: '' });
    onClose();
  };

  const submit = (v: RechazoValues) => onSubmit({ motivo: MOTIVO_TEXTO[v.motivo], comentario: v.comentario || undefined });

  return (
    <Modal open={open} onClose={close} title={t('comercios.rechazo.title')} description={objeto}>
      <Form methods={methods} onSubmit={submit}>
        <Controller
          control={methods.control}
          name="motivo"
          render={({ field, fieldState }) => (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold text-ink-soft">{t('comercios.rechazo.motivo')}</legend>
              {MOTIVOS_RECHAZO.map((m) => {
                const checked = field.value === m;
                return (
                  <label
                    key={m}
                    className={cn(
                      'flex min-h-12 cursor-pointer items-center gap-3 rounded-field px-4 text-sm font-medium ring-1 ring-inset',
                      checked ? 'bg-err-tint text-err-deep ring-err' : 'bg-surface text-ink ring-line-strong',
                    )}
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={m}
                      checked={checked}
                      onChange={() => field.onChange(m)}
                      onBlur={field.onBlur}
                      className="h-4 w-4 accent-[var(--err)]"
                    />
                    {t(`comercios.rechazo.motivos.${m}`)}
                  </label>
                );
              })}
              {fieldState.error && (
                <small role="alert" className="text-sm font-medium text-err">
                  {t(fieldState.error.message ?? 'errors.invalid')}
                </small>
              )}
            </fieldset>
          )}
        />

        <div>
          <FormTextarea<RechazoValues> name="comentario" label="comercios.rechazo.comentario" placeholder="comercios.rechazo.comentarioPlaceholder" rows={4} />
          <p className="mt-1 text-right text-xs text-ink-muted" aria-live="polite">
            {comentario.length} / {COMENTARIO_MAX}
          </p>
        </div>

        <p className="flex items-start gap-2 text-sm text-ink-muted">
          <Info size={16} aria-hidden="true" className="mt-0.5 flex-none" />
          {t('comercios.rechazo.aviso')}
        </p>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" size="md" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="danger" size="md" isLoading={busy}>
            {t('comercios.rechazo.confirmar')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
