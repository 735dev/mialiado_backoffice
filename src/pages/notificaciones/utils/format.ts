const TZ = 'America/Caracas';

/** Español de Venezuela: «12.480» y decimal con coma. */
const loc = (lang: string): string => (lang === 'es' ? 'es-VE' : 'en-US');

export const fmtNumero = (n: number, lang: string): string => new Intl.NumberFormat(loc(lang)).format(n);

/** 3200 -> «3,2k»; por debajo de mil, el numero tal cual. */
export function fmtCompacto(n: number, lang: string): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toLocaleString(loc(lang), { maximumFractionDigits: 1 })}k`;
}

export function fmtFechaHora(iso: string | null, lang: string): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ }).format(new Date(iso));
}

export function fmtFechaLarga(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang, { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ }).format(date);
}

/** Fecha de hoy en Venezuela como YYYY-MM-DD (valor de <input type="date">). */
export function hoyCaracas(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: TZ }).format(now);
}
