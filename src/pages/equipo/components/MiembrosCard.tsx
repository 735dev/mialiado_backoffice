import { Pencil, Play, Pause, ShieldOff, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLang } from '@/lib/hooks/useLang';
import { useT, type TFunction } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { useEquipo } from '../hooks/useEquipo';
import type { EstadoVisible, FiltroEstado, Miembro } from '../models/equipo';
import { estadoVisible, fmtUltimoAcceso, plural } from '../utils/format';
import { Avatar } from './Avatar';
import { Segmented } from './Segmented';

const FILTROS: FiltroEstado[] = ['todos', 'activos', 'pendientes'];
const TONO: Record<EstadoVisible, 'ok' | 'warn' | 'err' | 'neutral'> = { activo: 'ok', sin2fa: 'warn', pendiente: 'neutral', suspendido: 'err' };

export interface AccionesMiembro {
  onEdit: (m: Miembro) => void;
  onToggleSuspension: (m: Miembro) => void;
  onReset2fa: (m: Miembro) => void;
  onDelete: (m: Miembro) => void;
}

interface Props extends AccionesMiembro {
  equipo: ReturnType<typeof useEquipo>;
  canEdit: boolean;
}

export function MiembrosCard({ equipo, canEdit, ...acciones }: Props) {
  const t = useT();
  const { lang } = useLang();
  const { user } = useAuth();
  const r = equipo.resumen;
  const yo = user ? Number(user.id) : null;

  return (
    <section aria-label={t('equipo.members.aria')} className="rounded-[28px] bg-surface shadow-e1">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-4 pt-5 md:px-7 md:pt-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t('equipo.members.title')}</h2>
          {r && (
            <p className="text-sm text-ink-muted">
              {[plural(t, 'equipo.members.people', r.personas), plural(t, 'equipo.members.active', r.activas), plural(t, 'equipo.members.pending', r.pendientes)].join(' · ')}
            </p>
          )}
        </div>
        <Segmented
          label={t('equipo.members.filter')}
          value={equipo.filtro}
          onChange={equipo.setFiltro}
          options={FILTROS.map((f) => ({ value: f, label: t(`equipo.members.tabs.${f}`) }))}
        />
      </div>

      {equipo.isLoading && equipo.miembros.length === 0 ? (
        <div className="flex justify-center py-14" aria-busy="true">
          <Spinner size={30} className="text-primary-deep" />
        </div>
      ) : equipo.miembros.length === 0 ? (
        <EmptyState
          icon={<Users size={38} />}
          title={t(equipo.failed ? 'equipo.members.errorTitle' : 'equipo.members.emptyTitle')}
          description={t(equipo.failed ? 'equipo.members.errorText' : 'equipo.members.emptyText')}
          action={
            <Button variant="secondary" size="md" onClick={equipo.reload}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : (
        <div className={cn(equipo.isLoading && 'opacity-60')} aria-busy={equipo.isLoading}>
          <TablaMiembros miembros={equipo.miembros} yo={yo} lang={lang} t={t} canEdit={canEdit} {...acciones} />
          <TarjetasMiembros miembros={equipo.miembros} yo={yo} lang={lang} t={t} canEdit={canEdit} {...acciones} />
        </div>
      )}
    </section>
  );
}

interface ListaProps extends AccionesMiembro {
  miembros: Miembro[];
  yo: number | null;
  lang: string;
  t: TFunction;
  canEdit: boolean;
}

function Estado({ m, t }: { m: Miembro; t: TFunction }) {
  const e = estadoVisible(m);
  return <Badge tone={TONO[e]}>{t(`equipo.estado.${e}`)}</Badge>;
}

function Botones({ m, yo, t, canEdit, onEdit, onToggleSuspension, onReset2fa, onDelete }: Omit<ListaProps, 'miembros' | 'lang'> & { m: Miembro }) {
  if (!canEdit) return null;
  const propio = yo === m.id;
  const base = 'flex h-10 w-10 flex-none items-center justify-center rounded-full bg-bg text-ink-soft hover:bg-primary-tint hover:text-primary-deep disabled:opacity-40 disabled:hover:bg-bg disabled:hover:text-ink-soft';
  const suspendido = m.estado === 'S';
  return (
    <div className="flex justify-end gap-1.5">
      <button type="button" className={base} onClick={() => onEdit(m)} disabled={propio} aria-label={t('equipo.actions.edit', { nombre: m.nombre })}>
        <Pencil size={16} />
      </button>
      <button type="button" className={base} onClick={() => onReset2fa(m)} disabled={m.estado === 'P'} aria-label={t('equipo.actions.reset2fa', { nombre: m.nombre })}>
        <ShieldOff size={16} />
      </button>
      <button
        type="button"
        className={base}
        onClick={() => onToggleSuspension(m)}
        disabled={propio || m.estado === 'P'}
        aria-label={t(suspendido ? 'equipo.actions.reactivate' : 'equipo.actions.suspend', { nombre: m.nombre })}
      >
        {suspendido ? <Play size={16} /> : <Pause size={16} />}
      </button>
      <button
        type="button"
        className={cn(base, 'enabled:hover:bg-err-tint enabled:hover:text-err-deep')}
        onClick={() => onDelete(m)}
        disabled={propio}
        aria-label={t('equipo.actions.delete', { nombre: m.nombre })}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function Persona({ m, yo, t }: { m: Miembro; yo: number | null; t: TFunction }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar nombre={m.nombre} />
      <div className="min-w-0">
        <div className="truncate text-sm font-bold">
          {m.nombre} {yo === m.id && <span className="font-medium text-ink-muted">({t('equipo.members.you')})</span>}
        </div>
        <div className="truncate text-xs text-ink-muted">{m.correo}</div>
      </div>
    </div>
  );
}

function TablaMiembros(p: ListaProps) {
  const { miembros, yo, lang, t } = p;
  const et = { hoy: t('equipo.members.today'), ayer: t('equipo.members.yesterday'), ahora: t('equipo.members.now') };
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-bg">
            {(['member', 'role', 'status', 'lastAccess'] as const).map((c) => (
              <th key={c} scope="col" className="h-11 px-4 font-mono text-xs font-medium uppercase tracking-widest text-ink-muted first:pl-7">
                {t(`equipo.members.cols.${c}`)}
              </th>
            ))}
            <th scope="col" className="px-4 pr-7">
              <span className="sr-only">{t('equipo.members.cols.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {miembros.map((m) => (
            <tr key={m.id} className="border-t border-line">
              <td className="h-[72px] px-4 pl-7">
                <Persona m={m} yo={yo} t={t} />
              </td>
              <td className="px-4">
                <Badge>{t(`equipo.rol.${m.rol}`)}</Badge>
              </td>
              <td className="px-4">
                <Estado m={m} t={t} />
              </td>
              <td className="px-4 text-ink-soft">{fmtUltimoAcceso(m.ultimo_acceso, lang, et)}</td>
              <td className="px-4 pr-7">
                <Botones m={m} {...p} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TarjetasMiembros(p: ListaProps) {
  const { miembros, yo, lang, t } = p;
  const et = { hoy: t('equipo.members.today'), ayer: t('equipo.members.yesterday'), ahora: t('equipo.members.now') };
  return (
    <ul className="divide-y divide-line border-t border-line md:hidden">
      {miembros.map((m) => (
        <li key={m.id} className="flex flex-col gap-3 px-5 py-4">
          <Persona m={m} yo={yo} t={t} />
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{t(`equipo.rol.${m.rol}`)}</Badge>
            <Estado m={m} t={t} />
            <span className="text-xs text-ink-muted">{fmtUltimoAcceso(m.ultimo_acceso, lang, et)}</span>
          </div>
          <Botones m={m} {...p} />
        </li>
      ))}
    </ul>
  );
}
