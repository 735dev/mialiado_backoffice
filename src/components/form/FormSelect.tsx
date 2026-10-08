import { useId } from 'react';
import { Controller, useFormContext, type FieldValues, type Path } from 'react-hook-form';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Input';
import { useT } from '@/lib/hooks/useT';

export interface SelectOption {
  value: string | number;
  /** Clave i18n o texto. */
  label: string;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  hint?: string;
  /** Convierte el valor a numero (ids numericos). */
  asNumber?: boolean;
  className?: string;
}

export function FormSelect<T extends FieldValues>({ name, options, label, placeholder, hint, asNumber, className }: FormSelectProps<T>) {
  const { control } = useFormContext<T>();
  const t = useT();
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field
          id={id}
          label={label ? t(label) : undefined}
          hint={hint ? t(hint) : undefined}
          error={fieldState.error ? t(fieldState.error.message ?? 'errors.invalid') : undefined}
          className={className}
        >
          <Select
            id={id}
            name={field.name}
            ref={field.ref}
            onBlur={field.onBlur}
            value={field.value ?? ''}
            onChange={(e) => field.onChange(asNumber && e.target.value !== '' ? Number(e.target.value) : e.target.value)}
            hasError={Boolean(fieldState.error)}
          >
            {placeholder && <option value="">{t(placeholder)}</option>}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.label)}
              </option>
            ))}
          </Select>
        </Field>
      )}
    />
  );
}
