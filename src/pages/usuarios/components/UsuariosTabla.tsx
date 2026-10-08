import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { useLang } from '@/lib/hooks/useLang';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useT } from '@/lib/hooks/useT';
import { buildPath, PATHS } from '@/lib/routes/paths';
import type { UsuarioFila } from '@/providers/usuariosProvider';
import { formatDateTime, formatInteger, formatMoney } from '@/lib/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { NivelBadge } from './NivelBadge';

export function EstadoBadge({ estado }: { estado: UsuarioFila['estado'] }) {
  const t = useT();
  return <Badge tone={estado === 'Activo' ? 'ok' : 'err'}>{estado === 'Activo' ? t('usuarios.estado.activo') : t('usuarios.estado.bloqueado')}</Badge>;
}

const TH = 'px-3 py-3 text-left font-mono text-xs font-medium uppercase tracking-widest text-ink-muted';

function Persona({ u }: { u: UsuarioFila }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar tone="warn" name={u.nombre} src={u.foto_url} />
      <span className="min-w-0">
        <span className="block truncate font-bold leading-5">{u.nombre}</span>
        <span className="block truncate text-xs text-ink-muted">@{u.usuario}</span>
      </span>
    </span>
  );
}

/** Tabla en escritorio; en movil cada usuario es una tarjeta con sus datos clave. */
export function UsuariosTabla({ items, isLoading }: { items: UsuarioFila[]; isLoading: boolean }) {
  const t = useT();
  const { lang } = useLang();
  const wide = useMediaQuery('(min-width: 768px)');
  const href = (u: UsuarioFila) => buildPath(PATHS.usuario, { id: u.id });

  if (!wide) {
    return (
      <ul className={`flex flex-col gap-3 p-3 ${isLoading ? 'opacity-60' : ''}`}>
        {items.map((u) => (
          <li key={u.id}>
            <Link to={href(u)} aria-label={t('usuarios.tabla.verDe', { nombre: u.nombre })} className="flex flex-col gap-3 rounded-card bg-surface-2 p-4">
              <span className="flex items-center justify-between gap-2">
                <Persona u={u} />
                <EstadoBadge estado={u.estado} />
              </span>
              <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <NivelBadge nivel={u.nivel} />
                <span>{t(u.compras === 1 ? 'usuarios.tabla.compraUna' : 'usuarios.tabla.comprasN', { n: formatInteger(u.compras, lang) })}</span>
                <span className="font-bold">{formatMoney(u.ahorro_total, lang)}</span>
              </span>
              <span className="text-xs text-ink-muted">
                {u.ciudad ?? '-'} · {formatDateTime(u.ultimo_acceso, lang)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={`overflow-x-auto ${isLoading ? 'opacity-60' : ''}`}>
      <table className="w-full min-w-[820px] border-collapse text-sm">
        <thead className="bg-surface-2">
          <tr>
            <th scope="col" className={`${TH} pl-6`}>{t('usuarios.tabla.usuario')}</th>
            <th scope="col" className={TH}>{t('usuarios.tabla.nivel')}</th>
            <th scope="col" className={`${TH} text-right`}>{t('usuarios.tabla.compras')}</th>
            <th scope="col" className={`${TH} text-right`}>{t('usuarios.tabla.ahorro')}</th>
            <th scope="col" className={TH}>{t('usuarios.tabla.ciudad')}</th>
            <th scope="col" className={TH}>{t('usuarios.tabla.estado')}</th>
            <th scope="col" className={TH}>{t('usuarios.tabla.ultimoAcceso')}</th>
            <th scope="col" className="w-10"><span className="sr-only">{t('usuarios.tabla.ver')}</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u.id} className="border-t border-line hover:bg-surface-2">
              <td className="py-3 pl-6 pr-3"><Persona u={u} /></td>
              <td className="px-3"><NivelBadge nivel={u.nivel} /></td>
              <td className="px-3 text-right font-bold">{formatInteger(u.compras, lang)}</td>
              <td className="px-3 text-right font-bold">{formatMoney(u.ahorro_total, lang)}</td>
              <td className="px-3">{u.ciudad ?? '-'}</td>
              <td className="px-3"><EstadoBadge estado={u.estado} /></td>
              <td className="px-3 text-ink-soft">{formatDateTime(u.ultimo_acceso, lang)}</td>
              <td className="pr-4">
                <Link to={href(u)} aria-label={t('usuarios.tabla.verDe', { nombre: u.nombre })} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-surface">
                  <ChevronRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
