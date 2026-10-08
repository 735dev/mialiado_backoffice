import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import type { ApiResult } from '@/lib/api/types';
import { useT } from '@/lib/hooks/useT';
import type { MotivoRechazo, PromoDetalle } from '@/providers/promocionesProvider';
import { DetallePanel } from './DetallePanel';

interface Props {
  /** null mientras carga. */
  detalle: ApiResult<PromoDetalle> | null;
  puedeAprobar: boolean;
  busy: boolean;
  onRetry: () => void;
  onAprobar: (id: number) => void;
  onRechazar: (id: number, motivo: MotivoRechazo, comentario: string | undefined) => Promise<boolean>;
  onPedirCambios: (id: number, comentario: string) => Promise<boolean>;
}

/** Columna derecha de B07: cargando, error con reintento o el detalle de la promocion seleccionada. */
export function DetalleColumna({ detalle, puedeAprobar, busy, onRetry, onAprobar, onRechazar, onPedirCambios }: Props) {
  const t = useT();
  if (!detalle) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-card bg-surface py-24 text-ink-muted shadow-e1" aria-live="polite">
        <Spinner />
        {t('common.loading')}
      </div>
    );
  }
  if (!detalle.ok) {
    return (
      <EmptyState
        className="rounded-card bg-surface shadow-e1"
        title={t('promociones.detalle.errorTitulo')}
        description={t(detalle.detail)}
        action={
          <Button size="md" onClick={onRetry}>
            {t('common.retry')}
          </Button>
        }
      />
    );
  }
  const promo = detalle.data;
  return (
    <DetallePanel
      key={promo.id}
      promo={promo}
      puedeAprobar={puedeAprobar}
      busy={busy}
      onAprobar={() => onAprobar(promo.id)}
      onRechazar={(motivo, comentario) => onRechazar(promo.id, motivo, comentario)}
      onPedirCambios={(comentario) => onPedirCambios(promo.id, comentario)}
    />
  );
}
