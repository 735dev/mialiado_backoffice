import type { ModoEnvio, NuevaNotificacion } from '../models/notificacion';
import type { NotificacionForm } from '../schemas/notificacionSchema';
import { aIsoCaracas } from './horario';

/** Cuerpo de POST /notificaciones a partir del formulario (la hora se interpreta en Venezuela). */
export function aCuerpo(v: NotificacionForm, modo: ModoEnvio): NuevaNotificacion {
  return {
    titulo: v.titulo.trim(),
    mensaje: v.mensaje.trim(),
    segmento: v.segmento,
    niveles: v.segmento === 'nivel' ? v.niveles : undefined,
    zonas: v.segmento === 'zona' ? v.zonas : undefined,
    modo,
    programada_para: modo === 'programar' ? aIsoCaracas(v.fecha, v.hora) : undefined,
  };
}
