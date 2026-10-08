import { useId, type HTMLInputTypeAttribute, type ReactNode } from 'react';
import { Controller, useFormContext, type FieldValues, type Path } from 'react-hook-form';
import { Input, PasswordInput } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { useT } from '@/lib/hooks/useT';

interface BaseProps<T extends FieldValues> {
  name: Path<T>;
  /** Clave i18n (o texto) de la etiqueta. */
  label?: string;
  placeholder?: string;
  hint?: string;
  className?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'decimal' | 'search' | 'url';
  disabled?: boolean;
}

interface FormInputProps<T extends FieldValues> extends BaseProps<T> {
  type?: HTMLInputTypeAttribute;
  prefix?: ReactNode;
}

export function FormInput<T extends FieldValues>({
  name,
  label,
  type = 'text',
  placeholder,
  hint,
  className,
  prefix,
  ...rest
}: FormInputProps<T>) {
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
          <Input
            {...field}
            {...rest}
            id={id}
            type={type}
            prefix={prefix}
            value={field.value ?? ''}
            placeholder={placeholder ? t(placeholder) : undefined}
            hasError={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${id}-error` : undefined}
          />
        </Field>
      )}
    />
  );
}

export function FormPassword<T extends FieldValues>({ name, label, placeholder, hint, className, ...rest }: BaseProps<T>) {
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
          <PasswordInput
            {...field}
            {...rest}
            id={id}
            value={field.value ?? ''}
            placeholder={placeholder ? t(placeholder) : undefined}
            showLabel={t('common.showPassword')}
            hideLabel={t('common.hidePassword')}
            hasError={Boolean(fieldState.error)}
            aria-describedby={fieldState.error ? `${id}-error` : undefined}
          />
        </Field>
      )}
    />
  );
}
