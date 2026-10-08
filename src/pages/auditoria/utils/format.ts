export type TonoAccion = 'ok' | 'err' | 'warn' | 'neutral';

const POSITIVAS = ['Aprobó', 'Acreditó', 'Creó', 'Invitó', 'Envió', 'Envió mensaje', 'Reactivó', 'Reanudó', 'Desbloqueó', 'Conciliado', 'Inició revisión'];
const NEGATIVAS = ['Rechazó', 'Suspendió', 'Bloqueó', 'Eliminó', 'Quitó', 'Canceló', 'Reembolsó'];
const CAMBIOS = ['Editó', 'Ajustó nivel', 'Reordenó', 'Permisos', 'Programó', 'Pidió cambios', 'Restableció', 'Anotó'];

/** Color de la etiqueta de accion: verde si crea o aprueba, rojo si rechaza o quita, ambar si modifica. */
export function tonoDeAccion(accion: string): TonoAccion {
  if (POSITIVAS.includes(accion)) return 'ok';
  if (NEGATIVAS.includes(accion)) return 'err';
  if (CAMBIOS.includes(accion)) return 'warn';
  return 'neutral';
}

interface Etiquetas {
  hoy: string;
  ayer: string;
}

const hora = (d: Date, lang: string) => new Intl.DateTimeFormat(lang, { hour: 'numeric', minute: '2-digit', hour12: true }).format(d);
const dia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** «Hoy, 10:42 am», «Ayer, 6:40 pm», «30 sep, 5:30 pm». */
export function fmtFecha(iso: string, lang: string, et: Etiquetas, now: Date = new Date()): string {
  const d = new Date(iso);
  const diff = Math.round((dia(now) - dia(d)) / 86_400_000);
  if (diff === 0) return `${et.hoy}, ${hora(d, lang)}`;
  if (diff === 1) return `${et.ayer}, ${hora(d, lang)}`;
  return `${new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' }).format(d)}, ${hora(d, lang)}`;
}

/** Valor de un campo del antes/despues: texto, numero, booleano, objeto (JSON) o «—». */
export function fmtValor(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
