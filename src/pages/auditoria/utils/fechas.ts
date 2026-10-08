export type RangoPreset = 'hoy' | 'ultimos7' | 'ultimos30' | 'ultimos90' | 'personalizado';

const TZ = 'America/Caracas';

/** Hoy en Venezuela como YYYY-MM-DD. */
export function hoyCaracas(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ }).format(now);
}

const DIAS: Record<Exclude<RangoPreset, 'personalizado'>, number> = { hoy: 0, ultimos7: 6, ultimos30: 29, ultimos90: 89 };

/** Primer dia (YYYY-MM-DD) de un rango rapido que termina hoy. */
export function rangoDesde(rango: Exclude<RangoPreset, 'personalizado'>, hoy: string): string {
  const d = new Date(`${hoy}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - DIAS[rango]);
  return d.toISOString().slice(0, 10);
}

/** Fecha escrita en hora de Venezuela (UTC-4 todo el año) -> ISO con offset. */
export const inicioDia = (fecha: string): string => `${fecha}T00:00:00-04:00`;
export const finDia = (fecha: string): string => `${fecha}T23:59:59-04:00`;
