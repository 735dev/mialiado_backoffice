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
