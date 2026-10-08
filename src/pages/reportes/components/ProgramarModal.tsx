import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { applyServerErrors } from '@/lib/utils/applyServerErrors';
import { notify } from '@/lib/utils/notify';
import { FORMATOS_DISPONIBLES, FRECUENCIAS, TIPOS } from '../models/reporte';
import { crearProgramado } from '../providers/reportesProvider';
import { aCuerpoProgramado, programadoInicial, programadoSchema, type ProgramadoForm } from '../schemas/reporteSchemas';
import { nombreDia } from '../utils/format';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

/** Programar un reporte recurrente: el servidor lo genera cada hora que toca y lo envia por correo. */
export function ProgramarModal({ open, onOpenChange, onCreated }: Props) {
  const t = useT();
  const { lang } = useLang();
  const methods = useZodForm<ProgramadoForm>(programadoSchema, programadoInicial);
  const [saving, setSaving] = useState(false);
  const frecuencia = useWatch({ control: methods.control, name: 'frecuencia' });

  const onSubmit = async (v: ProgramadoForm) => {
    setSaving(true);
    const res = await crearProgramado(aCuerpoProgramado(v));
    setSaving(false);
    if (!res.ok) {
      applyServerErrors(methods.setError, res);
      notify.fromApiError(res);
      return;
    }
    notify.toast.success(t('reportes.scheduleModal.created'));
    methods.reset(programadoInicial);
    onOpenChange(false);
    onCreated();
  };

  const dias =
    frecuencia === 'semanal'
      ? Array.from({ length: 7 }, (_, i) => ({ value: String(i), label: nombreDia(i, lang) }))
      : Array.from({ length: 28 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('reportes.scheduleModal.title')} description={t('reportes.scheduleModal.description')}>
      <Form methods={methods} onSubmit={onSubmit} className="gap-4">
        <FormInput<ProgramadoForm> name="nombre" label="reportes.scheduleModal.name" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormSelect<ProgramadoForm> name="tipo" label="reportes.scheduleModal.type" options={TIPOS.map((x) => ({ value: x, label: `reportes.tipo.${x}` }))} />
          <FormSelect<ProgramadoForm>
            name="formato"
            label="reportes.scheduleModal.format"
            options={FORMATOS_DISPONIBLES.map((x) => ({ value: x, label: x.toUpperCase() }))}
          />
          <FormSelect<ProgramadoForm> name="frecuencia" label="reportes.scheduleModal.frequency" options={FRECUENCIAS.map((x) => ({ value: x, label: `reportes.frecuencia.${x}` }))} />
          {frecuencia !== 'diario' && (
            <FormSelect<ProgramadoForm>
              name="dia"
              label={frecuencia === 'semanal' ? 'reportes.scheduleModal.weekday' : 'reportes.scheduleModal.monthday'}
              options={dias}
            />
          )}
          <FormInput<ProgramadoForm> name="hora" type="time" label="reportes.scheduleModal.time" />
        </div>
        <FormInput<ProgramadoForm> name="destinatario" type="email" label="reportes.scheduleModal.recipient" inputMode="email" autoComplete="email" />
        <Button type="submit" size="md" isLoading={saving}>
          {t('reportes.scheduleModal.submit')}
        </Button>
      </Form>
    </Modal>
  );
}
