const TZ = 'America/Caracas';

/** Español de Venezuela: «3.912» (el «es» generico no separa los miles de 4 cifras) y decimal con coma. */
const loc = (lang: string): string => (lang === 'es' ? 'es-VE' : 'en-US');

export const fmtNumero = (n: number, lang: string): string => new Intl.NumberFormat(loc(lang)).format(n);

/** 1.4 MB, 38 KB. */
export function fmtBytes(bytes: number | null, lang: string): string {
  if (bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toLocaleString(loc(lang), { maximumFractionDigits: 1 })} MB`;
}

export function fmtFechaHora(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: TZ }).format(new Date(iso));
}

/** «8:00 am» a partir de «08:00». */
export function fmtHora(hora: string, lang: string): string {
  const [h = 0, m = 0] = hora.split(':').map(Number);
  return new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}

/** Dia de la semana con 0 = lunes (como el backend). */
export function nombreDia(dia: number, lang: string): string {
  return new Intl.DateTimeFormat(lang, { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 1 + dia)));
}

/** Hoy en Venezuela como YYYY-MM-DD. */
export function hoyCaracas(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ }).format(now);
}

const iso = (d: Date): string => d.toISOString().slice(0, 10);
const desdeIso = (s: string): Date => new Date(`${s}T00:00:00Z`);

export type RangoRapido = 'ultimos7' | 'esteMes' | 'mesAnterior' | 'ultimos90';

/** Rangos del prototipo («Ultimos 7 dias», «Este mes»...) a partir de la fecha de hoy (YYYY-MM-DD). */
export function rangoRapido(tipo: RangoRapido, hoy: string): { desde: string; hasta: string } {
  const h = desdeIso(hoy);
  const dia = (d: Date, delta: number) => new Date(d.getTime() + delta * 86_400_000);
  switch (tipo) {
    case 'ultimos7':
      return { desde: iso(dia(h, -6)), hasta: hoy };
    case 'ultimos90':
      return { desde: iso(dia(h, -89)), hasta: hoy };
    case 'esteMes':
      return { desde: iso(new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth(), 1))), hasta: hoy };
    case 'mesAnterior':
      return {
        desde: iso(new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth() - 1, 1))),
        hasta: iso(new Date(Date.UTC(h.getUTCFullYear(), h.getUTCMonth(), 0))),
      };
  }
}

/** Fecha escrita en hora de Venezuela -> ISO con offset (inicio o fin del dia). */
export const inicioDia = (fecha: string): string => `${fecha}T00:00:00-04:00`;
export const finDia = (fecha: string): string => `${fecha}T23:59:59-04:00`;
