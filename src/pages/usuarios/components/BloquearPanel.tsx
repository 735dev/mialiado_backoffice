import { Ban, LockOpen } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { UsuarioDetalle } from '@/providers/usuariosProvider';
import { MOTIVOS_BLOQUEO, bloqueoSchema } from '../schemas/usuarios';

interface Props {
  usuario: UsuarioDetalle;
  puedeEditar: boolean;
  busy: boolean;
  onBloquear: (motivo: string) => void;
  onDesbloquear: () => void;
}

/** Panel inferior de B06: motivo + "Bloquear con motivo", o el motivo vigente + "Desbloquear". Ambas piden confirmacion. */
export function BloquearPanel({ usuario, puedeEditar, busy, onBloquear, onDesbloquear }: Props) {
  const t = useT();
  const [motivo, setMotivo] = useState<(typeof MOTIVOS_BLOQUEO)[number]>('abuso_cupones');
  const [detalle, setDetalle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const bloqueado = usuario.estado === 'Bloqueado';

  const submit = () => {
    const parsed = bloqueoSchema.safeParse({ motivo, detalle });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'errors.invalid');
      return;
    }
    setError(null);
    onBloquear(motivo === 'otro' ? (parsed.data.detalle ?? '') : t(`usuarios.bloqueo.motivos.${motivo}`));
  };

  return (
    <section aria-labelledby="bloqueo-titulo" className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-e1 lg:flex-row lg:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-err-tint text-err-deep">
          {bloqueado ? <LockOpen size={22} aria-hidden="true" /> : <Ban size={22} aria-hidden="true" />}
        </span>
        <div className="min-w-0">
          <h2 id="bloqueo-titulo" className="text-lg font-extrabold tracking-tight">
            {t(bloqueado ? 'usuarios.bloqueo.tituloBloqueado' : 'usuarios.bloqueo.titulo')}
          </h2>
          <p className="text-sm text-ink-muted">
            {bloqueado ? t('usuarios.bloqueo.motivoVigente', { motivo: usuario.motivo_bloqueo ?? '-' }) : t('usuarios.bloqueo.ayuda')}
          </p>
        </div>
      </div>

      {bloqueado ? (
        <Button variant="secondary" size="md" disabled={!puedeEditar} isLoading={busy} onClick={onDesbloquear}>
          <LockOpen size={18} aria-hidden="true" />
          {t('usuarios.bloqueo.desbloquear')}
        </Button>
      ) : (
        <div className="flex flex-col gap-3 lg:items-end">
          <div role="radiogroup" aria-label={t('usuarios.bloqueo.motivo')} className="flex flex-wrap gap-2">
            {MOTIVOS_BLOQUEO.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={motivo === m}
                disabled={!puedeEditar}
                onClick={() => setMotivo(m)}
                className={cn(
                  'h-10 rounded-pill px-4 text-sm font-semibold disabled:opacity-50',
                  motivo === m ? 'bg-ink text-bg' : 'bg-surface text-ink ring-1 ring-inset ring-line-strong',
                )}
              >
                {t(`usuarios.bloqueo.motivos.${m}`)}
              </button>
            ))}
          </div>
          {motivo === 'otro' && (
            <div className="w-full">
              <Textarea
                aria-label={t('usuarios.bloqueo.detalle')}
                placeholder={t('usuarios.bloqueo.detalle')}
                value={detalle}
                maxLength={200}
                hasError={Boolean(error)}
                onChange={(e) => setDetalle(e.target.value)}
                className="min-h-20"
              />
              {error && (
                <small role="alert" className="text-sm font-medium text-err">
                  {t(error)}
                </small>
              )}
            </div>
          )}
          <Button variant="danger" size="md" disabled={!puedeEditar} isLoading={busy} onClick={submit}>
            <Ban size={18} aria-hidden="true" />
            {t('usuarios.bloqueo.bloquear')}
          </Button>
        </div>
      )}
    </section>
  );
}
