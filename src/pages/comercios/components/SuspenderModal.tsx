import { Info, PauseCircle } from 'lucide-react';
import { Form } from '@/components/form/Form';
import { FormTextarea } from '@/components/form/FormTextarea';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useT } from '@/lib/hooks/useT';
import { suspenderSchema, type SuspenderValues } from '../schemas/comercios';

interface Props {
  open: boolean;
  /** "Nombre · RIF" del comercio. */
  objeto: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (motivo: string) => void | Promise<unknown>;
}

/** Suspender un comercio (POST /comercios/{id}/suspender, requiere `editar`): el motivo es obligatorio y queda en auditoria. */
export function SuspenderModal({ open, objeto, busy, onClose, onSubmit }: Props) {
  const t = useT();
  const methods = useZodForm<SuspenderValues>(suspenderSchema, { motivo: '' });
  const close = () => {
    methods.reset({ motivo: '' });
    onClose();
  };
  return (
    <Modal open={open} onClose={close} title={t('comercios.suspender.title')} subtitle={objeto} icon={<PauseCircle size={22} />}>
      <Form methods={methods} onSubmit={(v) => onSubmit(v.motivo)}>
        <FormTextarea<SuspenderValues> name="motivo" label="comercios.suspender.motivo" placeholder="comercios.suspender.placeholder" rows={4} />
        <p className="flex items-start gap-2 text-sm text-ink-muted">
          <Info size={16} aria-hidden="true" className="mt-0.5 flex-none" />
          {t('comercios.suspender.aviso')}
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" size="md" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="danger" size="md" isLoading={busy}>
            {t('comercios.suspender.confirmar')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
