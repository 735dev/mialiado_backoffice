import type { Lang } from '@/lib/i18n';

export function formatDay(iso: string, lang: Lang): string {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  return d.toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { day: 'numeric', month: 'short' });
}

export function formatToday(now: Date, lang: Lang): string {
  const text = now.toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export type Saludo = 'morning' | 'afternoon' | 'evening';
export function saludoDe(now: Date): Saludo {
  const h = now.getHours();
  if (h < 12) return 'morning';
  if (h < 19) return 'afternoon';
  return 'evening';
}

/** Tiempo relativo corto: ("min", 12) o ("h", 3) o ("d", 2); `null` si es futuro/ahora. */
export function relativo(iso: string, now: Date): { unit: 'now' | 'min' | 'h' | 'd'; n: number } {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return { unit: 'now', n: 0 };
  if (min < 60) return { unit: 'min', n: min };
  if (min < 1440) return { unit: 'h', n: Math.floor(min / 60) };
  return { unit: 'd', n: Math.floor(min / 1440) };
}

/** Tope "bonito" del eje Y y su paso para ~4 divisiones. */
export function niceScale(max: number): { top: number; step: number } {
  if (max <= 0) return { top: 4, step: 1 };
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  return { top: step * 4, step };
}
