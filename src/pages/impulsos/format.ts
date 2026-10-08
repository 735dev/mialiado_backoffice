import type { Lang } from '@/lib/store/slices/langSlice';

const locale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-VE');

export function money(value: number, lang: Lang, decimals = 2): string {
  return new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
}

export function integer(value: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang)).format(value);
}

export function decimal(value: number, lang: Lang, digits = 1): string {
  return new Intl.NumberFormat(locale(lang), { maximumFractionDigits: digits }).format(value);
}

/** "3 sep": etiquetas del eje X. */
export function shortDate(iso: string, lang: Lang): string {
  // La fecha llega como YYYY-MM-DD: se interpreta a mediodia local para que la zona horaria no la corra un dia.
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short' }).format(d).replace('.', '');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

/** Maximo "redondo" (1, 2, 5 x 10^k) para que los ejes del grafico tengan marcas limpias. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const frac = value / exp;
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nice * exp;
}
