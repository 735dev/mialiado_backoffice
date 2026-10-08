import { BarChart3, Search, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { cn } from '@/lib/utils/cn';
import { notify } from '@/lib/utils/notify';
import type { ImpulsoFila } from '@/providers/impulsosProvider';
import { CampanasTabla } from '../components/CampanasTabla';
import { EstadoCampanasCard } from '../components/EstadoCampanasCard';
import { GastoChart } from '../components/GastoChart';
import { KpiCards } from '../components/KpiCards';
import { integer } from '../format';
import { useImpulsos, type FiltroEstado } from '../hooks/useImpulsos';

export const routeName = PATHS.impulsos;

const TABS: FiltroEstado[] = ['todas', 'en_curso', 'finalizada', 'pausada'];

/** B08 Impulsos: KPIs y grafico del periodo, campanas por estado y lista paginada con pausar/reanudar. */
export default function ImpulsosView() {
  const t = useT();
  const { lang } = useLang();
  const { puede } = useAuth();
  const m = useImpulsos();
  const puedeEditar = puede('impulsos', 'editar');
  const from = m.total === 0 ? 0 : (m.page - 1) * m.limit + 1;
  const to = Math.min(m.total, (m.page - 1) * m.limit + m.items.length);

  const pausar = (i: ImpulsoFila) => notify.confirm(t('impulsos.acciones.confirmarPausar', { nombre: i.comercio }), () => void m.pausar(i, t('impulsos.acciones.pausada')));
  const reanudar = (i: ImpulsoFila) => notify.confirm(t('impulsos.acciones.confirmarReanudar', { nombre: i.comercio }), () => void m.reanudar(i, t('impulsos.acciones.reanudada')));

  return (
    <section data-screen="B08" className="flex max-w-[1200px] flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{t('nav.group.operacion')}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('impulsos.title')}</h1>
          <p className="text-ink-muted">{t('impulsos.subtitle')}</p>
        </div>
        <Link to={PATHS.reportes} className="inline-flex h-11 items-center justify-center gap-2 rounded-pill bg-surface px-5 text-sm font-bold text-ink ring-1 ring-inset ring-line-strong">
          <BarChart3 size={18} aria-hidden="true" />
          {t('impulsos.verReportes')}
        </Link>
      </header>

      {m.resumenError && !m.resumen ? (
        <EmptyState
          className="rounded-card bg-surface shadow-e1"
          title={t('impulsos.resumenError')}
          action={
            <Button size="md" onClick={m.reintentarResumen}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : (
        <>
          <KpiCards resumen={m.resumen} loading={m.resumenCargando} />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <GastoChart resumen={m.resumen} dias={m.dias} onDias={m.setDias} loading={m.resumenCargando} />
            <EstadoCampanasCard resumen={m.resumen} />
          </div>
        </>
      )}

      <section aria-labelledby="campanas-titulo" className="overflow-hidden rounded-card bg-surface shadow-e1">
        <header className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <h2 id="campanas-titulo" className="px-1 text-xl font-extrabold tracking-tight">{t('impulsos.lista.titulo')}</h2>
          <div role="tablist" aria-label={t('impulsos.lista.filtrar')} className="flex flex-none gap-1 overflow-x-auto rounded-pill bg-surface-2 p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={m.estado === tab}
                onClick={() => m.setEstado(tab)}
                className={cn('h-10 flex-none rounded-pill px-4 text-sm font-semibold', m.estado === tab ? 'bg-surface font-bold text-ink shadow-e1' : 'text-ink-muted hover:text-ink')}
              >
                {t(`impulsos.lista.tabs.${tab}`)}
              </button>
            ))}
          </div>
          <label className="relative min-w-0 flex-1 lg:max-w-xs lg:ml-auto">
            <span className="sr-only">{t('impulsos.lista.buscar')}</span>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={m.busqueda}
              onChange={(e) => m.setBusqueda(e.target.value)}
              placeholder={t('impulsos.lista.buscar')}
              className="h-11 w-full rounded-pill border-[1.5px] border-line-strong bg-surface pl-11 pr-4 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-primary-deep focus:ring-1 focus:ring-primary-deep"
            />
          </label>
        </header>

        {m.isLoading && m.items.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-16 text-ink-muted" aria-live="polite">
            <Spinner />
            {t('common.loading')}
          </div>
        ) : m.items.length === 0 ? (
          <EmptyState
            icon={<Zap size={40} />}
            title={t(m.hayFiltros ? 'impulsos.vacio.filtrosTitulo' : 'impulsos.vacio.titulo')}
            description={t(m.hayFiltros ? 'impulsos.vacio.filtrosTexto' : 'impulsos.vacio.texto')}
            action={
              <Button variant="secondary" size="md" onClick={m.hayFiltros ? m.limpiar : m.reload}>
                {t(m.hayFiltros ? 'impulsos.vacio.limpiar' : 'common.retry')}
              </Button>
            }
          />
        ) : (
          <CampanasTabla items={m.items} isLoading={m.isLoading} puedeEditar={puedeEditar} busyId={m.busyId} onPausar={pausar} onReanudar={reanudar} />
        )}

        {!puedeEditar && m.items.length > 0 && <p className="border-t border-line px-5 py-3 text-sm text-ink-soft">{t('impulsos.soloLectura')}</p>}
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-line p-4 text-sm text-ink-muted sm:flex-row">
          <p>{t('impulsos.lista.mostrando', { desde: integer(from, lang), hasta: integer(to, lang), total: integer(m.total, lang) })}</p>
          <PaginatedComplete page={m.page} limit={m.limit} total={m.total} links={m.links} onPageChange={m.setPage} />
        </footer>
      </section>
    </section>
  );
}
