/** Variacion porcentual con signo (`+7%`); null si el backend no tiene periodo previo. */
export function formatPct(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

/** Minutos a `3 h 12 min` / `45 min`. */
export function formatMinutes(min: number): { h: number; m: number } {
  const total = Math.max(0, Math.round(min));
  return { h: Math.floor(total / 60), m: total % 60 };
}

const METODOS_CONOCIDOS = ['tarjeta', 'paypal', 'binance_pay'];
/** Clave i18n del metodo de pago o, si es desconocido, null (se muestra el valor del backend tal cual). */
export function metodoKey(metodo: string): string | null {
  return METODOS_CONOCIDOS.includes(metodo) ? `finanzas.metodo.${metodo}` : null;
}
