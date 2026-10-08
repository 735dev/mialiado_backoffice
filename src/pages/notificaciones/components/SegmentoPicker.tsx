import { Check, Layers, MapPin, Moon, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import { NIVELES, SEGMENTOS, type Segmento, type Zona } from '../models/notificacion';
import type { NotificacionForm } from '../schemas/notificacionSchema';

const ICONOS: Record<Segmento, ReactNode> = {
  todos: <Users size={18} />,
  nivel: <Layers size={18} />,
  zona: <MapPin size={18} />,
  inactivos: <Moon size={18} />,
};

interface SegmentoPickerProps {
  zonas: Zona[];
  /** Usuarios alcanzados por los segmentos que no necesitan elegir nada (todos, inactivos). */
  conteos: Partial<Record<Segmento, string>>;
}

function toggle(list: string[], item: string): string[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** Tarjetas de segmento + el selector de niveles o zonas que corresponda. */
export function SegmentoPicker({ zonas, conteos }: SegmentoPickerProps) {
  const t = useT();
  const { control, watch, formState } = useFormContext<NotificacionForm>();
  const segmento = watch('segmento');
  const niveles = watch('niveles');
  const zonasElegidas = watch('zonas');

  const subtitulo = (s: Segmento): string => {
    if (s === 'nivel') return t('notificaciones.segmento.niveles', { n: niveles.length || NIVELES.length });
    if (s === 'zona') return t('notificaciones.segmento.zonas', { n: zonasElegidas.length || zonas.length });
    return conteos[s] ?? '…';
  };

  return (
    <fieldset className="flex min-w-0 flex-col gap-3">
      <legend className="mb-2.5 text-sm font-semibold text-ink-soft">{t('notificaciones.composer.who')}</legend>
      <Controller
        control={control}
        name="segmento"
        render={({ field }) => (
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
            {SEGMENTOS.map((s) => {
              const active = field.value === s;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => field.onChange(s)}
                  className={cn(
                    'flex min-h-[88px] flex-col items-start gap-1.5 rounded-field border-[1.5px] p-3.5 text-left transition-colors',
                    active ? 'border-primary-deep bg-primary-tint' : 'border-line-strong bg-surface hover:bg-surface-2',
                  )}
                >
                  <span className="flex w-full items-center justify-between text-ink-soft">
                    {ICONOS[s]}
                    {active && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-on">
                        <Check size={13} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-bold">{t(`notificaciones.segmento.${s}`)}</span>
                  <span className="text-xs font-medium text-ink-muted">{subtitulo(s)}</span>
                </button>
              );
            })}
          </div>
        )}
      />
      {segmento === 'nivel' && (
        <Opciones
          legend={t('notificaciones.segmento.elegirNiveles')}
          items={NIVELES.map((n) => ({ value: n, label: t(`notificaciones.niveles.${n}`) }))}
          selected={niveles}
          error={formState.errors.niveles?.message}
          name="niveles"
        />
      )}
      {segmento === 'zona' && (
        <Opciones
          legend={t('notificaciones.segmento.elegirZonas')}
          items={zonas.map((z) => ({ value: z.nombre, label: z.nombre }))}
          selected={zonasElegidas}
          error={formState.errors.zonas?.message}
          name="zonas"
          emptyText={t('notificaciones.segmento.sinZonas')}
        />
      )}
    </fieldset>
  );
}

interface OpcionesProps {
  legend: string;
  items: { value: string; label: string }[];
  selected: string[];
  name: 'niveles' | 'zonas';
  error?: string;
  emptyText?: string;
}

function Opciones({ legend, items, selected, name, error, emptyText }: OpcionesProps) {
  const t = useT();
  const { setValue, clearErrors } = useFormContext<NotificacionForm>();
  const cambiar = (value: string) => {
    setValue(name, toggle(selected, value) as never, { shouldDirty: true });
    clearErrors(name);
  };
  return (
    <div className="flex flex-col gap-2" role="group" aria-label={legend}>
      <span className="text-sm font-semibold text-ink-soft">{legend}</span>
      {items.length === 0 && emptyText && <p className="text-sm text-ink-muted">{emptyText}</p>}
      <div className="flex flex-wrap gap-2">
        {items.map((it) => {
          const on = selected.includes(it.value);
          return (
            <button
              key={it.value}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => cambiar(it.value)}
              className={cn(
                'inline-flex h-10 items-center gap-1.5 rounded-pill border-[1.5px] px-4 text-sm font-semibold',
                on ? 'border-primary-deep bg-primary-tint text-primary-deep' : 'border-line-strong bg-surface text-ink-soft',
              )}
            >
              {on && <Check size={14} strokeWidth={3} />}
              {it.label}
            </button>
          );
        })}
      </div>
      {error && (
        <small role="alert" className="text-sm font-medium text-err">
          {t(error)}
        </small>
      )}
    </div>
  );
}
