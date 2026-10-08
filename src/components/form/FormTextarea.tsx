import { useId } from 'react';
import { Controller, useFormContext, type FieldValues, type Path } from 'react-hook-form';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Input';
import { useT } from '@/lib/hooks/useT';

interface FormTextareaProps<T extends FieldValues> {
  name: Path<T>;
  label?: string;
  placeholder?: string;
  hint?: string;
  rows?: number;
  className?: string;
}

export function FormTextarea<T extends FieldValues>({ name, label, placeholder, hint, rows = 4, className }: FormTextareaProps<T>) {
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
          <Textarea
            {...field}
            id={id}
            rows={rows}
            value={field.value ?? ''}
            placeholder={placeholder ? t(placeholder) : undefined}
            hasError={Boolean(fieldState.error)}
          />
        </Field>
      )}
    />
  );
}
