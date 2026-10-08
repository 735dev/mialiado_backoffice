import { cn } from '@/lib/utils/cn';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onCheckedChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-8 w-[52px] flex-none before:absolute before:-inset-x-1 before:-inset-y-1.5 before:content-[""] rounded-pill transition-colors duration-150 disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-line-strong',
        className,
      )}
    >
      <span
        className={cn(
          'absolute left-1 top-1 h-6 w-6 rounded-full bg-surface shadow-e1 transition-transform duration-150',
          checked && 'translate-x-5',
        )}
      />
    </button>
  );
}
