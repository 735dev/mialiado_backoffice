import { useCallback, useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { DetalleSheet } from '../components/DetalleSheet';
import { DetallePanel } from '../components/DetallePanel';
import { FinanzasHeader } from '../components/FinanzasHeader';
import { KpiCards } from '../components/KpiCards';
import { RecargasTable } from '../components/RecargasTable';
import { useAccionesFinanzas } from '../hooks/useAccionesFinanzas';
import { useFormato } from '../hooks/useFormato';
import { useExportar } from '../hooks/useExportar';
import { useRecargaDetalle } from '../hooks/useRecargaDetalle';
import { useRecargas } from '../hooks/useRecargas';
import { useResumenFinanzas } from '../hooks/useResumenFinanzas';

export const routeName = PATHS.finanzas;

type Confirmacion = 'reembolsar' | 'conciliar' | null;

/** B09 Finanzas: KPIs, movimientos paginados con filtro, detalle de la transaccion y conciliacion/reembolsos. */
export default function FinanzasView() {
  const t = useT();
  const { puede } = useAuth();
  const { money } = useFormato();
  const canApprove = puede('finanzas', 'aprobar');
  const wide = useMediaQuery('(min-width: 1280px)');

  const recargas = useRecargas();
  const resumen = useResumenFinanzas();
  const [selected, setSelected] = useState<number | null>(null);
  const [sheet, setSheet] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [confirmar, setConfirmar] = useState<Confirmacion>(null);

  const selectedId = selected ?? recargas.items[0]?.id ?? null;
  const detalle = useRecargaDetalle(selectedId, refreshKey);

  const { reload } = recargas;
  const { reload: reloadResumen } = resumen;
  const afterAction = useCallback(() => {
    reload();
    reloadResumen();
    setRefreshKey((k) => k + 1);
  }, [reload, reloadResumen]);
  const acciones = useAccionesFinanzas(afterAction);

  const pendientes = resumen.data?.kpis.pendientes ?? { cantidad: 0, monto: 0 };

  const select = (id: number) => {
    setSelected(id);
    if (!wide) setSheet(true);
  };

  const exportar = useExportar(recargas.items);

  const d = detalle.detalle;

  const panel = (
    <DetallePanel
      detalle={d}
      isLoading={detalle.isLoading}
      hasError={detalle.error !== null}
      canApprove={canApprove}
      busy={acciones.busy}
      onAcreditar={() => d && void acciones.acreditar(d.id)}
      onReembolsar={() => setConfirmar('reembolsar')}
      onRetry={() => setRefreshKey((k) => k + 1)}
    />
  );

  return (
    <section className="flex flex-col gap-6" data-screen="B09">
      <FinanzasHeader
        canApprove={canApprove}
        pendientes={pendientes.cantidad}
        busy={acciones.busy !== null}
        canExport={recargas.items.length > 0}
        onConciliar={() => setConfirmar('conciliar')}
        onExport={exportar}
      />

      <KpiCards kpis={resumen.data?.kpis ?? null} isLoading={resumen.isLoading} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <RecargasTable
          items={recargas.items}
          isLoading={recargas.isLoading}
          total={recargas.total}
          page={recargas.page}
          limit={recargas.limit}
          links={recargas.links}
          onPageChange={recargas.setPage}
          estado={recargas.estado}
          onEstado={recargas.setEstado}
          texto={recargas.texto}
          onTexto={recargas.setTexto}
          conteos={resumen.data?.conteos ?? null}
          selectedId={selectedId}
          onSelect={select}
        />
        {wide && <div className="sticky top-8">{panel}</div>}
      </div>

      {!wide && (
        <DetalleSheet open={sheet} onOpenChange={setSheet}>
          {panel}
        </DetalleSheet>
      )}

      <ConfirmDialog
        open={confirmar === 'reembolsar' && d !== null}
        title={t('finanzas.confirmar.reembolsarTitulo')}
        description={d ? t('finanzas.confirmar.reembolsarTexto', { monto: money(d.monto), comercio: d.comercio.nombre, ref: d.referencia }) : ''}
        confirmLabel={t('finanzas.detalle.reembolsar')}
        danger
        busy={acciones.busy === 'reembolsar'}
        onClose={() => setConfirmar(null)}
        onConfirm={() => {
          if (d) void acciones.reembolsar(d.id).then(() => setConfirmar(null));
        }}
      />
      <ConfirmDialog
        open={confirmar === 'conciliar'}
        title={t('finanzas.confirmar.conciliarTitulo')}
        description={t('finanzas.confirmar.conciliarTexto', { n: pendientes.cantidad, monto: money(pendientes.monto) })}
        confirmLabel={t('finanzas.conciliar', { n: pendientes.cantidad })}
        busy={acciones.busy === 'conciliar'}
        onClose={() => setConfirmar(null)}
        onConfirm={() => void acciones.conciliar().then(() => setConfirmar(null))}
      />
    </section>
  );
}
