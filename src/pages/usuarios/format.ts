import type { Lang } from '@/lib/store/slices/langSlice';

const locale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-VE');

export function money(value: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(value);
}

export function integer(value: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang)).format(value);
}

/** "8 oct · 9:41 am". Sin fecha devuelve un guion. */
export function dateTime(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '-';
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short' }).format(d).replace('.', '');
  const time = new Intl.DateTimeFormat(locale(lang), { hour: 'numeric', minute: '2-digit' }).format(d);
  return `${day} · ${time}`;
}

export function dateOnly(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '-';
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso)).replace(/\./g, '');
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
