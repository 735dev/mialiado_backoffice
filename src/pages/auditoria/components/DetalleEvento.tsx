import { Copy, ScanEye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { notify } from '@/lib/utils/notify';
import { useDetalleEvento } from '../hooks/useAuditoria';
import { fmtValor } from '../utils/format';

/** Detalle de un evento: tabla antes/despues de los campos que cambiaron y ficha tecnica (ID, version, dispositivo, sesion). */
export function DetalleEvento({ id }: { id: number }) {
  const t = useT();
  const { puede } = useAuth();
  const { detalle: d, isLoading, failed } = useDetalleEvento(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8" aria-busy="true">
        <Spinner size={26} className="text-primary-deep" />
      </div>
    );
  }
  if (failed || !d) return <p className="px-2 py-6 text-center text-sm text-ink-muted">{t('auditoria.detail.error')}</p>;

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(d.codigo);
      notify.toast.success(t('auditoria.detail.copied'));
    } catch {
      notify.toast.error(t('auditoria.detail.copyFailed'));
    }
  };
  const filas: [string, string | undefined][] = [
    [t('auditoria.detail.id'), d.codigo],
    [t('auditoria.detail.version'), d.detalle.version === undefined ? undefined : String(d.detalle.version)],
    [t('auditoria.detail.reason'), d.detalle.motivo],
    [t('auditoria.detail.device'), d.dispositivo ?? undefined],
    [t('auditoria.detail.session'), d.detalle.sesion],
  ];

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
      <div className="min-w-0 flex-1 rounded-card bg-surface shadow-e1">
        <h3 className="px-5 pb-3 pt-[18px] text-base font-extrabold tracking-tight">{t('auditoria.detail.changesIn', { modulo: d.modulo })}</h3>
        {d.cambios.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-ink-muted">{t('auditoria.detail.noChanges')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  {(['field', 'before', 'after'] as const).map((c) => (
                    <th key={c} scope="col" className="px-5 py-2 font-mono text-xs font-medium uppercase tracking-widest text-ink-muted">
                      {t(`auditoria.detail.${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {d.cambios.map((c) => (
                  <tr key={c.campo} className="border-t border-line">
                    <th scope="row" className="px-5 py-3 text-left font-semibold">
                      {c.campo}
                    </th>
                    <td className="px-5 py-2">
                      <span className="inline-flex min-h-8 items-center break-all rounded-pill bg-err-tint px-3.5 text-err-deep">{fmtValor(c.antes)}</span>
                    </td>
                    <td className="px-5 py-2">
                      <span className="inline-flex min-h-8 items-center break-all rounded-pill bg-primary-tint px-3.5 text-primary-deep">{fmtValor(c.despues)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <aside className="rounded-card bg-surface p-5 shadow-e1 lg:w-[340px] lg:flex-none" aria-label={t('auditoria.detail.title')}>
        <h3 className="text-base font-extrabold tracking-tight">{t('auditoria.detail.title')}</h3>
        <dl className="mt-1 text-[13px]">
          {filas
            .filter(([, valor]) => valor)
            .map(([etiqueta, valor]) => (
              <div key={etiqueta} className="flex justify-between gap-3 border-t border-line py-2.5 first:border-t-0">
                <dt className="text-ink-muted">{etiqueta}</dt>
                <dd className="break-all text-right font-semibold">{valor}</dd>
              </div>
            ))}
        </dl>
        <div className="flex flex-wrap gap-2 pt-3">
          <Button variant="secondary" size="md" onClick={() => void copiar()}>
            <Copy size={16} aria-hidden="true" />
            {t('auditoria.detail.copyId')}
          </Button>
          {d.detalle.version !== undefined && puede('niveles_reglas', 'ver') && (
            <Link
              to={PATHS.niveles}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-surface px-5 text-sm font-bold text-ink ring-1 ring-inset ring-line-strong"
            >
              <ScanEye size={16} aria-hidden="true" />
              {t('auditoria.detail.viewVersion')}
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
