import { z } from 'zod';
import { requiredText } from '@/lib/utils/schemas';

export const MOTIVOS = ['supera_maximo', 'fotos_invalidas', 'vigencia_incorrecta', 'se_acumula', 'contenido_enganoso', 'otro'] as const;
export const COMENTARIO_MAX = 300;

/** B17: motivo obligatorio; con "otro" el comentario tambien lo es (regla del backend). */
export const rechazoSchema = z
  .object({
    motivo: z.enum(MOTIVOS, { required_error: 'errors.required', invalid_type_error: 'errors.required' }),
    comentario: z.string().trim().max(COMENTARIO_MAX, `errors.maxLength|${COMENTARIO_MAX}`).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.motivo === 'otro' && !v.comentario) ctx.addIssue({ code: 'custom', path: ['comentario'], message: 'errors.required' });
  });
export type RechazoValues = z.infer<typeof rechazoSchema>;

/** Pedir cambios devuelve la promocion a borrador con este comentario para el comercio. */
export const cambiosSchema = z.object({ comentario: requiredText(3, COMENTARIO_MAX) });
export type CambiosValues = z.infer<typeof cambiosSchema>;
