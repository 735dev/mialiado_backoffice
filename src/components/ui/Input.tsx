import { forwardRef, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const BOX = 'box-border h-14 w-full rounded-field border-[1.5px] bg-surface text-base text-ink placeholder:text-ink-muted';
const BORDER_OK = 'border-line-strong focus-within:border-primary-deep focus-within:ring-1 focus-within:ring-primary-deep';
const BORDER_ERR = 'border-err ring-1 ring-err';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  hasError?: boolean;
  /** Contenido fijo a la izquierda dentro del campo. */
  prefix?: ReactNode;
  /** Contenido a la derecha dentro del campo. */
  suffix?: ReactNode;
}

/** Campo de 56 px con borde 1.5 px, radio 18 y foco verde profundo, como los prototipos. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, hasError, prefix, suffix, ...rest }, ref) {
  return (
    <div className={cn(BOX, 'flex items-center overflow-hidden', hasError ? BORDER_ERR : BORDER_OK, className)}>
      {prefix && <span className="flex h-7 flex-none items-center border-r-[1.5px] border-line px-4 font-semibold">{prefix}</span>}
      <input
        ref={ref}
        aria-invalid={hasError || undefined}
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-[18px] text-base text-ink outline-none placeholder:text-ink-muted"
        {...rest}
      />
      {suffix}
    </div>
  );
});

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'suffix'> {
  showLabel: string;
  hideLabel: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput({ showLabel, hideLabel, ...rest }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      type={visible ? 'text' : 'password'}
      suffix={
        <button
          type="button"
          aria-label={visible ? hideLabel : showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
          className="mr-1.5 flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-soft"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      }
      {...rest}
    />
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }>(function Textarea(
  { className, hasError, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        'box-border min-h-28 w-full resize-none rounded-field border-[1.5px] bg-surface p-[18px] text-base text-ink outline-none placeholder:text-ink-muted focus:border-primary-deep focus:ring-1 focus:ring-primary-deep',
        hasError ? BORDER_ERR : 'border-line-strong',
        className,
      )}
      {...rest}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { hasError?: boolean }>(function Select(
  { className, hasError, children, ...rest },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={hasError || undefined}
      className={cn(
        'box-border h-14 w-full rounded-field border-[1.5px] bg-surface px-[18px] text-base text-ink outline-none focus:border-primary-deep focus:ring-1 focus:ring-primary-deep',
        hasError ? BORDER_ERR : 'border-line-strong',
        className,
      )}
      {...rest}
    >
      {children}
    </select>
  );
});
