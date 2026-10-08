import type { ButtonHTMLAttributes } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-primary-on shadow-e1',
  secondary: 'bg-surface text-ink ring-1 ring-inset ring-line-strong',
  ghost: 'bg-transparent text-ink-soft hover:bg-surface-2',
  danger: 'bg-err-tint text-err-deep ring-1 ring-inset ring-err',
};

const SIZES: Record<Size, string> = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-6 text-base',
};

/** Boton en pastilla. `isLoading` lo deshabilita y muestra un indicador (evita doble envio). */
export function Button({ variant = 'primary', size = 'lg', isLoading, disabled, className, children, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill font-bold disabled:cursor-not-allowed disabled:opacity-50',
        SIZES[size],
        VARIANTS[variant],
        className,
      )}
      {...props}
    >
      {isLoading && <Spinner size={18} />}
      {children}
    </button>
  );
}

export default Button;
