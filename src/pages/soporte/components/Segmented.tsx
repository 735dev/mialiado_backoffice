import { cn } from '@/lib/utils/cn';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  /** `md` = 44 px (formularios), `sm` = 36 px (filtros de tabla). */
  size?: 'sm' | 'md';
}

/** Selector en pastilla del prototipo (Todos / Programados / Enviados, Enviar ahora / Programar). */
export function Segmented<T extends string>({ options, value, onChange, label, size = 'sm' }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="inline-flex max-w-full gap-0.5 overflow-x-auto rounded-pill bg-surface-2 p-1">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'whitespace-nowrap rounded-pill px-4 text-sm font-bold transition-colors',
              size === 'md' ? 'h-11 px-[18px]' : 'h-9',
              active ? 'bg-surface text-ink shadow-e1' : 'text-ink-muted hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
