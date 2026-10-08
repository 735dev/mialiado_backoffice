import { Download, Plus, SearchX, Store } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { useAppSelector } from '@/lib/store/hooks';
import { ComerciosTable } from '../components/ComerciosTable';
import { FiltrosBar } from '../components/FiltrosBar';
import { InvitarModal } from '../components/InvitarModal';
import { useComerciosLista } from '../hooks/useComerciosLista';

export const routeName = PATHS.comercios;

const BTN = 'inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-pill px-[22px] text-sm font-bold';

// B03: Comercios. Lista paginada con pestanas, busqueda por nombre/RIF y filtros de categoria y zona.
export default function ComerciosView() {
  const t = useT();
  const { puede } = useAuth();
  const lang = useAppSelector((s) => s.lang.current);
  const { filtros, patch, limpiar, hayFiltros, conteos, categorias, zonas, lista, buscando } = useComerciosLista();
  const [invitando, setInvitando] = useState(false);
  const puedeEditar = puede('comercios', 'editar');
  const loading = lista.isLoading || buscando;
  const first = lista.total === 0 ? 0 : (lista.page - 1) * lista.limit + 1;
  const last = Math.min(lista.total, (lista.page - 1) * lista.limit + lista.items.length);

  return (
    <div data-screen="B03" className="flex flex-col gap-5">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">
        {t('nav.group.operacion')} · {t('nav.comercios')}
      </p>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold leading-9 tracking-tight md:text-[34px] md:leading-10">{t('comercios.title')}</h1>
          <p className="mt-1 text-ink-muted">{t('comercios.subtitulo')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {puede('reportes') ? (
            <Link to={PATHS.reportes} className={`${BTN} bg-surface text-ink ring-1 ring-inset ring-line-strong`}>
              <Download size={18} aria-hidden="true" />
              {t('comercios.exportar')}
            </Link>
          ) : null}
          <button
            type="button"
            disabled={!puedeEditar}
            title={puedeEditar ? undefined : t('comercios.sinPermisoEditar')}
            onClick={() => setInvitando(true)}
            className={`${BTN} bg-primary text-primary-on disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Plus size={18} aria-hidden="true" />
            {t('comercios.invitar.boton')}
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-card bg-surface shadow-e1" aria-busy={loading || undefined}>
        <FiltrosBar filtros={filtros} conteos={conteos} categorias={categorias} zonas={zonas} onChange={patch} />

        {loading && lista.items.length === 0 ? (
          <div className="flex justify-center py-20 text-primary-deep" aria-live="polite">
            <Spinner size={32} />
          </div>
        ) : lista.items.length === 0 ? (
          <EmptyState
            icon={hayFiltros ? <SearchX size={36} aria-hidden="true" /> : <Store size={36} aria-hidden="true" />}
            title={hayFiltros ? t('comercios.vacio.filtrosTitle') : t('comercios.vacio.title')}
            description={hayFiltros ? t('comercios.vacio.filtrosDescripcion') : t('comercios.vacio.descripcion')}
            action={
              hayFiltros ? (
                <Button size="md" variant="secondary" onClick={limpiar}>
                  {t('comercios.vacio.limpiar')}
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className={loading ? 'opacity-60 transition-opacity' : undefined}>
            <ComerciosTable items={lista.items} lang={lang} />
            <div className="flex flex-col items-center gap-3 px-4 py-4 md:flex-row md:justify-between md:px-5">
              <p className="text-sm text-ink-muted">{t('comercios.lista.mostrando', { desde: first, hasta: last, total: lista.total })}</p>
              <PaginatedComplete page={lista.page} limit={lista.limit} total={lista.total} links={lista.links} onPageChange={lista.setPage} />
            </div>
          </div>
        )}
      </section>

      {puedeEditar && <InvitarModal open={invitando} onClose={() => setInvitando(false)} />}
    </div>
  );
}
