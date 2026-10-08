import { z } from 'zod';
import { emailSchema } from '@/lib/utils/schemas';

// Los mensajes son claves i18n (errors.*): FormInput las traduce con useT.
export const credentialsSchema = z.object({
  correo: emailSchema,
  password: z.string({ required_error: 'errors.required' }).min(1, 'errors.required'),
});
export type CredentialsValues = z.infer<typeof credentialsSchema>;

/** Codigo TOTP: 6 digitos; se toleran espacios (las apps lo muestran como "482 913"). */
export const codeSchema = z.object({
  codigo: z
    .string({ required_error: 'errors.required' })
    .transform((v) => v.replace(/\s/g, ''))
    .pipe(z.string().min(1, 'errors.required').regex(/^\d{6}$/, 'errors.code6')),
});
export type CodeValues = z.infer<typeof codeSchema>;
