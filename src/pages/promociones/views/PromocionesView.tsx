import { Check, ClipboardCheck, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { cn } from '@/lib/utils/cn';
import { notify } from '@/lib/utils/notify';
import { ColaRevision } from '../components/ColaRevision';
import { DetalleColumna } from '../components/DetalleColumna';
import { usePromociones, type FiltroTipo } from '../hooks/usePromociones';

export const routeName = PATHS.promociones;

const TABS: FiltroTipo[] = ['todas', 'descuento', 'flash'];

/** B07 Promociones, moderacion: cola de revision + detalle con reglas automaticas; aprobar, pedir cambios y rechazar (B17). */
export default function PromocionesView() {
  const t = useT();
  const { puede } = useAuth();
  const m = usePromociones();
  const puedeAprobar = puede('promociones', 'aprobar');
  const detalleRef = useRef<HTMLDivElement>(null);
  const sinAlertas = m.conteos?.sin_alertas ?? 0;

  // En movil el detalle queda debajo de la cola: al elegir otra promocion se lleva la vista hasta el.
  const primera = useRef(true);
  useEffect(() => {
    if (primera.current) {
      primera.current = false;
      return;
    }
    detalleRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [m.activeId]);

  const aprobarSinAlertas = () =>
    notify.confirm(t(sinAlertas === 1 ? 'promociones.sinAlertas.confirmarUno' : 'promociones.sinAlertas.confirmar', { n: sinAlertas }), () => void m.aprobarLasSinAlertas((n) => t(n === 1 ? 'promociones.sinAlertas.hechoUno' : 'promociones.sinAlertas.hecho', { n })));

  const conteo = (tab: FiltroTipo) => (tab === 'todas' ? m.conteos?.todas : m.conteos?.[tab]);

  return (
    <section data-screen="B07" className="flex max-w-[1200px] flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{t('nav.group.operacion')}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('promociones.title')}</h1>
          <p className="text-ink-muted">{(() => { const n = m.conteos?.todas ?? m.total; return t(n === 1 ? 'promociones.subtituloUno' : 'promociones.subtitle', { n }); })()}</p>
        </div>
        <div className="flex flex-wrap gap-3">
        {puede('niveles_reglas') && (
          <Link to={PATHS.niveles} className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-surface px-[22px] text-sm font-bold text-ink ring-1 ring-inset ring-line-strong">
            <SlidersHorizontal size={18} aria-hidden="true" />
            {t('promociones.reglasAuto')}
          </Link>
        )}
        <Button size="md" variant="primary" disabled={!puedeAprobar || sinAlertas === 0 || m.busy} onClick={aprobarSinAlertas} className="bg-ink text-bg">
          <Check size={18} aria-hidden="true" />
          {t(sinAlertas === 1 ? 'promociones.sinAlertas.botonUno' : 'promociones.sinAlertas.boton', { n: sinAlertas })}
        </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label={t('promociones.tabs.label')} className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={m.tipo === tab}
              onClick={() => m.setTipo(tab)}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-pill px-4 text-sm font-bold ring-1 ring-inset',
                m.tipo === tab ? 'bg-ink text-bg ring-transparent' : 'bg-surface text-ink ring-line-strong',
              )}
            >
              {t(`promociones.tabs.${tab}`)}
              {conteo(tab) !== undefined && (
                <span className={cn('rounded-pill px-2 text-xs', m.tipo === tab ? 'bg-primary text-primary-on' : 'bg-surface-2 text-ink-soft')}>{conteo(tab)}</span>
              )}
            </button>
          ))}
        </div>
        <p className="ml-auto text-sm text-ink-muted">{t('promociones.mostrando', { n: m.items.length, total: m.total })}</p>
      </div>

      {m.isLoading && m.items.length === 0 ? (
        <div className="flex items-center justify-center gap-3 py-24 text-ink-muted" aria-live="polite">
          <Spinner />
          {t('common.loading')}
        </div>
      ) : m.items.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={44} />}
          title={t('promociones.vacio.titulo')}
          description={t(m.tipo === 'todas' ? 'promociones.vacio.texto' : 'promociones.vacio.textoTipo')}
          action={
            <Button variant="secondary" size="md" onClick={m.reload}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <ColaRevision
            items={m.items}
            total={m.total}
            activeId={m.activeId}
            isLoading={m.isLoading}
            restantes={m.restantes}
            onSelect={m.seleccionar}
            onMore={m.loadMore}
          />
          <div ref={detalleRef} className="min-w-0 scroll-mt-4">
            <DetalleColumna
              detalle={m.detalle}
              puedeAprobar={puedeAprobar && !m.isLoading}
              busy={m.busy}
              onRetry={m.reintentarDetalle}
              onAprobar={(id) => void m.aprobar(id, t('promociones.acciones.aprobada'))}
              onRechazar={(id, motivo, comentario) => m.rechazar(id, motivo, comentario, t('promociones.rechazo.hecho'))}
              onPedirCambios={(id, comentario) => m.pedirCambios(id, comentario, t('promociones.acciones.cambiosPedidos'))}
            />
          </div>
        </div>
      )}
    </section>
  );
}
