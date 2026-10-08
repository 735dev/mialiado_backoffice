import { CreditCard, LifeBuoy, Store, Tag, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/hooks/useAuth';
import { useT } from '@/lib/hooks/useT';
import type { Modulo } from '@/lib/constants/modules';
import { PATHS } from '@/lib/routes/paths';
import type { PendientesResumen } from '@/providers/resumenProvider';
import { Card } from './Card';

interface Fila {
  key: string;
  value: number;
  icon: LucideIcon;
  modulo: Modulo;
  to: string;
}

/** "Requiere tu atencion": cada pendiente lleva a su modulo; sin permiso `ver` el boton queda deshabilitado. */
export function PendientesCard({ pendientes }: { pendientes: PendientesResumen }) {
  const t = useT();
  const { puede } = useAuth();
  const filas: Fila[] = [
    { key: 'comercios', value: pendientes.comercios_por_verificar, icon: Store, modulo: 'comercios', to: PATHS.comercios },
    { key: 'promos', value: pendientes.promos_por_moderar, icon: Tag, modulo: 'promociones', to: PATHS.promociones },
    { key: 'tickets', value: pendientes.tickets_abiertos, icon: LifeBuoy, modulo: 'soporte', to: PATHS.soporte },
    { key: 'recargas', value: pendientes.recargas_por_conciliar, icon: CreditCard, modulo: 'finanzas', to: PATHS.finanzas },
  ];
  const activos = filas.filter((f) => f.value > 0).length;
  const btn = 'inline-flex h-11 flex-none items-center justify-center rounded-pill bg-surface px-5 text-sm font-bold text-ink ring-1 ring-inset ring-line-strong';

  return (
    <Card title={t('resumen.pendientes.title')} subtitle={t('resumen.pendientes.subtitle', { n: activos })}>
      <ul className="mt-2">
        {filas.map((f, i) => (
          <li key={f.key} className={`flex min-h-[76px] items-center gap-3.5 ${i < filas.length - 1 ? 'border-b border-line' : ''}`}>
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-primary-tint text-primary-deep">
              <f.icon size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[23px] font-extrabold leading-7 tracking-tight">{f.value}</p>
              <p className="text-sm font-medium text-ink-muted">{t(`resumen.pendientes.${f.key}`)}</p>
            </div>
            {puede(f.modulo) ? (
              <Link to={f.to} className={btn}>
                {t('resumen.pendientes.revisar')}
              </Link>
            ) : (
              <button type="button" disabled title={t('resumen.sinPermiso')} className={`${btn} cursor-not-allowed opacity-50`}>
                {t('resumen.pendientes.revisar')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
