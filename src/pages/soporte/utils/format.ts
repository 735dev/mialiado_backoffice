/** «hace 12 min», «hace 3 h», «ayer»; para fechas viejas, dia y mes. */
export function hace(iso: string, lang: string, now: number = Date.now()): string {
  const diffMin = Math.round((new Date(iso).getTime() - now) / 60000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  const abs = Math.abs(diffMin);
  if (abs < 1) return rtf.format(0, 'minute');
  if (abs < 60) return rtf.format(diffMin, 'minute');
  if (abs < 60 * 24) return rtf.format(Math.round(diffMin / 60), 'hour');
  if (abs < 60 * 24 * 7) return rtf.format(Math.round(diffMin / 1440), 'day');
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function fmtFechaHora(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(iso));
}

/** «$25,00» (es) o «$25.00» (en). */
export function fmtDinero(n: number, lang: string): string {
  return `$${new Intl.NumberFormat(lang === 'es' ? 'es-VE' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

export function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return ((partes[0]?.[0] ?? '') + (partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : (partes[0]?.[1] ?? ''))).toUpperCase();
}

const TONOS = [
  'bg-primary-tint text-primary-deep',
  'bg-warn-tint text-warn',
  'bg-err-tint text-err-deep',
  'bg-surface-2 text-ink-soft',
] as const;

/** Color estable por nombre (los avatares del prototipo usan una paleta de pasteles). */
export function tonoAvatar(nombre: string): string {
  let h = 0;
  for (const ch of nombre) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONOS[h % TONOS.length] as string;
}
