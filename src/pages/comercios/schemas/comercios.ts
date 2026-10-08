import { z } from 'zod';
import { emailSchema } from '@/lib/utils/schemas';

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

export const invitarSchema = z.object({
  correo: emailSchema,
  nombre: z.string().trim().max(120, 'errors.maxLength|120').optional(),
});
export type InvitarValues = z.infer<typeof invitarSchema>;
