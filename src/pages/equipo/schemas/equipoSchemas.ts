import { z } from 'zod';
import { ROLES } from '@/lib/constants/roles';
import { emailSchema, requiredText } from '@/lib/utils/schemas';

export const invitarSchema = z.object({
  correo: emailSchema,
  nombres: requiredText(1, 80),
  apellidos: requiredText(1, 80),
  rol: z.enum(ROLES, { errorMap: () => ({ message: 'errors.required' }) }),
});
export type InvitarForm = z.infer<typeof invitarSchema>;

export const editarSchema = z.object({
  rol: z.enum(ROLES),
  estado: z.enum(['A', 'S']),
});
export type EditarForm = z.infer<typeof editarSchema>;
