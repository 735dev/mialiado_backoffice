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

