import { useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Input, Textarea } from '@/components/ui/Input';
import { useT } from '@/lib/hooks/useT';
import type { NotificacionForm } from '../schemas/notificacionSchema';

interface CampoContadorProps {
  name: 'titulo' | 'mensaje';
  label: string;
  max: number;
  multiline?: boolean;
  disabled?: boolean;
}

/** Campo de texto con contador «20 / 40» como el del prototipo; no deja escribir de mas. */
export function CampoContador({ name, label, max, multiline, disabled }: CampoContadorProps) {
  const t = useT();
  const id = useId();
  const { control } = useFormContext<NotificacionForm>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const error = fieldState.error?.message;
        const props = {
          ...field,
          id,
          maxLength: max,
          disabled,
          hasError: Boolean(error),
          'aria-describedby': error ? `${id}-error` : undefined,
        };
        return (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor={id} className="text-sm font-semibold text-ink-soft">
                {label}
              </label>
              <span className="font-mono text-xs font-medium text-ink-muted" aria-live="polite">
                {field.value.length} / {max}
              </span>
            </div>
            {multiline ? <Textarea {...props} rows={3} className="min-h-24" /> : <Input {...props} />}
            {error && (
              <small id={`${id}-error`} role="alert" className="text-sm font-medium text-err">
                {t(error)}
              </small>
            )}
          </div>
        );
      }}
    />
  );
}
