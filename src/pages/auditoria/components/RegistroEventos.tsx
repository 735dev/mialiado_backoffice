import { ChevronDown, ScrollText } from 'lucide-react';
import { Fragment, useState } from 'react';
import { PaginatedComplete } from '@/components/pagination/PaginatedComplete';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useLang } from '@/lib/hooks/useLang';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useT, type TFunction } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { useAuditoria } from '../hooks/useAuditoria';
import type { Evento } from '../models/evento';
import { fmtFecha, fmtNumero, tonoDeAccion } from '../utils/format';
import { Avatar } from './Avatar';
import { DetalleEvento } from './DetalleEvento';

type Registro = ReturnType<typeof useAuditoria>;

export function RegistroEventos({ registro: r }: { registro: Registro }) {
  const t = useT();
  const { lang } = useLang();
  const ancha = useMediaQuery('(min-width: 768px)');
  const [abierto, setAbierto] = useState<number | null>(null);
  const alternar = (id: number) => setAbierto((prev) => (prev === id ? null : id));
  const cuando = (iso: string) => fmtFecha(iso, lang, { hoy: t('auditoria.table.today'), ayer: t('auditoria.table.yesterday') });

  return (
    <>
      {r.isLoading && r.items.length === 0 ? (
        <div className="flex justify-center py-16" aria-busy="true">
          <Spinner size={32} className="text-primary-deep" />
        </div>
      ) : r.items.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={40} />}
          title={t('auditoria.table.emptyTitle')}
          description={t('auditoria.table.emptyText')}
          action={
            <Button variant="secondary" size="md" onClick={r.reload}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : (
        <div className={cn(r.isLoading && 'opacity-60')} aria-busy={r.isLoading}>
          {ancha ? (
            <Tabla items={r.items} abierto={abierto} onToggle={alternar} cuando={cuando} t={t} />
          ) : (
            <Tarjetas items={r.items} abierto={abierto} onToggle={alternar} cuando={cuando} t={t} />
          )}
        </div>
      )}
      <div className="flex flex-col items-center gap-3 border-t border-line px-5 py-4 sm:flex-row sm:justify-between md:px-7">
        <span className="text-sm font-medium text-ink-muted">{t('auditoria.table.count', { shown: r.items.length, total: fmtNumero(r.total, lang) })}</span>
        <PaginatedComplete page={r.page} limit={r.limit} total={r.total} links={r.links} onPageChange={r.setPage} />
      </div>
    </>
  );
}

interface ListaProps {
  items: Evento[];
  abierto: number | null;
  onToggle: (id: number) => void;
  cuando: (iso: string) => string;
  t: TFunction;
}

function Quien({ e }: { e: Evento }) {
  const nombre = e.persona ?? '—';
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar nombre={nombre} />
      <div className="min-w-0">
        <div className="truncate text-sm font-bold">{nombre}</div>
        {e.rol && <div className="truncate text-xs text-ink-muted">{e.rol}</div>}
      </div>
    </div>
  );
}

function Objeto({ e }: { e: Evento }) {
  return (
    <>
      <div className="text-sm font-bold">{e.objeto_tipo ?? e.modulo}</div>
      {e.objeto && <div className="break-words text-[13px] text-ink-muted">{e.objeto}</div>}
    </>
  );
}

function BotonDetalle({ e, abierto, onToggle, t }: { e: Evento; abierto: boolean; onToggle: (id: number) => void; t: TFunction }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(e.id)}
      aria-expanded={abierto}
      aria-label={t('auditoria.table.detail', { codigo: e.codigo })}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-bg text-ink-soft hover:bg-primary-tint hover:text-primary-deep"
    >
      <ChevronDown size={20} className={cn('transition-transform', abierto && 'rotate-180')} aria-hidden="true" />
    </button>
  );
}

function Tabla({ items, abierto, onToggle, cuando, t }: ListaProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-bg">
            {(['date', 'who', 'action', 'object', 'ip'] as const).map((c) => (
              <th key={c} scope="col" className="h-11 px-4 font-mono text-xs font-medium uppercase tracking-widest text-ink-muted first:pl-7">
                {t(`auditoria.table.cols.${c}`)}
              </th>
            ))}
            <th scope="col" className="w-20 px-4">
              <span className="sr-only">{t('auditoria.table.cols.detail')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((e, i) => (
            <Fragment key={e.id}>
              <tr className={cn('border-t border-line', i % 2 === 1 && 'bg-bg/60')}>
                <td className="h-16 whitespace-nowrap px-4 pl-7 font-medium">{cuando(e.created_at)}</td>
                <td className="px-4">
                  <Quien e={e} />
                </td>
                <td className="px-4">
                  <Badge tone={tonoDeAccion(e.accion)}>{e.accion}</Badge>
                </td>
                <td className="px-4">
                  <Objeto e={e} />
                </td>
                <td className="px-4 font-mono text-[13px] text-ink-soft">{e.ip ?? '—'}</td>
                <td className="px-4 text-right">
                  <BotonDetalle e={e} abierto={abierto === e.id} onToggle={onToggle} t={t} />
                </td>
              </tr>
              {abierto === e.id && (
                <tr className="bg-bg">
                  <td colSpan={6} className="px-5 pb-6 md:px-7">
                    <DetalleEvento id={e.id} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Tarjetas({ items, abierto, onToggle, cuando, t }: ListaProps) {
  return (
    <ul className="divide-y divide-line border-t border-line">
      {items.map((e) => (
        <li key={e.id} className="flex flex-col gap-3 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <Quien e={e} />
            <Badge tone={tonoDeAccion(e.accion)}>{e.accion}</Badge>
          </div>
          <div>
            <Objeto e={e} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-ink-muted">
              {cuando(e.created_at)}
              {e.ip && <span className="font-mono"> · {e.ip}</span>}
            </span>
            <BotonDetalle e={e} abierto={abierto === e.id} onToggle={onToggle} t={t} />
          </div>
          {abierto === e.id && <DetalleEvento id={e.id} />}
        </li>
      ))}
    </ul>
  );
}
