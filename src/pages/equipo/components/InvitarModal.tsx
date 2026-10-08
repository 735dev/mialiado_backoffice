import { useState } from 'react';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { ROLES } from '@/lib/constants/roles';
import { useT } from '@/lib/hooks/useT';
import { applyServerErrors } from '@/lib/utils/applyServerErrors';
import { notify } from '@/lib/utils/notify';
import { invitarMiembro } from '../providers/equipoProvider';
import { invitarSchema, type InvitarForm } from '../schemas/equipoSchemas';
import { Modal } from '@/components/ui/Modal';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
}

/** Invita a una persona al panel: queda pendiente hasta que acepte y configure su segundo factor. */
export function InvitarModal({ open, onOpenChange, onInvited }: Props) {
  const t = useT();
  const methods = useZodForm<InvitarForm>(invitarSchema, { correo: '', nombres: '', apellidos: '', rol: 'soporte' });
  const [saving, setSaving] = useState(false);
  // Con DEV_MODE el servidor devuelve el token de la invitacion (en produccion llega solo por correo).
  const [token, setToken] = useState<string | null>(null);

  const cerrar = (abierto: boolean) => {
    if (!abierto) {
      setToken(null);
      methods.reset();
    }
    onOpenChange(abierto);
  };

  const onSubmit = async (v: InvitarForm) => {
    setSaving(true);
    const res = await invitarMiembro({ ...v, correo: v.correo.trim(), nombres: v.nombres.trim(), apellidos: v.apellidos.trim() });
    setSaving(false);
    if (!res.ok) {
      applyServerErrors(methods.setError, res);
      notify.fromApiError(res);
      return;
    }
    notify.toast.success(t('equipo.invite.sent', { correo: v.correo.trim() }));
    onInvited();
    if (res.data.invitacion_token) setToken(res.data.invitacion_token);
    else cerrar(false);
  };

  return (
    <Modal open={open} onClose={() => cerrar(false)} title={t('equipo.invite.title')} description={t('equipo.invite.description')}>
      {token ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">{t('equipo.invite.devToken')}</p>
          <code className="break-all rounded-field bg-surface-2 px-4 py-3 font-mono text-xs">{token}</code>
          <Button size="md" onClick={() => cerrar(false)}>
            {t('common.close')}
          </Button>
        </div>
      ) : (
        <Form methods={methods} onSubmit={onSubmit} className="gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput<InvitarForm> name="nombres" label="equipo.invite.firstName" autoComplete="given-name" />
            <FormInput<InvitarForm> name="apellidos" label="equipo.invite.lastName" autoComplete="family-name" />
          </div>
          <FormInput<InvitarForm> name="correo" type="email" label="equipo.invite.email" inputMode="email" autoComplete="email" />
          <FormSelect<InvitarForm> name="rol" label="equipo.invite.role" options={ROLES.map((r) => ({ value: r, label: `equipo.rol.${r}` }))} />
          <Button type="submit" size="md" isLoading={saving}>
            {t('equipo.invite.submit')}
          </Button>
        </Form>
      )}
    </Modal>
  );
}
