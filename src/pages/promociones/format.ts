import type { Lang } from '@/lib/store/slices/langSlice';

const locale = (lang: Lang) => (lang === 'en' ? 'en-US' : 'es-VE');

/** "hace 12 min", "hace 3 h", "hace 2 d" a partir de una fecha ISO. */
export function haceCuanto(iso: string, lang: Lang, now = Date.now()): string {
  const diffMin = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  const rtf = new Intl.RelativeTimeFormat(locale(lang), { numeric: 'always', style: 'short' });
  if (diffMin < 60) return rtf.format(-Math.max(1, diffMin), 'minute');
  if (diffMin < 60 * 24) return rtf.format(-Math.round(diffMin / 60), 'hour');
  return rtf.format(-Math.round(diffMin / (60 * 24)), 'day');
}

export function diasRestantes(fin: string | null | undefined, now = Date.now()): number | null {
  if (!fin) return null;
  return Math.max(0, Math.ceil((new Date(fin).getTime() - now) / 86400000));
}
