import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import { ICONO_NOMBRES, renderIcono } from '../utils/iconos';

interface IconPickerProps {
  value: string;
  onChange: (icono: string) => void;
  disabled?: boolean;
}

/** Rejilla de iconos elegibles; el elegido queda marcado con `aria-pressed`. */
export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const t = useT();
  return (
    <div role="group" aria-label={t('categorias.editor.icono')} className="grid grid-cols-6 gap-2">
      {ICONO_NOMBRES.map((nombre) => {
        const active = value === nombre;
        return (
          <button
            key={nombre}
            type="button"
            disabled={disabled}
            aria-pressed={active}
            aria-label={t('categorias.editor.iconoDe', { nombre })}
            onClick={() => onChange(nombre)}
            className={cn(
              'flex h-11 items-center justify-center rounded-field border-[1.5px] disabled:opacity-50',
              active ? 'border-primary-deep bg-primary-tint text-primary-deep' : 'border-line bg-bg text-ink-soft hover:border-line-strong',
            )}
          >
            {renderIcono(nombre, 20)}
          </button>
        );
      })}
    </div>
  );
}
