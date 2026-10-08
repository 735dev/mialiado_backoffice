import { Send } from 'lucide-react';
import { useState } from 'react';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormTextarea } from '@/components/form/FormTextarea';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';
import type { UsuarioDetalle } from '@/providers/usuariosProvider';
import { mensajeSchema, type MensajeValues } from '../schemas/usuarios';
import { Modal } from './Modal';

interface Props {
  usuario: UsuarioDetalle;
  open: boolean;
  onClose: () => void;
  onSubmit: (v: MensajeValues) => Promise<boolean>;
}

/** Mensaje directo al usuario (notificacion + push): titulo de hasta 40 y texto de hasta 120 caracteres. */
export function MensajeModal({ usuario, open, onClose, onSubmit }: Props) {
  const t = useT();
  const [busy, setBusy] = useState(false);
  const methods = useZodForm<MensajeValues>(mensajeSchema, { titulo: '', mensaje: '' });
  const mensaje = methods.watch('mensaje') ?? '';

  const submit = async (v: MensajeValues) => {
    setBusy(true);
    const ok = await onSubmit(v);
    setBusy(false);
    if (ok) {
      methods.reset();
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={t('usuarios.mensaje.titulo')} subtitle={`${usuario.nombre} · @${usuario.usuario}`} icon={<Send size={22} />}>
      <Form methods={methods} onSubmit={submit}>
        <FormInput<MensajeValues> name="titulo" label="usuarios.mensaje.campoTitulo" placeholder="usuarios.mensaje.tituloEjemplo" />
        <FormTextarea<MensajeValues> name="mensaje" label="usuarios.mensaje.campoMensaje" placeholder="usuarios.mensaje.mensajeEjemplo" rows={3} />
        <p className="-mt-3 text-right text-xs text-ink-muted">{mensaje.length} / 120</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" size="md" isLoading={busy}>
            <Send size={16} aria-hidden="true" />
            {t('usuarios.mensaje.enviar')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
