import type { Lang } from '@/lib/i18n';

const LOCALE: Record<Lang, string> = { es: 'de-DE', en: 'en-US' };

/** 12480 -> "12.480" (es) / "12,480" (en). No se usa `es` porque omite el separador en 4 cifras. */
export function formatNumber(n: number, lang: Lang): string {
  return n.toLocaleString(LOCALE[lang], { maximumFractionDigits: 0 });
}

export function formatMoney(n: number, lang: Lang): string {
  return `$${n.toLocaleString(LOCALE[lang], { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

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

const TONES = [
  'bg-primary-tint text-primary-deep',
  'bg-warn-tint text-warn',
  'bg-err-tint text-err-deep',
  'bg-surface-2 text-ink-soft',
] as const;

export function avatarTone(id: number): string {
  return TONES[Math.abs(id) % TONES.length] ?? TONES[0];
}

export function initials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase();
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
