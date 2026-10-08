import { Bell, X } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { MotivoRechazo, PromoDetalle } from '@/providers/promocionesProvider';
import { COMENTARIO_MAX, MOTIVOS, rechazoSchema, type RechazoValues } from '../schemas/moderacion';
import { Modal } from './Modal';

interface Props {
  promo: PromoDetalle;
  open: boolean;
  onClose: () => void;
  onSubmit: (motivo: MotivoRechazo, comentario: string | undefined) => Promise<boolean>;
}

/** B17 Rechazar con motivo: lista de motivos (radio), comentario opcional (obligatorio con "Otro") y aviso de notificacion. */
export function RechazarModal({ promo, open, onClose, onSubmit }: Props) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const methods = useZodForm<RechazoValues>(rechazoSchema, { motivo: undefined, comentario: '' });
  const { control, watch } = methods;
  const comentario = watch('comentario') ?? '';
  // El backend entrega el texto de cada motivo (incluye el tope vigente); si falta, se usa el de i18n.
  const textoDe = (codigo: MotivoRechazo) => promo.motivos_rechazo.find((m) => m.codigo === codigo)?.texto ?? t(`promociones.rechazo.motivos.${codigo}`);

  const submit = async (v: RechazoValues) => {
    setBusy(true);
    const ok = await onSubmit(v.motivo, v.comentario || undefined);
    setBusy(false);
    if (ok) {
      methods.reset();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('promociones.rechazo.titulo')} subtitle={`${promo.titulo} · ${promo.comercio.nombre}`} icon={<X size={22} />}>
      <Form methods={methods} onSubmit={submit} className="gap-4">
        <Controller
          control={control}
          name="motivo"
          render={({ field, fieldState }) => (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold text-ink-soft">{t('promociones.rechazo.motivo')}</legend>
              {MOTIVOS.map((m) => (
                <label
                  key={m}
                  className={cn(
                    'flex h-12 cursor-pointer items-center gap-3 rounded-pill border-[1.5px] px-4 text-sm font-medium',
                    field.value === m ? 'border-transparent bg-primary-tint text-ink' : 'border-line-strong bg-surface',
                  )}
                >
                  <input type="radio" name={field.name} value={m} checked={field.value === m} onChange={() => field.onChange(m)} onBlur={field.onBlur} className="h-5 w-5 accent-[var(--primary-deep)]" />
                  {textoDe(m)}
                </label>
              ))}
              {fieldState.error && (
                <small role="alert" className="text-sm font-medium text-err">
                  {t(fieldState.error.message ?? 'errors.required')}
                </small>
              )}
            </fieldset>
          )}
        />

        <Controller
          control={control}
          name="comentario"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-2">
              <label htmlFor="rechazo-comentario" className="text-sm font-semibold text-ink-soft">
                {t('promociones.rechazo.comentario')} <span className="font-normal text-ink-muted">{t('promociones.rechazo.opcional')}</span>
              </label>
              <Textarea
                id="rechazo-comentario"
                {...field}
                value={field.value ?? ''}
                rows={3}
                maxLength={COMENTARIO_MAX}
                placeholder={t('promociones.rechazo.comentarioEjemplo')}
                hasError={Boolean(fieldState.error)}
                className="min-h-24"
              />
              <div className="flex justify-between gap-3 text-sm">
                <span role={fieldState.error ? 'alert' : undefined} className="font-medium text-err">
                  {fieldState.error ? t(fieldState.error.message ?? 'errors.invalid') : ''}
                </span>
                <span className="text-xs text-ink-muted">{comentario.length} / {COMENTARIO_MAX}</span>
              </div>
            </div>
          )}
        />

        <p className="flex items-start gap-3 rounded-field bg-primary-tint p-4 text-sm text-primary-deep">
          <Bell size={18} className="mt-0.5 flex-none" aria-hidden="true" />
          {t('promociones.rechazo.aviso')}
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="danger" size="md" isLoading={busy}>
            <X size={16} aria-hidden="true" />
            {t('promociones.rechazo.confirmar')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
