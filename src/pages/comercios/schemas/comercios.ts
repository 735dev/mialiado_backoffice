import { z } from 'zod';
import { emailSchema, requiredText } from '@/lib/utils/schemas';

/** Motivos de rechazo de B17 (la clave i18n es `comercios.rechazo.motivos.<clave>`). */
export const MOTIVOS_RECHAZO = ['rif', 'documentos', 'fachada', 'direccion', 'incompleto', 'otro'] as const;
export type MotivoRechazo = (typeof MOTIVOS_RECHAZO)[number];

/** Texto que recibe el backend (y el dueno por correo): siempre en espanol. */
export const MOTIVO_TEXTO: Record<MotivoRechazo, string> = {
  rif: 'RIF no válido o no coincide',
  documentos: 'Documentos ilegibles o vencidos',
  fachada: 'La foto de fachada no coincide',
  direccion: 'No se pudo confirmar la dirección',
  incompleto: 'Información incompleta o inconsistente',
  otro: 'Otro motivo',
};

export const COMENTARIO_MAX = 300;

export const rechazoSchema = z
  .object({
    motivo: z.enum(MOTIVOS_RECHAZO, { required_error: 'comercios.rechazo.errorMotivo', invalid_type_error: 'comercios.rechazo.errorMotivo' }),
    comentario: z.string().trim().max(COMENTARIO_MAX, `errors.maxLength|${COMENTARIO_MAX}`).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.motivo === 'otro' && !v.comentario) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['comentario'], message: 'comercios.rechazo.errorOtro' });
    }
  });
export type RechazoValues = z.infer<typeof rechazoSchema>;

export const editarSchema = z.object({
  nombre: requiredText(2, 120),
  razon_social: z.string().trim().max(160, 'errors.maxLength|160').optional(),
  direccion: z.string().trim().max(200, 'errors.maxLength|200').optional(),
  zona: z.string().trim().max(80, 'errors.maxLength|80').optional(),
  ciudad: z.string().trim().max(80, 'errors.maxLength|80').optional(),
  categoria_id: z.coerce.number().int().positive().optional().or(z.literal('')),
  whatsapp: z.string().trim().max(30, 'errors.maxLength|30').optional(),
  correo_contacto: z.union([z.literal(''), emailSchema]).optional(),
});
export type EditarValues = z.infer<typeof editarSchema>;

export const MOTIVO_SUSPENSION_MAX = 300;
export const suspenderSchema = z.object({ motivo: requiredText(3, MOTIVO_SUSPENSION_MAX) });
export type SuspenderValues = z.infer<typeof suspenderSchema>;

export const invitarSchema = z.object({
  correo: emailSchema,
  nombre: z.string().trim().max(120, 'errors.maxLength|120').optional(),
});
export type InvitarValues = z.infer<typeof invitarSchema>;
