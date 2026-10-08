import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import type { ApiError } from '@/lib/api/types';

export function applyServerErrors<T extends FieldValues>(setError: UseFormSetError<T>, err: ApiError): void {
  if (!err.fieldErrors) return;
  Object.entries(err.fieldErrors).forEach(([field, message]) => {
    setError(field as Path<T>, { type: 'server', message });
  });
}
