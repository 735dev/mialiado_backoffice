import { Controller, useFormContext, type FieldValues, type Path } from 'react-hook-form';
import { Switch } from '@/components/ui/Switch';
import { useT } from '@/lib/hooks/useT';

interface FormSwitchProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  className?: string;
}

/** Interruptor ligado a un booleano del formulario (ajustes de notificaciones, etc.). */
export function FormSwitch<T extends FieldValues>({ name, label, className }: FormSwitchProps<T>) {
  const { control } = useFormContext<T>();
  const t = useT();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className={className ?? 'flex items-center justify-between gap-3'}>
          <span className="text-base font-semibold">{t(label)}</span>
          <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} label={t(label)} />
        </div>
      )}
    />
  );
}
