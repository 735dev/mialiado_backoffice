import type { FormHTMLAttributes, ReactNode } from 'react';
import { FormProvider, type FieldValues, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils/cn';

interface FormProps<T extends FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  methods: UseFormReturn<T>;
  onSubmit: SubmitHandler<T>;
  children: ReactNode;
}

/**
 * FormProvider + <form noValidate>: la validacion la hace Zod, no el navegador
 * (si no, `type="email"` bloquea el envio y los mensajes traducidos nunca aparecen).
 */
export function Form<T extends FieldValues>({ methods, onSubmit, className, children, ...rest }: FormProps<T>) {
  return (
    <FormProvider {...methods}>
      <form noValidate onSubmit={methods.handleSubmit(onSubmit)} className={cn('flex flex-col gap-5', className)} {...rest}>
        {children}
      </form>
    </FormProvider>
  );
}
