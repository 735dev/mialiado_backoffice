// Formatos compartidos por todas las pantallas: dinero, numeros, fechas e iniciales de avatar.
// Un solo lugar para que «$9.240,00» y «8 oct, 9:41 a. m.» se vean igual en B02 que en B16.
import type { Lang } from '@/lib/i18n';

const locale = (lang: Lang | string): string => (lang === 'es' ? 'es-VE' : 'en-US');

/** Dinero en USD como el prototipo: `$9.240,00` en es y `$9,240.00` en en. Por defecto 2 decimales. */
export function formatMoney(value: number, lang: Lang | string, decimals = 2): string {
  const abs = new Intl.NumberFormat(locale(lang), { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(Math.abs(value));
  return `${value < 0 ? '-' : ''}$${abs}`;
}

/** Entero con separador de miles (`12.480` en es, `12,480` en en; el `es` generico no separa 4 cifras). */
export function formatInteger(value: number, lang: Lang | string): string {
  return new Intl.NumberFormat(locale(lang)).format(value);
}

/** Numero con hasta `digits` decimales (`4,2`). */
export function formatDecimal(value: number, lang: Lang | string, digits = 1): string {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: digits }).format(value);
}

const sinPunto = (s: string): string => s.replace(/\./g, '');

/** `8 oct` / `Oct 8`; sin fecha o con una fecha invalida devuelve `empty`. */
export function formatShortDate(iso: string | null | undefined, lang: Lang | string, empty = '–', timeZone?: string): string {
  if (!iso) return empty;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return empty;
  return sinPunto(new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', timeZone }).format(d));
}

/** `8 oct 2026` / `Oct 8, 2026`. */
export function formatDate(iso: string | null | undefined, lang: Lang | string, empty = '–', timeZone?: string): string {
  if (!iso) return empty;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return empty;
  return sinPunto(new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', year: 'numeric', timeZone }).format(d));
}

/** `2 oct, 8:42 a. m.` (es) / `Oct 2, 8:42 AM` (en); siempre am/pm. Si la fecha no se interpreta, devuelve `empty`. */
export function formatDateTime(iso: string | null | undefined, lang: Lang | string, empty = '–', timeZone?: string): string {
  if (!iso) return empty;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return empty;
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone }).format(d);
}

/** Iniciales de un nombre: primera letra del primer y del ultimo termino (o las dos primeras de un nombre solo). */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? '';
  const second = parts.length > 1 ? (parts[parts.length - 1] ?? '') : first.slice(1);
  return ((first[0] ?? '') + (second[0] ?? '')).toUpperCase();
}

const TONOS = ['bg-primary-tint text-primary-deep', 'bg-warn-tint text-warn', 'bg-err-tint text-err-deep', 'bg-surface-2 text-ink-soft'] as const;

/** Color estable por nombre o id (los avatares del prototipo usan una paleta de pasteles). */
export function avatarTone(seed: string | number): string {
  let h = 0;
  for (const ch of String(seed)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONOS[h % TONOS.length] as string;
}
