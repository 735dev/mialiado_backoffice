import { CircleDot, Diamond, Star, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { NivelCodigo } from '@/providers/usuariosProvider';

export const NIVEL_ICON: Record<NivelCodigo, LucideIcon> = { aliado: CircleDot, aliadopro: Diamond, aliadoplus: Star };

/** Colores de cada nivel (bronce, acero, oro) con su variante oscura. */
export const NIVEL_TONE: Record<NivelCodigo, string> = {
  aliado: 'bg-orange-100 text-orange-900 dark:bg-orange-950 dark:text-orange-200',
  aliadopro: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  aliadoplus: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
};

export const NIVEL_LABEL: Record<NivelCodigo, string> = { aliado: 'Aliado', aliadopro: 'AliadoPro', aliadoplus: 'AliadoPlus' };

export function NivelBadge({ nivel, className }: { nivel: NivelCodigo; className?: string }) {
  const Icon = NIVEL_ICON[nivel];
  return (
    <span className={cn('inline-flex h-7 items-center gap-1.5 rounded-pill px-2.5 text-xs font-bold', NIVEL_TONE[nivel], className)}>
      <Icon size={14} aria-hidden="true" />
      {NIVEL_LABEL[nivel]}
    </span>
  );
}

export function NivelIcon({ nivel, size = 20 }: { nivel: NivelCodigo; size?: number }) {
  const Icon = NIVEL_ICON[nivel];
  return (
    <span className={cn('flex flex-none items-center justify-center rounded-full', NIVEL_TONE[nivel])} style={{ width: size * 1.8, height: size * 1.8 }}>
      <Icon size={size} aria-hidden="true" />
    </span>
  );
}
