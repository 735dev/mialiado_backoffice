import { useCallback, useState } from 'react';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/hooks/useLang';
import { usePagination } from '@/lib/hooks/usePagination';
import { useT } from '@/lib/hooks/useT';
import { listarCanjesUsuario, type CanjeFila, type CanjeResumen, type UsuarioDetalle } from '@/providers/usuariosProvider';
import { dateOnly, money } from '../format';
import { Avatar } from './Avatar';

interface Fila {
  id: number;
  fecha: string;
  comercio: string;
  promocion: string | null;
  pct: number;
  ahorro: number;
  anulado: boolean;
}

const anulado = (estado: string) => estado.toLowerCase().startsWith('anul');
const deResumen = (c: CanjeResumen): Fila => ({ id: c.id, fecha: c.fecha, comercio: c.comercio, promocion: c.promocion, pct: c.descuento_pct, ahorro: c.ahorro, anulado: anulado(c.estado) });
const deFila = (c: CanjeFila): Fila => ({ id: c.id, fecha: c.created_at, comercio: c.comercio, promocion: c.promocion, pct: c.descuento_pct, ahorro: c.descuento, anulado: anulado(c.estado) });

const GRID = 'md:grid md:grid-cols-[88px_minmax(0,1.4fr)_minmax(0,1.6fr)_88px_110px] md:items-center md:gap-3';
const TH = 'font-mono text-xs font-medium uppercase tracking-widest text-ink-muted';

function Filas({ filas }: { filas: Fila[] }) {
  const t = useT();
  const { lang } = useLang();
  return (
    <div>
      <div className={`hidden bg-surface-2 px-5 py-3 ${GRID}`} aria-hidden="true">
        <span className={TH}>{t('usuarios.canjes.fecha')}</span>
        <span className={TH}>{t('usuarios.canjes.comercio')}</span>
        <span className={TH}>{t('usuarios.canjes.promocion')}</span>
        <span className={`${TH} text-right`}>{t('usuarios.canjes.ahorro')}</span>
        <span className={`${TH} text-right`}>{t('usuarios.canjes.estado')}</span>
      </div>
      <ul>
        {filas.map((c) => (
          <li key={c.id} className={`flex flex-col gap-1 border-t border-line px-5 py-3 text-sm ${GRID}`}>
            <span className="text-ink-soft">{dateOnly(c.fecha, lang)}</span>
            <span className="flex min-w-0 items-center gap-2 font-bold">
              <Avatar name={c.comercio} size={28} />
              <span className="truncate">{c.comercio}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate">{c.promocion ?? t('usuarios.canjes.sinPromocion')}</span>
              {c.pct > 0 && <Badge tone="ok">-{c.pct}%</Badge>}
            </span>
            <span className="font-bold md:text-right">{money(c.ahorro, lang)}</span>
            <span className="md:text-right">
              <Badge tone={c.anulado ? 'neutral' : 'ok'}>{t(c.anulado ? 'usuarios.canjes.anulado' : 'usuarios.canjes.canjeado')}</Badge>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SIN_FILTROS = {};

function Historial({ id }: { id: number }) {
  const t = useT();
  const fetcher = useCallback((p: { page: number; limit: number }) => listarCanjesUsuario(id, p), [id]);
  const list = usePagination<CanjeFila, object>({ fetcher, initialParams: SIN_FILTROS, initialLimit: 10 });
  if (list.isLoading && list.items.length === 0) {
    return (
      <div className="flex items-center justify-center gap-3 py-10 text-ink-muted">
        <Spinner />
        {t('common.loading')}
      </div>
    );
  }
  return (
    <>
      <Filas filas={list.items.map(deFila)} />
      <div className="border-t border-line p-4">
        <PaginatedComplete page={list.page} limit={list.limit} total={list.total} links={list.links} onPageChange={list.setPage} />
      </div>
    </>
  );
}

/** Ultimos canjes (vienen en el detalle) y, con "Ver todos", el historial completo paginado. */
export function CanjesCard({ u }: { u: UsuarioDetalle }) {
  const t = useT();
  const [todos, setTodos] = useState(false);
  const recientes = u.ultimos_canjes.map(deResumen);
  return (
    <section aria-labelledby="canjes-titulo" className="overflow-hidden rounded-card bg-surface shadow-e1">
      <header className="flex items-start justify-between gap-3 p-5">
        <div>
          <h2 id="canjes-titulo" className="text-xl font-extrabold tracking-tight">{t('usuarios.canjes.titulo')}</h2>
          <p className="text-sm text-ink-muted">{todos ? t('usuarios.canjes.todos', { total: u.compras }) : t('usuarios.canjes.ultimos', { n: recientes.length, total: u.compras })}</p>
        </div>
        {u.compras > recientes.length && (
          <Button variant="ghost" size="md" onClick={() => setTodos((v) => !v)} className="text-primary-deep">
            {t(todos ? 'usuarios.canjes.verUltimos' : 'usuarios.canjes.verTodos')}
          </Button>
        )}
      </header>
      {todos ? <Historial id={u.id} /> : recientes.length > 0 ? <Filas filas={recientes} /> : <p className="border-t border-line p-8 text-center text-ink-muted">{t('usuarios.canjes.vacio')}</p>}
    </section>
  );
}
