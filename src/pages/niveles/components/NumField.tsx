import { useId } from 'react';
import { useFormContext } from 'react-hook-form';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { ReglasFormValues } from '../schemas/reglas';

type NumName = Exclude<keyof ReglasFormValues, 'moderacion_previa'>;

interface NumFieldProps {
  name: NumName;
  /** Texto accesible del campo (clave i18n o texto ya traducido). */
  label: string;
  unit?: string;
  prefix?: string;
  step?: string;
  disabled?: boolean;
  /** Valor publicado, solo si difiere del borrador (se muestra como "Publicado: ..."). */
  published?: string;
  className?: string;
}

/** Campo numerico compacto de B10 (RHF `register` con valueAsNumber; el error es una clave i18n de Zod). */
export function NumField({ name, label, unit, prefix, step = '1', disabled, published, className }: NumFieldProps) {
  const t = useT();
  const id = useId();
  const { register, formState } = useFormContext<ReglasFormValues>();
  const error = formState.errors[name]?.message;
  return (
    <div className={cn('flex flex-col items-end gap-1', className)}>
      <div
        className={cn(
          'flex h-11 w-36 items-center gap-1.5 rounded-field border-[1.5px] bg-bg px-3 focus-within:border-primary-deep',
          error ? 'border-err' : 'border-line-strong',
          disabled && 'opacity-60',
        )}
      >
        {prefix && <span className="text-sm font-semibold text-ink-muted">{prefix}</span>}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          disabled={disabled}
          aria-label={t(label)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-e` : undefined}
          className="h-full min-w-0 flex-1 border-0 bg-transparent text-right text-sm font-bold tabular-nums text-ink outline-none"
          {...register(name, { valueAsNumber: true })}
        />
        {unit && <span className="text-sm text-ink-muted">{unit}</span>}
      </div>
      {error && (
        <small id={`${id}-e`} role="alert" className="max-w-52 text-right text-xs font-medium text-err">
          {t(error)}
        </small>
      )}
      {published && !error && <small className="text-xs text-ink-muted">{published}</small>}
    </div>
  );
}
