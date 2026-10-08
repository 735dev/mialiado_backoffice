import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type DefaultValues, type FieldValues, type UseFormProps } from 'react-hook-form';
import type { ZodType, ZodTypeDef } from 'zod';

/**
 * Formulario estandar: RHF + zodResolver. Los mensajes del esquema son claves i18n ('errors.required',
 * 'errors.minLength|3') que FormInput traduce con useT. Envuelve el <form> en <FormProvider {...methods}>.
 */
export function useZodForm<T extends FieldValues>(
  schema: ZodType<T, ZodTypeDef, unknown>,
  defaultValues?: DefaultValues<T>,
  options?: Omit<UseFormProps<T>, 'resolver' | 'defaultValues'>,
) {
  return useForm<T>({
    // zodResolver infiere el tipo de entrada del esquema; el generico de salida es T.
    resolver: zodResolver(schema as never) as UseFormProps<T>['resolver'],
    defaultValues,
    mode: 'onTouched',
    ...options,
  });
}
