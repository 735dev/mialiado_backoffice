import type { EstadoComercio, HorarioDia } from '@/providers/comerciosProvider';

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
