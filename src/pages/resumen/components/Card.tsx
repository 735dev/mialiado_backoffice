import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Tarjeta del resumen: titulo 19/24 extra-bold, subtitulo gris y contenido. */
export function Card({ title, subtitle, action, className, children }: CardProps) {
  return (
    <section className={cn('min-w-0 rounded-card bg-surface p-5 shadow-e1 md:p-6', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-[19px] font-extrabold leading-6 tracking-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
