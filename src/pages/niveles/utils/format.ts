import type { Lang } from '@/lib/i18n';

const locale = (lang: Lang) => (lang === 'es' ? 'es-AR' : 'en-US');

/** Dinero en USD como el prototipo: `$8,00` en es y `$8.00` en en. Siempre 2 decimales. */
export function formatMoney(value: number, lang: Lang): string {
  const abs = new Intl.NumberFormat(locale(lang), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value));
  return `${value < 0 ? '-' : ''}$${abs}`;
}

/** Enteros con separador de miles (`8.900`); para el conteo de usuarios por nivel. */
export function formatCount(value: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang)).format(value);
}

/** `24 sep, 9:12 a. m.` segun idioma. Si no se puede interpretar la fecha, la devuelve tal cual. */
export function formatFecha(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(d);
}
