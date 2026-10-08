import { z } from 'zod';
import { requiredText } from '@/lib/utils/schemas';
import { NIVELES, SEGMENTOS } from '../models/notificacion';
import { aIsoCaracas, enHorarioSilencioso } from '../utils/horario';

export const TITULO_MAX = 40;
export const MENSAJE_MAX = 120;

const base = z.object({
  segmento: z.enum(SEGMENTOS),
  niveles: z.array(z.enum(NIVELES)),
  zonas: z.array(z.string()),
  titulo: requiredText(1, TITULO_MAX),
  mensaje: requiredText(1, MENSAJE_MAX),
  cuando: z.enum(['ahora', 'programar']),
  fecha: z.string(),
  hora: z.string(),
});

type Base = z.infer<typeof base>;

function validarSegmento(v: Base, ctx: z.RefinementCtx): void {
  if (v.segmento === 'nivel' && v.niveles.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['niveles'], message: 'notificaciones.errors.elegirNivel' });
  }
  if (v.segmento === 'zona' && v.zonas.length === 0) {
    ctx.addIssue({ code: 'custom', path: ['zonas'], message: 'notificaciones.errors.elegirZona' });
  }
}

function validarProgramacion(v: Base, ctx: z.RefinementCtx, now: Date): void {
  if (v.cuando !== 'programar') return;
  if (!v.fecha) ctx.addIssue({ code: 'custom', path: ['fecha'], message: 'errors.required' });
  if (!v.hora) ctx.addIssue({ code: 'custom', path: ['hora'], message: 'errors.required' });
  if (!v.fecha || !v.hora) return;
  if (enHorarioSilencioso(v.hora)) {
    ctx.addIssue({ code: 'custom', path: ['hora'], message: 'notificaciones.errors.silencio' });
    return;
  }
  if (new Date(aIsoCaracas(v.fecha, v.hora)).getTime() <= now.getTime()) {
    ctx.addIssue({ code: 'custom', path: ['fecha'], message: 'notificaciones.errors.pasado' });
  }
}

/** Para guardar un borrador no se exige una programacion valida. */
export const borradorSchema = base.superRefine(validarSegmento);

/** Para enviar o programar: ademas, la fecha debe ser futura y fuera del horario silencioso (10 pm a 7 am). */
export const notificacionSchema = base.superRefine((v, ctx) => {
  validarSegmento(v, ctx);
  validarProgramacion(v, ctx, new Date());
});

export type NotificacionForm = z.infer<typeof notificacionSchema>;

export const valoresIniciales: NotificacionForm = {
  segmento: 'todos',
  niveles: [],
  zonas: [],
  titulo: '',
  mensaje: '',
  cuando: 'ahora',
  fecha: '',
  hora: '10:00',
};

export const plantillaSchema = z.object({
  nombre: requiredText(1, 80),
});
export type PlantillaForm = z.infer<typeof plantillaSchema>;
