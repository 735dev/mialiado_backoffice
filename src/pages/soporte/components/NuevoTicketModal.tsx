import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Form } from '@/components/form/Form';
import { FormInput } from '@/components/form/FormInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextarea } from '@/components/form/FormTextarea';
import { useZodForm } from '@/components/form/useZodForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useT } from '@/lib/hooks/useT';
import { applyServerErrors } from '@/lib/utils/applyServerErrors';
import { notify } from '@/lib/utils/notify';
import { useDebounced } from '../hooks/useDebounced';
import { PRIORIDADES, type UsuarioBusqueda } from '../models/ticket';
import { buscarUsuarios, crearTicket } from '../providers/soporteProvider';
import { nuevoTicketSchema, type NuevoTicketForm } from '../schemas/soporteSchemas';
import { Avatar } from './Avatar';
import { Modal } from './Modal';

interface NuevoTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

/** Abre un ticket a nombre del equipo: se busca a la persona (GET /usuarios?q=) y se redacta el primer mensaje. */
export function NuevoTicketModal({ open, onOpenChange, onCreated }: NuevoTicketModalProps) {
  const t = useT();
  const methods = useZodForm<NuevoTicketForm>(nuevoTicketSchema, { asunto: '', mensaje: '', prioridad: 'media' });
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<UsuarioBusqueda[]>([]);
  const [elegido, setElegido] = useState<UsuarioBusqueda | null>(null);
  const [saving, setSaving] = useState(false);
  const q = useDebounced(busqueda);
  const personaError = methods.formState.errors.usuario_id?.message;

  useEffect(() => {
    if (!open || elegido || q.trim().length < 2) return;
    let cancelled = false;
    void buscarUsuarios(q).then((res) => {
      if (!cancelled) setResultados(res.ok ? res.data : []);
    });
    return () => {
      cancelled = true;
    };
  }, [q, open, elegido]);

  const elegir = (u: UsuarioBusqueda) => {
    setElegido(u);
    setResultados([]);
    methods.setValue('usuario_id', u.id, { shouldValidate: true });
  };

  const quitar = () => {
    setElegido(null);
    setBusqueda('');
    methods.resetField('usuario_id');
  };

  const onSubmit = async (v: NuevoTicketForm) => {
    setSaving(true);
    const res = await crearTicket({ ...v, asunto: v.asunto.trim(), mensaje: v.mensaje.trim() });
    setSaving(false);
    if (!res.ok) {
      applyServerErrors(methods.setError, res);
      notify.fromApiError(res);
      return;
    }
    notify.toast.success(t('soporte.newTicket.created'));
    methods.reset();
    quitar();
    onOpenChange(false);
    onCreated();
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={t('soporte.newTicket.title')} description={t('soporte.newTicket.description')}>
      <Form methods={methods} onSubmit={onSubmit} className="gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="nuevo-ticket-persona" className="text-sm font-semibold text-ink-soft">
            {t('soporte.newTicket.person')}
          </label>
          {elegido ? (
            <div className="flex items-center gap-3 rounded-field border-[1.5px] border-line-strong px-4 py-2.5">
              <Avatar nombre={elegido.nombre} size={36} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold">{elegido.nombre}</div>
                <div className="truncate text-xs text-ink-muted">@{elegido.usuario}</div>
              </div>
              <button type="button" aria-label={t('soporte.newTicket.change')} onClick={quitar} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Input
                id="nuevo-ticket-persona"
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder={t('soporte.newTicket.personPlaceholder')}
                hasError={Boolean(personaError)}
                prefix={<Search size={18} aria-hidden="true" />}
              />
              {resultados.length > 0 && (
                <ul className="max-h-48 overflow-y-auto rounded-field border border-line" role="listbox" aria-label={t('soporte.newTicket.results')}>
                  {resultados.map((u) => (
                    <li key={u.id} role="option" aria-selected={false}>
                      <button type="button" onClick={() => elegir(u)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-surface-2">
                        <Avatar nombre={u.nombre} size={32} />
                        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{u.nombre}</span>
                        <span className="text-xs text-ink-muted">@{u.usuario}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {personaError && (
                <small role="alert" className="text-sm font-medium text-err">
                  {t(personaError)}
                </small>
              )}
            </>
          )}
        </div>
        <FormInput<NuevoTicketForm> name="asunto" label="soporte.newTicket.subject" />
        <FormTextarea<NuevoTicketForm> name="mensaje" label="soporte.newTicket.message" rows={4} />
        <FormSelect<NuevoTicketForm> name="prioridad" label="soporte.newTicket.priority" options={PRIORIDADES.map((p) => ({ value: p, label: `soporte.prioridad.${p}` }))} />
        <Button type="submit" size="md" isLoading={saving}>
          {t('soporte.newTicket.submit')}
        </Button>
      </Form>
    </Modal>
  );
}
