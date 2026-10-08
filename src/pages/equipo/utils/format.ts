import type { EstadoVisible, Miembro } from '../models/equipo';

export function estadoVisible(m: Pick<Miembro, 'estado' | 'totp_activo'>): EstadoVisible {
  if (m.estado === 'S') return 'suspendido';
  if (m.estado === 'P') return 'pendiente';
  return m.totp_activo ? 'activo' : 'sin2fa';
}

interface Etiquetas {
  hoy: string;
  ayer: string;
  ahora: string;
}

const hora = (d: Date, lang: string) => new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit' }).format(d);
const dia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** «Ahora», «Hoy, 9:02 am», «Ayer, 6:40 pm», «30 sep» o «—» si nunca entro. */
export function fmtUltimoAcceso(iso: string | null, lang: string, et: Etiquetas, now: Date = new Date()): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Math.abs(now.getTime() - d.getTime()) < 5 * 60_000) return et.ahora;
  const diff = Math.round((dia(now) - dia(d)) / 86_400_000);
  if (diff === 0) return `${et.hoy}, ${hora(d, lang)}`;
  if (diff === 1) return `${et.ayer}, ${hora(d, lang)}`;
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' }).format(d);
}

export function fmtFecha(iso: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

/** Singular/plural por convencion de claves: `<clave>One` y `<clave>Other`, con {n}. */
export function plural(t: (clave: string, vars?: Record<string, string | number>) => string, clave: string, n: number): string {
  return t(`${clave}${n === 1 ? 'One' : 'Other'}`, { n });
}
