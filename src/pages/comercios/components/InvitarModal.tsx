import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { useZodForm } from '@/components/form/useZodForm';
import { useT } from '@/lib/hooks/useT';
import { notify } from '@/lib/utils/notify';
import { invitarComercio } from '@/providers/comerciosProvider';
import { invitarSchema, type InvitarValues } from '../schemas/comercios';
import { Modal } from './Modal';

/** Invita a un comercio por correo (POST /comercios/invitar, requiere `editar`). */
export function InvitarModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const [sending, setSending] = useState(false);
  const methods = useZodForm<InvitarValues>(invitarSchema, { correo: '', nombre: '' });

  const close = () => {
    methods.reset();
    onClose();
  };

  const submit = async (v: InvitarValues) => {
    setSending(true);
    const res = await invitarComercio({ correo: v.correo, nombre: v.nombre || undefined });
    setSending(false);
    if (!res.ok) {
      notify.fromApiError(res);
      return;
    }
    notify.toast.success(t('comercios.invitar.enviada', { correo: v.correo }));
    close();
  };

  return (
    <Modal open={open} onClose={close} title={t('comercios.invitar.title')} description={t('comercios.invitar.descripcion')}>
      <Form methods={methods} onSubmit={submit}>
        <FormInput<InvitarValues> name="correo" type="email" label="comercios.invitar.correo" placeholder="comercios.invitar.correoPlaceholder" autoComplete="off" />
        <FormInput<InvitarValues> name="nombre" label="comercios.invitar.nombre" autoComplete="off" />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" size="md" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" size="md" isLoading={sending}>
            {t('comercios.invitar.enviar')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
