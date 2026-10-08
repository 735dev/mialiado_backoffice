import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { MODULOS, type Accion, type Modulo } from '@/lib/constants/modules';
import type { Role } from '@/lib/constants/roles';
import { useLang } from '@/lib/hooks/useLang';
import { useMediaQuery } from '@/lib/hooks/useMediaQuery';
import { useT, type TFunction } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { usePermisos } from '../hooks/usePermisos';
import type { RolResumen } from '../models/equipo';
import { fmtFecha, plural } from '../utils/format';
import { ACCIONES, permisoDe } from '../utils/permisos';
import { Segmented } from './Segmented';

interface Props {
  permisos: ReturnType<typeof usePermisos>;
  canEdit: boolean;
}

/** Matriz de permisos por modulo (ver / editar / aprobar) de cada rol. Admin siempre tiene acceso total. */
export function MatrizPermisos({ permisos: p, canEdit }: Props) {
  const t = useT();
  const { lang } = useLang();
  const ancha = useMediaQuery('(min-width: 768px)');
  const roles = p.respuesta?.roles ?? [];
  const ultima = p.respuesta?.ultima_modificacion;

  return (
    <section aria-label={t('equipo.matrix.aria')} className="rounded-[28px] bg-surface shadow-e1">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4 pt-5 md:px-7 md:pt-6">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">{t('equipo.matrix.title')}</h2>
          <p className="mt-0.5 max-w-xl text-sm text-ink-muted">{t('equipo.matrix.description')}</p>
        </div>
        <span className="inline-flex h-8 items-center gap-1.5 rounded-pill bg-primary-tint px-3.5 text-xs font-bold text-primary-deep">
          <ShieldCheck size={14} aria-hidden="true" />
          {t('equipo.matrix.adminAlways')}
        </span>
      </div>

      {p.isLoading ? (
        <div className="flex justify-center py-14" aria-busy="true">
          <Spinner size={30} className="text-primary-deep" />
        </div>
      ) : p.failed || !p.borrador ? (
        <EmptyState
          title={t('equipo.matrix.errorTitle')}
          description={t('equipo.matrix.errorText')}
          action={
            <Button variant="secondary" size="md" onClick={p.reload}>
              {t('common.retry')}
            </Button>
          }
        />
      ) : ancha ? (
        <TablaAncha roles={roles} p={p} canEdit={canEdit} t={t} />
      ) : (
        <ListaPorRol roles={roles} p={p} canEdit={canEdit} t={t} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 md:px-7">
        <span className="text-sm text-ink-muted">
          {ultima ? t('equipo.matrix.lastChange', { por: ultima.por, fecha: fmtFecha(ultima.fecha, lang) }) : t('equipo.matrix.noChanges')}
        </span>
        {canEdit && (
          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={p.descartar} disabled={!p.sucio || p.guardando}>
              {t('equipo.matrix.discard')}
            </Button>
            <Button size="md" onClick={() => void p.guardar()} disabled={!p.sucio} isLoading={p.guardando}>
              {t('equipo.matrix.save')}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

interface VistaProps {
  roles: RolResumen[];
  p: ReturnType<typeof usePermisos>;
  canEdit: boolean;
  t: TFunction;
}

interface CasillaProps {
  rol: Role;
  modulo: Modulo;
  accion: Accion;
  p: ReturnType<typeof usePermisos>;
  canEdit: boolean;
  t: TFunction;
}

/** Casilla de un permiso. Admin va marcada y bloqueada; sin permiso de editar Equipo nadie puede cambiarla. */
function Casilla({ rol, modulo, accion, p, canEdit, t }: CasillaProps) {
  const esAdmin = rol === 'admin';
  const checked = esAdmin || permisoDe(p.borrador ?? {}, rol, modulo)[accion];
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled={esAdmin || !canEdit}
      onChange={() => p.toggle(rol, modulo, accion)}
      aria-label={`${t(`equipo.rol.${rol}`)}: ${t(`nav.${modulo}`)}, ${t(`equipo.matrix.acciones.${accion}`).toLowerCase()}`}
      className="h-6 w-6 cursor-pointer rounded-[8px] accent-primary-deep disabled:cursor-not-allowed disabled:opacity-60"
    />
  );
}

function TablaAncha({ roles, p, canEdit, t }: VistaProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] border-collapse text-sm">
        <thead>
          <tr>
            <th scope="col" rowSpan={2} className="sticky left-0 z-10 h-11 bg-surface px-4 pl-7 text-left font-mono text-xs font-medium uppercase tracking-widest text-ink-muted">
              {t('equipo.matrix.module')}
            </th>
            {roles.map((r) => (
              <th key={r.rol} scope="colgroup" colSpan={3} className="border-l border-line px-2 pt-2 text-center">
                <div className="font-extrabold">{t(`equipo.rol.${r.rol}`)}</div>
                <div className="text-xs font-medium text-ink-muted">{plural(t, 'equipo.matrix.members', r.miembros)}</div>
              </th>
            ))}
          </tr>
          <tr>
            {roles.flatMap((r) =>
              ACCIONES.map((a, i) => (
                <th key={`${r.rol}-${a}`} scope="col" className={cn('h-9 px-2 text-center font-mono text-xs font-medium uppercase tracking-wide text-ink-muted', i === 0 && 'border-l border-line')}>
                  {t(`equipo.matrix.acciones.${a}`)}
                </th>
              )),
            )}
          </tr>
        </thead>
        <tbody>
          {MODULOS.map((m) => (
            <tr key={m} className="border-t border-line">
              <th scope="row" className="sticky left-0 z-10 h-12 bg-surface px-4 pl-7 text-left font-semibold">
                {t(`nav.${m}`)}
              </th>
              {roles.flatMap((r) =>
                ACCIONES.map((a, i) => (
                  <td key={`${r.rol}-${a}`} className={cn('px-2 text-center', i === 0 && 'border-l border-line')}>
                    <Casilla rol={r.rol} modulo={m} accion={a} p={p} canEdit={canEdit} t={t} />
                  </td>
                )),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** En movil la matriz se vuelve una lista por rol: eliges el rol y ves sus modulos con tres casillas cada uno. */
function ListaPorRol({ roles, p, canEdit, t }: VistaProps) {
  const [elegido, setElegido] = useState<Role>(roles[1]?.rol ?? 'admin');
  const rol = roles.find((r) => r.rol === elegido) ? elegido : (roles[0]?.rol ?? 'admin');
  return (
    <div className="flex flex-col gap-4 px-5 pb-4">
      <Segmented
        label={t('equipo.matrix.pickRole')}
        value={rol}
        onChange={setElegido}
        options={roles.map((r) => ({ value: r.rol, label: t(`equipo.rol.${r.rol}`) }))}
      />
      <ul className="divide-y divide-line">
        {MODULOS.map((m) => (
          <li key={m} className="flex flex-col gap-2 py-3">
            <span className="text-sm font-bold">{t(`nav.${m}`)}</span>
            <div className="flex gap-5">
              {ACCIONES.map((a) => (
                <label key={a} className="flex min-h-11 items-center gap-2 text-sm font-medium">
                  <Casilla rol={rol} modulo={m} accion={a} p={p} canEdit={canEdit} t={t} />
                  {t(`equipo.matrix.acciones.${a}`)}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
