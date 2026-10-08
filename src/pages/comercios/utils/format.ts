import type { Lang } from '@/lib/i18n';
import type { EstadoComercio, HorarioDia } from '@/providers/comerciosProvider';

const LOCALE: Record<Lang, string> = { es: 'es', en: 'en-US' };

export function formatDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  return d.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short', year: 'numeric' }).replace(/\./g, '');
}

export function formatDateTime(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return '–';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '–';
  const day = d.toLocaleDateString(LOCALE[lang], { day: 'numeric', month: 'short' }).replace(/\./g, '');
  const time = d.toLocaleTimeString(LOCALE[lang], { hour: 'numeric', minute: '2-digit' });
  return `${day} · ${time}`;
}

export function initials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')).toUpperCase();
}

const TONES = [
  'bg-warn-tint text-warn',
  'bg-primary-tint text-primary-deep',
  'bg-surface-2 text-ink-soft',
  'bg-err-tint text-err-deep',
] as const;

export function avatarTone(id: number): string {
  return TONES[Math.abs(id) % TONES.length] ?? TONES[0];
}

export type EstadoTone = 'ok' | 'warn' | 'err';

export const ESTADO_TONE: Record<EstadoComercio, EstadoTone> = {
  Activo: 'ok',
  'Por verificar': 'warn',
  Suspendido: 'err',
  Rechazado: 'err',
};

/** Clave i18n de cada estado que devuelve el backend (el texto del backend no se muestra tal cual). */
export const ESTADO_KEY: Record<EstadoComercio, string> = {
  Activo: 'activo',
  'Por verificar': 'porVerificar',
  Suspendido: 'suspendido',
  Rechazado: 'rechazado',
};

/** "Mar a dom · 11:00 – 22:00": agrupa dias consecutivos con los mismos turnos. */
export function resumenHorario(horario: HorarioDia[]): string {
  const turnos = (d: HorarioDia) => d.turnos.map((x) => `${x.desde}–${x.hasta}`).join(', ');
  const grupos: Array<{ from: HorarioDia; to: HorarioDia; key: string }> = [];
  for (const d of horario) {
    if (!d.abierto) continue;
    const last = grupos[grupos.length - 1];
    if (last && last.to.dia === d.dia - 1 && last.key === turnos(d)) last.to = d;
    else grupos.push({ from: d, to: d, key: turnos(d) });
  }
  const short = (n: string) => n.slice(0, 3).toLowerCase();
  return grupos
    .map((g) => `${g.from === g.to ? short(g.from.nombre) : `${short(g.from.nombre)} a ${short(g.to.nombre)}`} · ${g.key}`)
    .join(' / ');
}

export function osmEmbedUrl(lat: number, lng: number): string {
  const dx = 0.006;
  const dy = 0.0035;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - dx},${lat - dy},${lng + dx},${lat + dy}&layer=mapnik&marker=${lat},${lng}`;
}

export function osmLink(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
}
