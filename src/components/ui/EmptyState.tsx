import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Estado vacio o de error de una vista: icono opcional, titulo, texto y una accion. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn('mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center', className)}>
      {icon && <div className="text-ink-muted">{icon}</div>}
      <h2 className="text-xl font-extrabold tracking-tight text-ink">{title}</h2>
      {description && <p className="text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
