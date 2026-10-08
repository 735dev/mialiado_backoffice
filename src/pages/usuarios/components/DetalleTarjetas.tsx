import { Calendar, Check, CreditCard, IdCard, Mail, MapPin, Phone, Star, Tag, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { cn } from '@/lib/utils/cn';
import type { NivelCodigo, UsuarioDetalle } from '@/providers/usuariosProvider';
import { formatDate, formatDateTime, formatInteger, formatMoney } from '@/lib/utils/format';
import { NIVEL_LABEL, NIVEL_TONE, NivelBadge, NivelIcon } from './NivelBadge';

function Kpi({ icon: Icon, label, value, hint }: { icon: LucideIcon; label: string; value: string; hint: string }) {
  return (
    <li className="flex flex-col gap-2 rounded-card bg-surface p-5 shadow-e1">
      <div className="flex items-center gap-3 font-semibold text-ink-soft">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-tint text-primary-deep">
          <Icon size={18} aria-hidden="true" />
        </span>
        {label}
      </div>
      <p className="text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs text-ink-muted">{hint}</p>
    </li>
  );
}

/** Compras, ahorro total y calificaciones. */
export function KpisUsuario({ u }: { u: UsuarioDetalle }) {
  const t = useT();
  const { lang } = useLang();
  // Sin calificaciones el backend manda promedio null.
  const { promedio: media } = u.calificaciones;
  const promedio = media === null ? '—' : media.toLocaleString(lang === 'en' ? 'en-US' : 'es-VE', { maximumFractionDigits: 1 });
  return (
    <ul aria-label={t('usuarios.detalle.kpis')} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Kpi
        icon={CreditCard}
        label={t('usuarios.detalle.compras')}
        value={formatInteger(u.compras, lang)}
        hint={u.primera_compra ? t('usuarios.detalle.desde', { fecha: formatDate(u.primera_compra, lang) }) : t('usuarios.detalle.sinCompras')}
      />
      <Kpi icon={Tag} label={t('usuarios.detalle.ahorro')} value={formatMoney(u.ahorro_total, lang)} hint={t(u.comercios_visitados === 1 ? 'usuarios.detalle.enComercioUno' : 'usuarios.detalle.enComercios', { n: u.comercios_visitados })} />
      <Kpi
        icon={Star}
        label={t('usuarios.detalle.calificaciones')}
        value={formatInteger(u.calificaciones.total, lang)}
        hint={t('usuarios.detalle.mediaN', { n: u.calificaciones.comercios, media: promedio })}
      />
    </ul>
  );
}

const NIVELES: { codigo: NivelCodigo; rango: string }[] = [
  { codigo: 'aliado', rango: '0-19' },
  { codigo: 'aliadopro', rango: '20-49' },
  { codigo: 'aliadoplus', rango: '50+' },
];

/** Nivel actual, los tres escalones y el mantenimiento mensual. */
export function ProgresoNivelCard({ u }: { u: UsuarioDetalle }) {
  const t = useT();
  const p = u.progreso;
  const m = p.mantenimiento;
  const pct = m.requeridas > 0 ? Math.min(100, Math.round((m.hechas / m.requeridas) * 100)) : 100;
  return (
    <section aria-labelledby="progreso-titulo" className="flex flex-col gap-5 rounded-card bg-surface p-5 shadow-e1">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 id="progreso-titulo" className="text-xl font-extrabold tracking-tight">{t('usuarios.detalle.nivelProgreso')}</h2>
          <p className="text-sm text-ink-muted">
            {p.es_maximo
              ? t('usuarios.detalle.esMaximo', { nivel: NIVEL_LABEL[p.codigo] })
              : t(p.siguiente?.faltan === 1 ? 'usuarios.detalle.faltaParaSiguiente' : 'usuarios.detalle.faltanParaSiguiente', { n: p.siguiente?.faltan ?? 0, nivel: p.siguiente?.nombre ?? '' })}
          </p>
        </div>
        <NivelBadge nivel={p.codigo} />
      </header>

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {NIVELES.map(({ codigo, rango }) => (
          <li
            key={codigo}
            aria-current={codigo === p.codigo ? 'true' : undefined}
            className={cn('flex items-center gap-3 rounded-field p-3', codigo === p.codigo ? NIVEL_TONE[codigo] : 'bg-surface-2')}
          >
            <NivelIcon nivel={codigo} size={16} />
            <span className="min-w-0 flex-1">
              <span className="block font-bold leading-5">{NIVEL_LABEL[codigo]}</span>
              <span className="block font-mono text-xs opacity-80">{t('usuarios.detalle.rangoCompras', { rango })}</span>
            </span>
            {codigo === p.codigo && <Check size={18} aria-label={t('usuarios.detalle.nivelActual')} />}
          </li>
        ))}
      </ol>

      {u.nivel_forzado && <p className="rounded-field bg-warn-tint px-4 py-2 text-sm font-semibold text-warn">{t('usuarios.detalle.nivelForzado', { nivel: NIVEL_LABEL[u.nivel_forzado] })}</p>}
      {p.bajo_por_inactividad && <p className="rounded-field bg-warn-tint px-4 py-2 text-sm font-semibold text-warn">{t('usuarios.detalle.bajoInactividad')}</p>}

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm font-bold">
          <span>{t('usuarios.detalle.mantenimiento')}</span>
          <span>{t('usuarios.detalle.mantenimientoN', { hechas: m.hechas, requeridas: m.requeridas })}</span>
        </div>
        <div role="progressbar" aria-valuemin={0} aria-valuemax={m.requeridas} aria-valuenow={Math.min(m.hechas, m.requeridas)} className="h-2 overflow-hidden rounded-pill bg-surface-2">
          <div className="h-full rounded-pill bg-primary" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-ink-muted">
          {m.faltan > 0 ? t(m.faltan === 1 ? 'usuarios.detalle.mantenimientoFaltaUna' : 'usuarios.detalle.mantenimientoFaltan', { n: m.faltan, nivel: NIVEL_LABEL[p.codigo] }) : t('usuarios.detalle.mantenimientoOk', { nivel: NIVEL_LABEL[p.codigo] })}
        </p>
      </div>
    </section>
  );
}

function Dato({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface-2 text-ink-soft">
        <Icon size={16} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="break-words font-semibold leading-5">{children}</p>
      </div>
    </li>
  );
}

export function PerfilCard({ u }: { u: UsuarioDetalle }) {
  const t = useT();
  const { lang } = useLang();
  return (
    <section aria-labelledby="perfil-titulo" className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-e1">
      <h2 id="perfil-titulo" className="text-xl font-extrabold tracking-tight">{t('usuarios.detalle.perfil')}</h2>
      <ul className="flex flex-col gap-3">
        <Dato icon={Mail} label={t('usuarios.detalle.correo')}>{u.correo}</Dato>
        <Dato icon={Phone} label={t('usuarios.detalle.telefono')}>{u.telefono ?? '-'}</Dato>
        <Dato icon={MapPin} label={t('usuarios.detalle.ciudad')}>{u.ciudad ?? '-'}</Dato>
        <Dato icon={IdCard} label={t('usuarios.detalle.cedula')}>{u.cedula ?? '-'}</Dato>
        <Dato icon={Calendar} label={t('usuarios.detalle.miembroDesde')}>{formatDate(u.registro, lang)}</Dato>
        <Dato icon={Calendar} label={t('usuarios.detalle.ultimoAcceso')}>{formatDateTime(u.ultimo_acceso, lang)}</Dato>
        <Dato icon={CreditCard} label={t('usuarios.detalle.carnetPlus')}>{t(u.carnet_plus ? 'usuarios.detalle.carnetSi' : 'usuarios.detalle.carnetNo')}</Dato>
      </ul>
    </section>
  );
}
