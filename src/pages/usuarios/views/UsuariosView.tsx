import { Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { cn } from '@/lib/utils/cn';
import type { UsuarioTab } from '@/providers/usuariosProvider';
import { ResumenCards } from '../components/ResumenCards';
import { UsuariosTabla } from '../components/UsuariosTabla';
import { useUsuarios } from '../hooks/useUsuarios';
import { formatInteger } from '@/lib/utils/format';

export const routeName = PATHS.usuarios;

const TABS: UsuarioTab[] = ['todos', 'aliado', 'aliadopro', 'aliadoplus', 'bloqueados'];

const FIELD = 'h-11 min-w-0 rounded-pill border-[1.5px] border-line-strong bg-surface px-4 text-sm text-ink placeholder:text-ink-muted outline-none focus:border-primary-deep focus:ring-1 focus:ring-primary-deep';

/** B05 Usuarios: resumen por nivel, lista paginada con pestanas, busqueda por nombre/usuario/correo y filtro de ciudad. */
export default function UsuariosView() {
  const t = useT();
  const { lang } = useLang();
  const u = useUsuarios();
  const from = u.total === 0 ? 0 : (u.page - 1) * u.limit + 1;
  const to = Math.min(u.total, (u.page - 1) * u.limit + u.items.length);

  return (
    <section data-screen="B05" className="flex max-w-[1200px] flex-col gap-6">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-ink-muted">{t('nav.group.operacion')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('usuarios.title')}</h1>
        <p className="text-ink-muted">{t('usuarios.subtitle')}</p>
      </header>

      <ResumenCards resumen={u.resumen} />

      <div className="overflow-hidden rounded-card bg-surface shadow-e1">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div role="tablist" aria-label={t('usuarios.tabs.label')} className="flex flex-none gap-1 overflow-x-auto rounded-pill bg-surface-2 p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={u.tab === tab}
                onClick={() => u.setTab(tab)}
                className={cn(
                  'h-10 flex-none rounded-pill px-4 text-sm font-semibold',
                  u.tab === tab ? 'bg-surface font-bold text-ink shadow-e1' : 'text-ink-muted hover:text-ink',
                )}
              >
                {t(`usuarios.tabs.${tab}`)}
              </button>
            ))}
          </div>
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">{t('usuarios.buscar')}</span>
            <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              value={u.busqueda}
              onChange={(e) => u.setBusqueda(e.target.value)}
              placeholder={t('usuarios.buscar')}
              className={cn(FIELD, 'w-full pl-11')}
            />
          </label>
          <label className="lg:w-44">
            <span className="sr-only">{t('usuarios.ciudad')}</span>
            <input value={u.ciudad} onChange={(e) => u.setCiudad(e.target.value)} placeholder={t('usuarios.ciudad')} className={cn(FIELD, 'w-full')} />
          </label>
        </div>

        {u.isLoading && u.items.length === 0 ? (
          <div className="flex items-center justify-center gap-3 py-16 text-ink-muted" aria-live="polite">
            <Spinner />
            {t('common.loading')}
          </div>
        ) : u.items.length === 0 ? (
          <EmptyState
            icon={<Users size={40} />}
            title={t(u.hayFiltros ? 'usuarios.vacio.filtrosTitulo' : 'usuarios.vacio.titulo')}
            description={t(u.hayFiltros ? 'usuarios.vacio.filtrosTexto' : 'usuarios.vacio.texto')}
            action={
              <Button variant="secondary" size="md" onClick={u.hayFiltros ? u.limpiar : u.reload}>
                {t(u.hayFiltros ? 'usuarios.vacio.limpiar' : 'common.retry')}
              </Button>
            }
          />
        ) : (
          <UsuariosTabla items={u.items} isLoading={u.isLoading} />
        )}

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-line p-4 text-sm text-ink-muted sm:flex-row">
          <p>{t('usuarios.mostrando', { desde: formatInteger(from, lang), hasta: formatInteger(to, lang), total: formatInteger(u.total, lang) })}</p>
          <PaginatedComplete page={u.page} limit={u.limit} total={u.total} links={u.links} onPageChange={u.setPage} />
        </footer>
      </div>
    </section>
  );
}
