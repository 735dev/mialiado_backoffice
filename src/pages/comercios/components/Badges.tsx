import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { EstadoComercio } from '@/providers/comerciosProvider';
import { avatarTone, ESTADO_KEY, ESTADO_TONE, initials } from '../utils/format';

const TONE = {
  ok: { pill: 'bg-primary-tint text-primary-deep', dot: 'bg-primary-deep' },
  warn: { pill: 'bg-warn-tint text-warn', dot: 'bg-warn' },
  err: { pill: 'bg-err-tint text-err-deep', dot: 'bg-err' },
} as const;

/** Pastilla de estado con punto (Activo, Por verificar, Suspendido, Rechazado). */
export function EstadoBadge({ estado }: { estado: EstadoComercio }) {
  const t = useT();
  const tone = TONE[ESTADO_TONE[estado] ?? 'warn'];
  return (
    <span className={cn('inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-pill px-3 text-xs font-bold', tone.pill)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', tone.dot)} aria-hidden="true" />
      {t(`comercios.estado.${ESTADO_KEY[estado] ?? 'porVerificar'}`)}
    </span>
  );
}

export function ComercioAvatar({ id, nombre, size = 40 }: { id: number; nombre: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={cn('flex flex-none items-center justify-center rounded-full text-sm font-extrabold tracking-tight', avatarTone(id))}
    >
      {initials(nombre)}
    </span>
  );
}
