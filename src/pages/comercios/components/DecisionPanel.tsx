import { Check, CheckCircle2, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { ComercioDetalle } from '@/providers/comerciosProvider';

export interface ChecklistState {
  direccion: boolean;
  contacto: boolean;
}

interface Props {
  c: ComercioDetalle;
  checklist: ChecklistState;
  puedeEditar: boolean;
  puedeAprobar: boolean;
  busy: boolean;
  revisionIniciada: boolean;
  onToggleDoc: (tipo: 'rif' | 'registro' | 'fachada') => void;
  onToggleLocal: (k: keyof ChecklistState) => void;
  onRevision: () => void;
  onAprobar: () => void;
  onRechazar: () => void;
}

const DOC_ITEMS = ['rif', 'registro', 'fachada'] as const;

function Item({ checked, label, disabled, onClick }: { checked: boolean; label: string; disabled?: boolean; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={onClick}
        className="flex min-h-11 w-full items-center gap-3 rounded-field px-1 text-left text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={cn(
            'flex h-6 w-6 flex-none items-center justify-center rounded-lg',
            checked ? 'bg-primary text-primary-on' : 'bg-surface ring-[1.5px] ring-inset ring-line-strong',
          )}
        >
          {checked && <Check size={14} strokeWidth={3} aria-hidden="true" />}
        </span>
        {label}
      </button>
    </li>
  );
}

function Estado({ c }: { c: ComercioDetalle }) {
  const t = useT();
  if (c.verificacion === 'verificado') {
    return (
      <p className="flex items-center gap-2 rounded-field bg-primary-tint p-3 text-sm font-semibold text-primary-deep">
        <CheckCircle2 size={18} aria-hidden="true" />
        {t('comercios.decision.verificado')}
      </p>
    );
  }
  if (c.verificacion === 'rechazado') {
    return (
      <p className="rounded-field bg-err-tint p-3 text-sm font-semibold text-err-deep">
        {t('comercios.decision.rechazado')}
        {c.motivo_rechazo ? `: ${c.motivo_rechazo}` : ''}
      </p>
    );
  }
  return null;
}

/** Panel "Decision" de B04: checklist de 5 puntos, aprobar y rechazar (B17). Respeta los permisos editar/aprobar. */
export function DecisionPanel(p: Props) {
  const t = useT();
  const { c } = p;
  const docOk = (tipo: string) => c.documentos.some((d) => d.tipo === tipo && d.revisado);
  const items = [
    ...DOC_ITEMS.map((tipo) => ({ key: tipo, checked: docOk(tipo), label: t(`comercios.check.${tipo}`), disabled: !p.puedeEditar || p.busy || !c.documentos.some((d) => d.tipo === tipo), onClick: () => p.onToggleDoc(tipo) })),
    { key: 'direccion', checked: p.checklist.direccion, label: t('comercios.check.direccion'), disabled: false, onClick: () => p.onToggleLocal('direccion') },
    { key: 'contacto', checked: p.checklist.contacto, label: t('comercios.check.contacto'), disabled: false, onClick: () => p.onToggleLocal('contacto') },
  ];
  const hechos = items.filter((i) => i.checked).length;
  const faltan = items.length - hechos;
  const verificado = c.verificacion === 'verificado';
  const enCola = c.verificacion === 'pendiente';

  return (
    <aside className="flex flex-col gap-5 rounded-card bg-surface p-5 shadow-e1 md:p-6 xl:sticky xl:top-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{t('comercios.decision.eyebrow')}</p>
        <h2 className="mt-1 text-[19px] font-extrabold leading-6 tracking-tight">{t('comercios.decision.progreso', { n: hechos, total: items.length })}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">{faltan > 0 ? t('comercios.decision.faltan', { n: faltan }) : t('comercios.decision.completo')}</p>
        <div className="mt-3 h-2 rounded-pill bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={hechos}>
          <div className="h-2 rounded-pill bg-primary" style={{ width: `${(hechos / items.length) * 100}%` }} />
        </div>
      </div>

      <ul className="flex flex-col">
        {items.map((i) => (
          <Item key={i.key} checked={i.checked} label={i.label} disabled={i.disabled} onClick={i.onClick} />
        ))}
      </ul>

      <Estado c={c} />

      <div className="flex flex-col gap-3">
        {enCola && !p.revisionIniciada && (
          <Button variant="secondary" size="md" disabled={!p.puedeEditar || p.busy} title={p.puedeEditar ? undefined : t('comercios.sinPermisoEditar')} onClick={p.onRevision}>
            <Play size={16} aria-hidden="true" />
            {t('comercios.decision.iniciarRevision')}
          </Button>
        )}
        <Button
          size="lg"
          disabled={!p.puedeAprobar || p.busy || verificado}
          title={p.puedeAprobar ? undefined : t('comercios.sinPermisoAprobar')}
          onClick={p.onAprobar}
        >
          <Check size={18} aria-hidden="true" />
          {t('comercios.decision.aprobar')}
        </Button>
        <Button
          variant="danger"
          size="lg"
          disabled={!p.puedeAprobar || p.busy}
          title={p.puedeAprobar ? undefined : t('comercios.sinPermisoAprobar')}
          onClick={p.onRechazar}
        >
          <X size={18} aria-hidden="true" />
          {t('comercios.decision.rechazar')}
        </Button>
      </div>

      <p className="text-xs text-ink-muted">{t('comercios.decision.aviso', { nombre: c.dueno?.nombre ?? '' })}</p>
    </aside>
  );
}
