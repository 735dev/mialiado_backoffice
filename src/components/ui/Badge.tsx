import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Tone = 'neutral' | 'ok' | 'warn' | 'err';

const TONES: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-ink-soft',
  ok: 'bg-primary-tint text-primary-deep',
  warn: 'bg-warn-tint text-warn',
  err: 'bg-err-tint text-err-deep',
};

/** Etiqueta de estado en pastilla (Activo, Por verificar, Suspendido...). */
export function Badge({ tone = 'neutral', className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cn('inline-flex h-6 items-center rounded-pill px-2.5 text-xs font-bold', TONES[tone], className)}>{children}</span>;
}
