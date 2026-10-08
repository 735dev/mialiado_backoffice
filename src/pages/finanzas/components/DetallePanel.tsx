import { Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useT } from '@/lib/hooks/useT';
import { useFormato } from '../hooks/useFormato';
import type { Accion } from '../hooks/useAccionesFinanzas';
import type { EventoLinea, RecargaDetalle } from '../models/finanzas';
import { formatMinutes, metodoKey } from '../utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { EstadoBadge } from './EstadoBadge';

interface DetallePanelProps {
  detalle: RecargaDetalle | null;
  isLoading: boolean;
  hasError: boolean;
  canApprove: boolean;
  busy: Accion | null;
  onAcreditar: () => void;
  onReembolsar: () => void;
  onRetry: () => void;
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className={strong ? 'font-extrabold tabular-nums' : 'text-right text-sm font-semibold tabular-nums'}>{value}</span>
    </div>
  );
}

function Evento({ e }: { e: EventoLinea }) {
  const t = useT();
  const { dateTime } = useFormato();
  let when = '';
  if (e.fecha) when = dateTime(e.fecha);
  else if (typeof e.hace_min === 'number') {
    const { h, m } = formatMinutes(e.hace_min);
    when = h > 0 ? t('finanzas.detalle.haceHm', { h, m }) : t('finanzas.detalle.haceM', { m });
  }
  return (
    <li className="relative flex gap-3 pb-4 last:pb-0">
      <span aria-hidden="true" className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-primary-deep" />
      <div>
        <div className="text-sm font-bold">{e.evento}</div>
        {when && <div className="text-xs text-ink-muted">{when}</div>}
      </div>
    </li>
  );
}

/** Detalle de la transaccion elegida: monto, billetera antes/despues, linea de tiempo y acciones de aprobar. */
export function DetallePanel({ detalle, isLoading, hasError, canApprove, busy, onAcreditar, onReembolsar, onRetry }: DetallePanelProps) {
  const t = useT();
  const { money, dateTime } = useFormato();

  if (!detalle) {
    return (
      <div className="rounded-panel bg-surface p-4 shadow-e1" aria-busy={isLoading}>
        {hasError ? (
          <EmptyState
            title={t('finanzas.detalle.errorTitulo')}
            description={t('finanzas.detalle.errorTexto')}
            action={
              <Button size="md" variant="secondary" onClick={onRetry}>
                {t('common.retry')}
              </Button>
            }
            className="py-8"
          />
        ) : isLoading ? (
          <div className="flex h-48 items-center justify-center text-ink-muted">
            <Spinner />
          </div>
        ) : (
          <EmptyState title={t('finanzas.detalle.vacioTitulo')} description={t('finanzas.detalle.vacioTexto')} className="py-8" />
        )}
      </div>
    );
  }

  const mk = metodoKey(detalle.metodo);
  const metodo = mk ? t(mk) : detalle.metodo;
  const pendiente = detalle.estado === 'pendiente';
  const acreditada = detalle.estado === 'acreditada';

  return (
    <aside aria-label={t('finanzas.detalle.titulo')} aria-busy={isLoading} className="flex flex-col gap-5 rounded-panel bg-surface p-5 shadow-e1">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-bold uppercase tracking-wider text-ink-muted">{t('finanzas.detalle.titulo')}</span>
        <EstadoBadge estado={detalle.estado} />
      </div>

      <div className="flex items-center gap-3">
        <Avatar name={detalle.comercio.nombre} src={detalle.comercio.logo_url} tone="primary" size={44} />
        <div className="min-w-0">
          <div className="truncate font-extrabold">{detalle.comercio.nombre}</div>
          <div className="font-mono text-xs text-ink-muted">{detalle.referencia}</div>
        </div>
      </div>

      <div className="rounded-card bg-bg p-4">
        <div className="text-xs font-bold uppercase tracking-wider text-ink-muted">
          {pendiente ? t('finanzas.detalle.montoAcreditar') : t('finanzas.detalle.monto')}
        </div>
        <div className="mt-1 text-3xl font-extrabold tracking-tight">{money(detalle.monto)}</div>
        <div className="text-sm text-ink-muted">{t('finanzas.detalle.metodoComision', { metodo, comision: money(detalle.comision) })}</div>
      </div>

      <div className="divide-y divide-line">
        <Row label={t('finanzas.detalle.billeteraActual')} value={money(detalle.saldo_actual)} />
        {detalle.saldo_tras_acreditar !== null && <Row label={t('finanzas.detalle.saldoTras')} value={money(detalle.saldo_tras_acreditar)} />}
        <Row label={t('finanzas.detalle.fecha')} value={dateTime(detalle.created_at)} />
        {detalle.proveedor_ref && <Row label={t('finanzas.detalle.referencia', { metodo })} value={detalle.proveedor_ref} />}
        {detalle.conciliado_por && <Row label={t('finanzas.detalle.conciliadoPor')} value={detalle.conciliado_por} />}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-muted">{t('finanzas.detalle.lineaTiempo')}</h3>
        <ol>
          {detalle.linea_de_tiempo.map((e, i) => (
            <Evento key={`${e.evento}-${i}`} e={e} />
          ))}
        </ol>
      </div>

      {canApprove && (pendiente || acreditada) && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          {pendiente && (
            <Button size="md" onClick={onAcreditar} isLoading={busy === 'acreditar'} disabled={busy !== null}>
              {t('finanzas.detalle.acreditar')}
            </Button>
          )}
          {acreditada && (
            <Button size="md" variant="danger" onClick={onReembolsar} disabled={busy !== null}>
              <Undo2 size={16} aria-hidden="true" />
              {t('finanzas.detalle.reembolsar')}
            </Button>
          )}
          <p className="text-xs text-ink-muted">{t('finanzas.detalle.auditoria')}</p>
        </div>
      )}
    </aside>
  );
}
