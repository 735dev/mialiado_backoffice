import type { Lang } from '@/lib/store/slices/langSlice';

const locale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-VE');

export function money(value: number, lang: Lang): string {
  return new Intl.NumberFormat(locale(lang), { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(value);
}

/** "hace 12 min", "hace 3 h", "hace 2 d" a partir de una fecha ISO. */
export function haceCuanto(iso: string, lang: Lang, now = Date.now()): string {
  const diffMin = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: 'always', style: 'short' });
  if (diffMin < 60) return rtf.format(-Math.max(1, diffMin), 'minute');
  if (diffMin < 60 * 24) return rtf.format(-Math.round(diffMin / 60), 'hour');
  return rtf.format(-Math.round(diffMin / (60 * 24)), 'day');
}

export function shortDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '-';
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short' }).format(new Date(iso)).replace('.', '');
}

export function diasRestantes(fin: string | null | undefined, now = Date.now()): number | null {
  if (!fin) return null;
  return Math.max(0, Math.ceil((new Date(fin).getTime() - now) / 86400000));
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}
