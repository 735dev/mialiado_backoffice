import { ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Controller, useFormContext } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { cn } from '@/lib/utils/cn';
import type { Nodo } from '../models/categoria';
import { editarSchema, type EditarValues } from '../schemas/categoria';
import { renderIcono } from '../utils/iconos';
import { IconPicker } from './IconPicker';

interface EditorPanelProps {
  nodo: Nodo;
  /** Lugar actual (1-based) y cantidad de hermanos. */
  lugar: number;
  hermanos: number;
  /** Nombre de la categoria padre, o null si es principal. */
  padre: string | null;
  canEdit: boolean;
  busy: boolean;
  onSave: (values: EditarValues) => void;
  onDelete: () => void;
  onClose: () => void;
}

function Posicion({ max, disabled }: { max: number; disabled: boolean }) {
  const t = useT();
  const { setValue, register, formState, getValues } = useFormContext<EditarValues>();
  const error = formState.errors.posicion?.message;
  const step = (d: number) => {
    const n = Number(getValues('posicion'));
    setValue('posicion', Math.min(max, Math.max(1, (Number.isFinite(n) ? n : 1) + d)), { shouldDirty: true, shouldValidate: true });
  };
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={1}
          max={max}
          disabled={disabled}
          aria-label={t('categorias.editor.posicion')}
          aria-invalid={error ? true : undefined}
          className={cn(
            'h-11 w-24 rounded-field border-[1.5px] bg-bg px-3 text-center text-sm font-bold tabular-nums text-ink outline-none focus:border-primary-deep',
            error ? 'border-err' : 'border-line-strong',
          )}
          {...register('posicion', { valueAsNumber: true })}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label={t('categorias.editor.subirPosicion')}
          onClick={() => step(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 disabled:opacity-40"
        >
          <ChevronUp size={18} />
        </button>
        <button
          type="button"
          disabled={disabled}
          aria-label={t('categorias.editor.bajarPosicion')}
          onClick={() => step(1)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 disabled:opacity-40"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      {error && (
        <small role="alert" className="text-sm font-medium text-err">
          {t(error)}
        </small>
      )}
    </div>
  );
}

function Campos({ nodo, hermanos, padre, canEdit, busy, onDelete, onDiscard }: Omit<EditorPanelProps, 'onSave' | 'onClose' | 'lugar'> & { onDiscard: () => void }) {
  const t = useT();
  const { control, watch, formState } = useFormContext<EditarValues>();
  const nombre = watch('nombre');
  const icono = watch('icono');
  const visible = watch('visible');

  return (
    <>
      <div>
        <div className="mb-2 text-sm font-semibold text-ink-soft">{t('categorias.editor.asiSeVe')}</div>
        <div
          className={cn(
            'inline-flex h-11 items-center gap-2 rounded-pill bg-primary-tint px-4 font-bold text-primary-deep',
            !visible && 'opacity-50',
          )}
        >
          {renderIcono(icono)}
          {nombre || nodo.nombre}
        </div>
      </div>

      <FormInput<EditarValues> name="nombre" label="categorias.editor.nombre" disabled={!canEdit} />

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink-soft">{t('categorias.editor.icono')}</span>
        <Controller control={control} name="icono" render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} disabled={!canEdit} />} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink-soft">
          {padre ? t('categorias.editor.posicionDentro', { padre }) : t('categorias.editor.posicionApp')}
        </span>
        <Posicion max={hermanos} disabled={!canEdit} />
      </div>

      <div className="flex items-start justify-between gap-4 rounded-card bg-bg p-4">
        <div>
          <div className="font-bold">{t('categorias.editor.visible')}</div>
          <p className="text-sm text-ink-muted">{t('categorias.editor.visibleAyuda', { n: nodo.comercios })}</p>
        </div>
        <Controller
          control={control}
          name="visible"
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} label={t('categorias.editor.visible')} disabled={!canEdit} />}
        />
      </div>

      {nodo.comercios > 0 && (
        <Link to={`${PATHS.comercios}?categoria=${nodo.id}`} className="text-sm font-bold text-primary-deep underline">
          {t('categorias.editor.verComercios', { n: nodo.comercios })}
        </Link>
      )}

      {canEdit && (
        <div className="flex flex-col gap-3 border-t border-line pt-4">
          <div className="flex gap-3">
            <Button size="md" variant="secondary" onClick={onDiscard} disabled={busy || !formState.isDirty} className="flex-1">
              {t('categorias.editor.descartar')}
            </Button>
            <Button size="md" type="submit" isLoading={busy} disabled={!formState.isDirty} className="flex-1">
              {t('categorias.editor.guardar')}
            </Button>
          </div>
          <Button size="md" variant="ghost" onClick={onDelete} disabled={busy} className="text-err-deep">
            <Trash2 size={16} aria-hidden="true" />
            {t('categorias.editor.eliminar')}
          </Button>
        </div>
      )}
    </>
  );
}

/** Editor de la categoria elegida (RHF + Zod). Se monta con `key={nodo.id}` para arrancar limpio en cada seleccion. */
export function EditorPanel({ nodo, lugar, hermanos, padre, canEdit, busy, onSave, onDelete, onClose }: EditorPanelProps) {
  const t = useT();
  const defaults: EditarValues = { nombre: nodo.nombre, icono: nodo.icono ?? '', posicion: lugar, visible: nodo.visible };
  const form = useZodForm<EditarValues>(editarSchema(hermanos), defaults);
  return (
    <aside aria-label={t('categorias.editor.titulo')} className="flex flex-col gap-5 rounded-panel bg-surface p-5 shadow-e1">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-ink-muted">
          {nodo.parentId === null ? t('categorias.editor.editandoCategoria') : t('categorias.editor.editandoSub')}
        </h2>
        <button type="button" aria-label={t('categorias.editor.cerrar')} onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2">
          <X size={18} />
        </button>
      </div>
      <div className="text-xl font-extrabold tracking-tight">{nodo.nombre}</div>
      <Form methods={form} onSubmit={onSave}>
        <Campos nodo={nodo} hermanos={hermanos} padre={padre} canEdit={canEdit} busy={busy} onDelete={onDelete} onDiscard={() => form.reset(defaults)} />
      </Form>
    </aside>
  );
}
