import type { Lang } from '@/lib/i18n';

const locale = (lang: Lang) => (lang === 'es' ? 'es-AR' : 'en-US');

/** Dinero en USD como el prototipo: `$9.240,00` en es y `$9,240.00` en en. Siempre 2 decimales. */
export function formatMoney(value: number, lang: Lang): string {
  const abs = new Intl.NumberFormat(locale(lang), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(value));
  return `${value < 0 ? '-' : ''}$${abs}`;
}

/** Variacion porcentual con signo (`+7%`); null si el backend no tiene periodo previo. */
export function formatPct(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

/** `2 oct, 8:42 a. m.` (es) / `Oct 2, 8:42 AM` (en). */
export function formatDateTime(iso: string, lang: Lang): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale(lang), { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(d);
}

/** Iniciales para el avatar de un comercio sin logo. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/** Minutos a `3 h 12 min` / `45 min`. */
export function formatMinutes(min: number): { h: number; m: number } {
  const total = Math.max(0, Math.round(min));
  return { h: Math.floor(total / 60), m: total % 60 };
}

const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;

/** CSV de movimientos (cabecera + filas) listo para descargar. */
export function toCsv(rows: Array<Array<string | number>>): string {
  return rows.map((r) => r.map(csvCell).join(',')).join('\n');
}

const METODOS_CONOCIDOS = ['tarjeta', 'paypal', 'binance_pay'];
/** Clave i18n del metodo de pago o, si es desconocido, null (se muestra el valor del backend tal cual). */
export function metodoKey(metodo: string): string | null {
  return METODOS_CONOCIDOS.includes(metodo) ? `finanzas.metodo.${metodo}` : null;
}
