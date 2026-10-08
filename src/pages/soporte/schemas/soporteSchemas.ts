import { z } from 'zod';
import { requiredText } from '@/lib/utils/schemas';
import { PRIORIDADES } from '../models/ticket';

export const RESPUESTA_MAX = 2000;

export const respuestaSchema = z.object({
  tipo: z.enum(['mensaje', 'nota']),
  cuerpo: requiredText(1, RESPUESTA_MAX),
});
export type RespuestaForm = z.infer<typeof respuestaSchema>;

export const nuevoTicketSchema = z.object({
  usuario_id: z.number({ required_error: 'soporte.errors.elegirPersona', invalid_type_error: 'soporte.errors.elegirPersona' }),
  asunto: requiredText(3, 200),
  mensaje: requiredText(3, RESPUESTA_MAX),
  prioridad: z.enum(PRIORIDADES),
});
export type NuevoTicketForm = z.infer<typeof nuevoTicketSchema>;
