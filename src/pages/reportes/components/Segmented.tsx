import { cn } from '@/lib/utils/cn';

interface Option<T extends string> {
  value: T;
  label: string;
  disabled?: boolean;
  /** Id del texto que explica por que esta deshabilitada (aria-describedby). */
  describedBy?: string;
}

interface SegmentedProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

/** Selector en pastilla del prototipo (CSV / XLSX / PDF). */
export function Segmented<T extends string>({ options, value, onChange, label }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-pill bg-surface-2 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            disabled={o.disabled}
            aria-describedby={o.disabled ? o.describedBy : undefined}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-9 whitespace-nowrap rounded-pill px-[18px] text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              active ? 'bg-surface text-ink shadow-e1' : 'text-ink-muted enabled:hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
