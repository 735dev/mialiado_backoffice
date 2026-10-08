/** Venezuela no tiene horario de verano: UTC-4 todo el año. */
const OFFSET = '-04:00';

export const SILENCIO_DESDE = 22;
export const SILENCIO_HASTA = 7;

/** «HH:mm» cae entre las 10:00 pm y las 7:00 am (no se envian push en esa franja). */
export function enHorarioSilencioso(hora: string): boolean {
  const h = Number(hora.slice(0, 2));
  if (Number.isNaN(h)) return false;
  return h >= SILENCIO_DESDE || h < SILENCIO_HASTA;
}

/** Hora actual en Venezuela como «HH:mm». */
export function horaActualCaracas(now = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Caracas' }).format(now);
}

/** Fecha y hora escritas en hora de Venezuela -> ISO con offset (lo que espera `programada_para`). */
export function aIsoCaracas(fecha: string, hora: string): string {
  return `${fecha}T${hora}:00${OFFSET}`;
}
