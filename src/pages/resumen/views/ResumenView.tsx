import { BellPlus, Download, Percent, ShoppingBag, Store, Users, WifiOff } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import type { Modulo } from '@/lib/constants/modules';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { useAppSelector } from '@/lib/store/hooks';
import type { DiasResumen } from '@/providers/resumenProvider';
import { CanjesChart } from '../components/CanjesChart';
import { KpiCard } from '../components/KpiCard';
import { PendientesCard } from '../components/PendientesCard';
import { ActividadCard, CategoriasCard, TopComerciosCard } from '../components/RankingCards';
import { useResumen } from '../hooks/useResumen';
import { formatMoney, formatNumber, formatToday, saludoDe } from '../utils/format';

export const routeName = PATHS.resumen;

const HERO_BTN = 'inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-pill px-[22px] text-sm font-bold';

function HeroLink({ to, modulo, className, children }: { to: string; modulo: Modulo; className: string; children: ReactNode }) {
  const { puede } = useAuth();
  const t = useT();
  if (puede(modulo)) {
    return (
      <Link to={to} className={`${HERO_BTN} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <span aria-disabled="true" title={t('resumen.sinPermiso')} className={`${HERO_BTN} ${className} cursor-not-allowed opacity-50`}>
      {children}
    </span>
  );
}

// B02: Resumen. Metricas, canjes por dia, pendientes, top comercios, categorias y actividad.
export default function ResumenView() {
  const t = useT();
  const { user } = useAuth();
  const lang = useAppSelector((s) => s.lang.current);
  const [dias, setDias] = useState<DiasResumen>(30);
  const { estado, refreshing, retry } = useResumen(dias);
  const now = useMemo(() => new Date(), []);
  const nombre = user?.nombre?.split(' ')[0] ?? '';

  return (
    <div data-screen="B02" className="flex flex-col gap-5">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        {t('nav.group.general')} · {t('nav.resumen')}
      </p>
      <div className="flex flex-col gap-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-primary-tint via-surface-2 to-surface p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold leading-9 tracking-tight md:text-[34px] md:leading-10">{t(`resumen.saludo.${saludoDe(now)}`, { nombre })}</h1>
          <p className="mt-1 text-ink-soft">{t('resumen.subtitulo', { fecha: formatToday(now, lang) })}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <HeroLink to={PATHS.reportes} modulo="reportes" className="bg-surface text-ink ring-1 ring-inset ring-line-strong">
            <Download size={18} aria-hidden="true" />
            {t('resumen.exportar')}
          </HeroLink>
          <HeroLink to={PATHS.notificaciones} modulo="notificaciones" className="bg-ink text-bg shadow-e2">
            <BellPlus size={18} aria-hidden="true" />
            {t('resumen.nuevaComunicacion')}
          </HeroLink>
        </div>
      </div>

      {estado.status === 'loading' && (
        <div className="flex justify-center py-24 text-primary-deep" aria-live="polite">
          <Spinner size={36} />
        </div>
      )}

      {estado.status === 'error' && (
        <div className="rounded-card bg-surface shadow-e1">
          <EmptyState
            icon={<WifiOff size={36} aria-hidden="true" />}
            title={t('resumen.error.title')}
            description={estado.error.status === 403 ? t('resumen.sinPermiso') : t(estado.error.detail)}
            action={
              <Button size="md" variant="secondary" onClick={retry}>
                {t('common.retry')}
              </Button>
            }
          />
        </div>
      )}

      {estado.status === 'ok' && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label={t('resumen.kpi.usuarios')} icon={Users} kpi={estado.data.kpis.usuarios_activos} value={formatNumber(estado.data.kpis.usuarios_activos.valor, lang)} />
            <KpiCard label={t('resumen.kpi.canjes')} icon={ShoppingBag} kpi={estado.data.kpis.canjes_mes} value={formatNumber(estado.data.kpis.canjes_mes.valor, lang)} />
            <KpiCard label={t('resumen.kpi.comercios')} icon={Store} kpi={estado.data.kpis.comercios_activos} value={formatNumber(estado.data.kpis.comercios_activos.valor, lang)} />
            <KpiCard label={t('resumen.kpi.ingresos')} icon={Percent} kpi={estado.data.kpis.ingresos_impulsos} value={formatMoney(estado.data.kpis.ingresos_impulsos.valor, lang)} />
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,676fr)_minmax(0,380fr)]">
            <CanjesChart
              serie={estado.data.canjes_por_dia.serie}
              total={estado.data.canjes_por_dia.serie.reduce((a, p) => a + p.canjes, 0)}
              dias={dias}
              onDias={setDias}
              lang={lang}
              loading={refreshing}
            />
            <PendientesCard pendientes={estado.data.pendientes} />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            <TopComerciosCard items={estado.data.top_comercios} lang={lang} />
            <CategoriasCard items={estado.data.canjes_por_categoria} total={estado.data.kpis.canjes_mes.valor} lang={lang} />
            <ActividadCard items={estado.data.actividad_reciente} now={now} />
          </div>
        </>
      )}
    </div>
  );
}
