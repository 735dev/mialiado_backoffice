import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLang } from '@/lib/hooks/useLang';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { ImpulsoEstado, ImpulsoFila } from '@/providers/impulsosProvider';
import { formatInteger, formatMoney, initials } from '@/lib/utils/format';

const TONE: Record<ImpulsoEstado, string> = {
  en_curso: 'bg-primary-tint text-primary-deep',
  pausada: 'bg-surface-2 text-ink-soft',
  finalizada: 'bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200',
};
const DOT: Record<ImpulsoEstado, string> = { en_curso: 'bg-primary-deep', pausada: 'bg-ink-muted', finalizada: 'bg-sky-600 dark:bg-sky-300' };

export function EstadoImpulso({ estado }: { estado: ImpulsoEstado }) {
  const t = useT();
  return (
    <span className={cn('inline-flex h-6 items-center gap-1.5 rounded-pill px-2.5 text-xs font-bold', TONE[estado])}>
      <span aria-hidden="true" className={cn('h-1.5 w-1.5 rounded-full', DOT[estado])} />
      {t(`impulsos.estado.${estado}`)}
    </span>
  );
}

interface Props {
  items: ImpulsoFila[];
  isLoading: boolean;
  puedeEditar: boolean;
  busyId: number | null;
  onPausar: (i: ImpulsoFila) => void;
  onReanudar: (i: ImpulsoFila) => void;
}

const TH = 'px-3 py-3 font-mono text-xs font-medium uppercase tracking-widest text-ink-muted';

function Comercio({ i }: { i: ImpulsoFila }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-warn-tint text-xs font-extrabold text-warn">
        {initials(i.comercio)}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-bold leading-5">{i.comercio}</span>
        <span className="block truncate text-xs text-ink-muted">{i.promocion ?? '-'}</span>
      </span>
    </span>
  );
}

function Accion({ i, puedeEditar, busyId, onPausar, onReanudar }: Omit<Props, 'items' | 'isLoading'> & { i: ImpulsoFila }) {
  const t = useT();
  if (i.estado === 'finalizada') return null;
  const pausar = i.estado === 'en_curso';
  return (
    <Button
      variant="secondary"
      size="md"
      disabled={!puedeEditar}
      isLoading={busyId === i.id}
      aria-label={t(pausar ? 'impulsos.acciones.pausarDe' : 'impulsos.acciones.reanudarDe', { nombre: i.comercio })}
      onClick={() => (pausar ? onPausar(i) : onReanudar(i))}
      className="h-9 px-4"
    >
      {pausar ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
      {t(pausar ? 'impulsos.acciones.pausar' : 'impulsos.acciones.reanudar')}
    </Button>
  );
}

/** Campanas: tabla en escritorio, tarjetas en movil. Pausar/reanudar solo con permiso de editar. */
export function CampanasTabla(props: Props) {
  const t = useT();
  const { lang } = useLang();
  const wide = useMediaQuery('(min-width: 768px)');
  const { items, isLoading } = props;

  if (!wide) {
    return (
      <ul className={cn('flex flex-col gap-3 p-3', isLoading && 'opacity-60')}>
        {items.map((i) => (
          <li key={i.id} className="flex flex-col gap-3 rounded-card bg-surface-2 p-4">
            <span className="flex items-center justify-between gap-2">
              <Comercio i={i} />
              <EstadoImpulso estado={i.estado} />
            </span>
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <div><dt className="text-xs text-ink-muted">{t('impulsos.tabla.pujaDiaria')}</dt><dd className="font-semibold">{formatMoney(i.puja_diaria, lang)}</dd></div>
              <div><dt className="text-xs text-ink-muted">{t('impulsos.tabla.gasto')}</dt><dd className="font-bold">{formatMoney(i.gasto, lang)}</dd></div>
              <div><dt className="text-xs text-ink-muted">{t('impulsos.tabla.canjes')}</dt><dd className="font-bold">{formatInteger(i.canjes, lang)}</dd></div>
              <div><dt className="text-xs text-ink-muted">{t('impulsos.tabla.dias')}</dt><dd>{i.dias}</dd></div>
              <div><dt className="text-xs text-ink-muted">{t('impulsos.tabla.vistas')}</dt><dd>{formatInteger(i.vistas, lang)}</dd></div>
              <div><dt className="text-xs text-ink-muted">{t('impulsos.tabla.alcance')}</dt><dd>{formatInteger(i.alcance_min, lang)} – {formatInteger(i.alcance_max, lang)}</dd></div>
            </dl>
            <Accion i={i} {...props} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn('overflow-x-auto', isLoading && 'opacity-60')}>
      <table className="w-full min-w-[900px] border-collapse text-sm">
        <thead className="bg-surface-2">
          <tr className="text-left">
            <th scope="col" className={`${TH} pl-5`}>{t('impulsos.tabla.comercio')}</th>
            <th scope="col" className={`${TH} text-right`}>{t('impulsos.tabla.pujaDiaria')}</th>
            <th scope="col" className={`${TH} text-right`}>{t('impulsos.tabla.dias')}</th>
            <th scope="col" className={`${TH} text-right`}>{t('impulsos.tabla.alcance')}</th>
            <th scope="col" className={`${TH} text-right`}>{t('impulsos.tabla.gasto')}</th>
            <th scope="col" className={`${TH} text-right`}>{t('impulsos.tabla.vistas')}</th>
            <th scope="col" className={`${TH} text-right`}>{t('impulsos.tabla.canjes')}</th>
            <th scope="col" className={TH}>{t('impulsos.tabla.estado')}</th>
            <th scope="col" className={`${TH} pr-5 text-right`}>{t('impulsos.tabla.acciones')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-t border-line hover:bg-surface-2">
              <td className="py-3 pl-5 pr-3"><Comercio i={i} /></td>
              <td className="px-3 text-right">{formatMoney(i.puja_diaria, lang)}</td>
              <td className="px-3 text-right">{i.dias}</td>
              <td className="whitespace-nowrap px-3 text-right">{formatInteger(i.alcance_min, lang)} – {formatInteger(i.alcance_max, lang)}</td>
              <td className="px-3 text-right font-bold">{formatMoney(i.gasto, lang)}</td>
              <td className="px-3 text-right">{formatInteger(i.vistas, lang)}</td>
              <td className="px-3 text-right font-bold">{formatInteger(i.canjes, lang)}</td>
              <td className="px-3"><EstadoImpulso estado={i.estado} /></td>
              <td className="py-2 pl-3 pr-5 text-right"><Accion i={i} {...props} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
