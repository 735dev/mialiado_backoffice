import * as Dialog from '@radix-ui/react-dialog';
import { Controller, useFormContext } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormSwitch } from '@/components/form/FormSwitch';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';
import type { CrearCategoriaBody, Nodo } from '../models/categoria';
import { crearSchema, type CrearValues } from '../schemas/categoria';
import { IconPicker } from './IconPicker';

interface NuevaDialogProps {
  open: boolean;
  /** Categorias principales: las unicas que admiten subcategorias (solo dos niveles). */
  padres: Nodo[];
  busy: boolean;
  onClose: () => void;
  onCreate: (body: CrearCategoriaBody) => Promise<boolean>;
}

const DEFAULTS: CrearValues = { nombre: '', icono: '', parent_id: '', visible: true };

function Icono() {
  const { control } = useFormContext<CrearValues>();
  return <Controller control={control} name="icono" render={({ field }) => <IconPicker value={field.value} onChange={field.onChange} />} />;
}

function Formulario({ padres, busy, onClose, onCreate }: Omit<NuevaDialogProps, 'open'>) {
  const t = useT();
  const form = useZodForm<CrearValues>(crearSchema, DEFAULTS);

  const submit = async (v: CrearValues) => {
    const body: CrearCategoriaBody = { nombre: v.nombre, visible: v.visible };
    if (v.icono) body.icono = v.icono;
    if (v.parent_id !== '') body.parent_id = v.parent_id;
    if (await onCreate(body)) onClose();
  };

  return (
    <Form methods={form} onSubmit={submit} className="mt-4 gap-4">
      <FormInput<CrearValues> name="nombre" label="categorias.nueva.nombre" />
      <FormSelect<CrearValues>
        name="parent_id"
        asNumber
        label="categorias.nueva.padre"
        placeholder="categorias.nueva.principal"
        options={padres.map((p) => ({ value: p.id, label: p.nombre }))}
      />
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-ink-soft">{t('categorias.editor.icono')}</span>
        <Icono />
      </div>
      <FormSwitch<CrearValues> name="visible" label="categorias.editor.visible" />
      <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" size="md" onClick={onClose} disabled={busy}>
          {t('common.cancel')}
        </Button>
        <Button size="md" type="submit" isLoading={busy}>
          {t('categorias.nueva.crear')}
        </Button>
      </div>
    </Form>
  );
}

/** Alta de categoria o subcategoria. El formulario se monta al abrir, asi cada alta arranca limpia. */
export function NuevaDialog({ open, onClose, ...rest }: NuevaDialogProps) {
  const t = useT();
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && !rest.busy && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[70] max-h-[92vh] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card bg-surface p-6 text-ink shadow-e2">
          <Dialog.Title className="text-lg font-extrabold tracking-tight">{t('categorias.nueva.titulo')}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-muted">{t('categorias.nueva.descripcion')}</Dialog.Description>
          <Formulario {...rest} onClose={onClose} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
