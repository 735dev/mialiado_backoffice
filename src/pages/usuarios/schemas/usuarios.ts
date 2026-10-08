import { z } from 'zod';
import { requiredText } from '@/lib/utils/schemas';

export const MOTIVOS_BLOQUEO = ['abuso_cupones', 'cuenta_duplicada', 'fraude', 'otro'] as const;

/** Motivo del bloqueo: una opcion fija o "otro" con texto libre (obligatorio solo en ese caso). */
export const bloqueoSchema = z
  .object({
    motivo: z.enum(MOTIVOS_BLOQUEO, { required_error: 'errors.required', invalid_type_error: 'errors.required' }),
    detalle: z.string().trim().max(200, 'errors.maxLength|200').optional(),
  })
  .superRefine((v, ctx) => {
    if (v.motivo === 'otro' && !v.detalle) ctx.addIssue({ code: 'custom', path: ['detalle'], message: 'errors.required' });
  });
export type BloqueoValues = z.infer<typeof bloqueoSchema>;

export const NIVELES_AJUSTE = ['auto', 'aliado', 'aliadopro', 'aliadoplus'] as const;

export const nivelSchema = z.object({
  nivel: z.enum(NIVELES_AJUSTE),
  motivo: requiredText(3, 200),
});
export type NivelValues = z.infer<typeof nivelSchema>;

export const mensajeSchema = z.object({
  titulo: requiredText(1, 40),
  mensaje: requiredText(1, 120),
});
export type MensajeValues = z.infer<typeof mensajeSchema>;
