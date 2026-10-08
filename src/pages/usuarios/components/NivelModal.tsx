import { SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Form } from '@/components/form/Form';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';
import type { UsuarioDetalle } from '@/providers/usuariosProvider';
import { nivelSchema, type NivelValues } from '../schemas/usuarios';
import { Modal } from './Modal';

interface Props {
  usuario: UsuarioDetalle;
  open: boolean;
  onClose: () => void;
  onSubmit: (nivel: NivelValues['nivel'], motivo: string) => Promise<boolean>;
}

const OPCIONES = [
  { value: 'auto', label: 'usuarios.nivel.auto' },
  { value: 'aliado', label: 'Aliado' },
  { value: 'aliadopro', label: 'AliadoPro' },
  { value: 'aliadoplus', label: 'AliadoPlus' },
];

/** Ajuste manual de nivel (B06): `auto` vuelve al calculo por compras. El motivo queda en auditoria y avisa al usuario. */
export function NivelModal({ usuario, open, onClose, onSubmit }: Props) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const methods = useZodForm<NivelValues>(nivelSchema, { nivel: usuario.nivel_forzado ?? 'auto', motivo: '' });

  const submit = async (v: NivelValues) => {
    setBusy(true);
    const ok = await onSubmit(v.nivel, v.motivo);
    setBusy(false);
    if (ok) {
      methods.reset({ nivel: v.nivel, motivo: '' });
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('usuarios.nivel.titulo')} subtitle={`${usuario.nombre} · @${usuario.usuario}`} icon={<SlidersHorizontal size={22} />}>
      <Form methods={methods} onSubmit={submit}>
        <FormSelect<NivelValues> name="nivel" label="usuarios.nivel.campo" options={OPCIONES} hint="usuarios.nivel.ayuda" />
        <FormTextarea<NivelValues> name="motivo" label="usuarios.nivel.motivo" placeholder="usuarios.nivel.motivoEjemplo" rows={3} />
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" size="md" isLoading={busy}>
            {t('usuarios.nivel.guardar')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
