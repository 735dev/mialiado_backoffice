import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import type { GuardState } from '@/lib/routes/Guards';
import { PATHS } from '@/lib/routes/paths';
import { SECCIONES } from '@/lib/secciones';
import { obtenerMe } from '@/providers/adminAuthProvider';

export const routeName = PATHS.sinPermiso;

type Admin = { nombre: string; correo: string };

/** B18: la persona entro a un modulo que su rol no incluye. Muestra quien puede darle acceso y a donde si puede entrar. */
export default function SinPermisoView() {
  const t = useT();
  const { user, role, puede } = useAuth();
  const location = useLocation();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const modulo = (location.state as GuardState | null)?.modulo;
  const permitidas = SECCIONES.filter((s) => puede(s.id));
  const inicio = permitidas[0];

  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    void obtenerMe(role).then((res) => {
      if (!cancelled && res.ok) setAdmins(res.data.admins);
    });
    return () => {
      cancelled = true;
    };
  }, [role]);

  const nombreModulo = modulo ? t(`nav.${modulo}`) : t('acceso.thisSection');
  const rolTexto = user?.rolEtiqueta ?? (role ? t(`roles.${role}`) : '');
  const mailto = admins[0] ? `mailto:${admins[0].correo}?subject=${encodeURIComponent(t('acceso.requestSubject', { modulo: nombreModulo }))}` : null;

  return (
    <section className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-err-deep">{t('acceso.error403')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight">{t('acceso.noAccessTitle', { modulo: nombreModulo })}</h1>
        <p className="text-ink-muted">{t('acceso.noAccessBody', { rol: rolTexto })}</p>
        <div className="mt-2 flex flex-wrap gap-3">
          {mailto && (
            <a href={mailto} className="inline-flex h-11 items-center rounded-pill bg-primary px-5 text-sm font-bold text-primary-on shadow-e1">
              {t('acceso.requestAccess')}
            </a>
          )}
          {inicio && (
            <Link to={inicio.ruta} className="inline-flex h-11 items-center rounded-pill bg-surface px-5 text-sm font-bold ring-1 ring-inset ring-line-strong">
              {t('acceso.backTo', { seccion: t(`nav.${inicio.id}`) })}
            </Link>
          )}
        </div>
      </div>

      {admins.length > 0 && (
        <div className="rounded-card bg-surface p-5 shadow-e1">
          <h2 className="text-base font-extrabold">{t('acceso.whoCanHelp')}</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {admins.map((a) => (
              <li key={a.correo} className="text-sm">
                <span className="font-bold">{a.nombre}</span> <span className="text-ink-muted">· {a.correo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {permitidas.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-ink-soft">{t('acceso.youCanEnter')}</h2>
          <div className="flex flex-wrap gap-2">
            {permitidas.map((s) => (
              <Link key={s.id} to={s.ruta} className="inline-flex min-h-11 items-center">
                <Badge tone="ok">{t(`nav.${s.id}`)}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
