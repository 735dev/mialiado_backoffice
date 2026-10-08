import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface FieldProps {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/** Etiqueta (600 14/20) + control + mensaje de error o ayuda. */
export function Field({ id, label, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-ink-soft">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <small id={`${id}-error`} role="alert" className="text-sm font-medium text-err">
          {error}
        </small>
      ) : (
        hint && (
          <small id={`${id}-hint`} className="text-sm text-ink-muted">
            {hint}
          </small>
        )
      )}
    </div>
  );
}
