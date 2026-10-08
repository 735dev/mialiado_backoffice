import { useState } from 'react';
import { Form } from '@/components/form/Form';
import { FormSelect } from '@/components/form/FormSelect';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { ROLES } from '@/lib/constants/roles';
import { useT } from '@/lib/hooks/useT';
import { applyServerErrors } from '@/lib/utils/applyServerErrors';
import { notify } from '@/lib/utils/notify';
import type { CambiosMiembro, Miembro } from '../models/equipo';
import { actualizarMiembro } from '../providers/equipoProvider';
import { editarSchema, type EditarForm } from '../schemas/equipoSchemas';
import { Modal } from '@/components/ui/Modal';

interface Props {
  miembro: Miembro | null;
  onClose: () => void;
  onSaved: () => void;
}

function Contenido({ miembro, onClose, onSaved }: { miembro: Miembro; onClose: () => void; onSaved: () => void }) {
  const t = useT();
  const methods = useZodForm<EditarForm>(editarSchema, { rol: miembro.rol, estado: miembro.estado === 'S' ? 'S' : 'A' });
  const [saving, setSaving] = useState(false);

  const onSubmit = async (v: EditarForm) => {
    // Solo se envia lo que cambio: el servidor rechaza tocar tu propio acceso o dejar el panel sin administrador.
    const cambios: CambiosMiembro = {};
    if (v.rol !== miembro.rol) cambios.rol = v.rol;
    if (miembro.estado !== 'P' && v.estado !== (miembro.estado === 'S' ? 'S' : 'A')) cambios.estado = v.estado;
    if (Object.keys(cambios).length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    const res = await actualizarMiembro(miembro.id, cambios);
    setSaving(false);
    if (!res.ok) {
      applyServerErrors(methods.setError, res);
      notify.fromApiError(res);
      return;
    }
    notify.toast.success(t('equipo.edit.saved'));
    onSaved();
    onClose();
  };

  return (
    <Form methods={methods} onSubmit={onSubmit} className="gap-4">
      <FormSelect<EditarForm> name="rol" label="equipo.edit.role" options={ROLES.map((r) => ({ value: r, label: `equipo.rol.${r}` }))} />
      {miembro.estado !== 'P' && (
        <FormSelect<EditarForm>
          name="estado"
          label="equipo.edit.access"
          options={[
            { value: 'A', label: 'equipo.edit.accessActive' },
            { value: 'S', label: 'equipo.edit.accessSuspended' },
          ]}
        />
      )}
      <Button type="submit" size="md" isLoading={saving}>
        {t('common.save')}
      </Button>
    </Form>
  );
}

export function EditarMiembroModal({ miembro, onClose, onSaved }: Props) {
  const t = useT();
  return (
    <Modal
      open={miembro !== null}
      onClose={onClose}
      title={t('equipo.edit.title')}
      description={miembro ? `${miembro.nombre} · ${miembro.correo}` : ''}
    >
      {miembro && <Contenido key={miembro.id} miembro={miembro} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  );
}
