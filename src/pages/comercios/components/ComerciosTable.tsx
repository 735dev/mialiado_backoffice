import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useT } from '@/lib/hooks/useT';
import type { Lang } from '@/lib/i18n';
import { buildPath, PATHS } from '@/lib/routes/paths';
import type { ComercioItem } from '@/providers/comerciosProvider';
import { formatDate } from '../utils/format';
import { ComercioAvatar, EstadoBadge } from './Badges';

const TH = 'h-11 bg-bg px-3 text-left font-mono text-xs font-medium uppercase tracking-wider text-ink-muted';
const TD = 'h-16 border-b border-line px-3 text-sm';

function Identidad({ c }: { c: ComercioItem }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ComercioAvatar id={c.id} nombre={c.nombre} />
      <div className="min-w-0">
        <Link to={buildPath(PATHS.comercio, { id: c.id })} className="block truncate font-bold hover:underline">
          {c.nombre}
        </Link>
        <span className="block font-mono text-xs text-ink-muted">{c.rif}</span>
      </div>
    </div>
  );
}

/** Tabla en escritorio (md+) y tarjetas en movil: el mismo contenido, dos disposiciones. */
export function ComerciosTable({ items, lang }: { items: ComercioItem[]; lang: Lang }) {
  const t = useT();
  const desktop = useMediaQuery('(min-width: 768px)');
  const dash = '–';
  const ver = (c: ComercioItem) => (
    <Link
      to={buildPath(PATHS.comercio, { id: c.id })}
      aria-label={t('comercios.lista.ver', { nombre: c.nombre })}
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:bg-surface-2"
    >
      <Eye size={20} aria-hidden="true" />
    </Link>
  );

  return desktop ? (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse">
          <thead>
            <tr>
              <th scope="col" className={TH}>{t('comercios.col.comercio')}</th>
              <th scope="col" className={TH}>{t('comercios.col.categoria')}</th>
              <th scope="col" className={TH}>{t('comercios.col.zona')}</th>
              <th scope="col" className={TH}>{t('comercios.col.estado')}</th>
              <th scope="col" className={`${TH} text-right`}>{t('comercios.col.promos')}</th>
              <th scope="col" className={`${TH} text-right`}>{t('comercios.col.canjes')}</th>
              <th scope="col" className={TH}>{t('comercios.col.registro')}</th>
              <th scope="col" className={TH}><span className="sr-only">{t('comercios.col.acciones')}</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-bg">
                <td className={TD}><Identidad c={c} /></td>
                <td className={`${TD} text-ink-soft`}>{c.categoria ?? dash}</td>
                <td className={`${TD} text-ink-soft`}>{c.zona ?? dash}</td>
                <td className={TD}><EstadoBadge estado={c.estado} /></td>
                <td className={`${TD} text-right font-bold`}>{c.promos > 0 ? c.promos : dash}</td>
                <td className={`${TD} text-right font-extrabold`}>{c.canjes_30d > 0 ? c.canjes_30d : dash}</td>
                <td className={`${TD} text-ink-muted`}>{formatDate(c.created_at, lang)}</td>
                <td className={TD}>{ver(c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  ) : (
    <>
      <ul className="flex flex-col">
        {items.map((c) => (
          <li key={c.id} className="flex flex-col gap-3 border-b border-line px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <Identidad c={c} />
              {ver(c)}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-soft">
              <EstadoBadge estado={c.estado} />
              <span>{[c.categoria, c.zona].filter(Boolean).join(' · ') || dash}</span>
            </div>
            <dl className="grid grid-cols-3 gap-2 text-xs text-ink-muted">
              <div>
                <dt>{t('comercios.col.promos')}</dt>
                <dd className="text-sm font-bold text-ink">{c.promos > 0 ? c.promos : dash}</dd>
              </div>
              <div>
                <dt>{t('comercios.col.canjes')}</dt>
                <dd className="text-sm font-extrabold text-ink">{c.canjes_30d > 0 ? c.canjes_30d : dash}</dd>
              </div>
              <div>
                <dt>{t('comercios.col.registro')}</dt>
                <dd className="text-sm font-medium text-ink">{formatDate(c.created_at, lang)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
