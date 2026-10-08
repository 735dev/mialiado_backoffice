import { LogOut, Moon, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { AliLogo, NAV_ICONS } from '@/components/shell/icons';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLang } from '@/lib/hooks/useLang';
import { useT } from '@/lib/hooks/useT';
import { useTheme } from '@/lib/hooks/useTheme';
import { GRUPOS, SECCIONES } from '@/lib/secciones';
import type { Pendientes } from '@/providers/pendientesProvider';
import { cn } from '@/lib/utils/cn';

interface SidebarProps {
  pendientes: Pendientes;
  onNavigate?: () => void;
  onSignOut: () => void;
}

/** Menu lateral del prototipo: 13 secciones en 5 grupos; solo aparecen las que el rol puede ver. */
export function Sidebar({ pendientes, onNavigate, onSignOut }: SidebarProps) {
  const t = useT();
  const { user, puede } = useAuth();
  const { isDark, toggle } = useTheme();
  const { lang, setLang } = useLang();
  const visibles = SECCIONES.filter((s) => puede(s.id));

  return (
    <div className="flex h-full flex-col gap-5 [@media(max-height:1100px)]:gap-3">
      <div className="flex h-10 items-center gap-2.5 px-1.5">
        <AliLogo />
        <span className="text-xl font-extrabold tracking-tight">aliado</span>
        <span className="ml-auto rounded-pill bg-surface-2 px-2.5 font-mono text-xs font-semibold leading-6 tracking-widest text-ink-soft">
          {t('common.adminBadge')}
        </span>
      </div>

      <nav aria-label={t('nav.label')} className="scroll-shadow flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto [@media(max-height:1100px)]:gap-2">
        {GRUPOS.map((grupo) => {
          const items = visibles.filter((s) => s.grupo === grupo);
          if (items.length === 0) return null;
          return (
            <div key={grupo} className="flex flex-col gap-0.5">
              <p className="px-3.5 pb-1.5 font-mono [@media(max-height:1100px)]:pb-0.5 text-xs font-medium uppercase tracking-widest text-ink-muted">{t(`nav.group.${grupo}`)}</p>
              {items.map((s) => {
                const Icono = NAV_ICONS[s.icono];
                const count = pendientes[s.id];
                return (
                  <NavLink
                    key={s.id}
                    to={s.ruta}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'flex h-11 items-center gap-3 rounded-pill px-3.5 text-sm [@media(max-height:1100px)]:h-9',
                        isActive ? 'bg-primary-tint font-bold text-primary-deep' : 'font-semibold text-ink-muted hover:bg-surface-2',
                      )
                    }
                  >
                    {Icono && <Icono size={20} strokeWidth={1.75} aria-hidden="true" />}
                    <span>{t(`nav.${s.id}`)}</span>
                    {count ? (
                      <span className="ml-auto min-w-[22px] rounded-pill bg-ink px-1.5 text-center text-xs font-bold leading-[22px] text-bg">{count}</span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="flex flex-col gap-3 border-t border-line pt-4 [@media(max-height:1100px)]:gap-1.5 [@media(max-height:1100px)]:pt-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={t('theme.label')}
            title={t('theme.label')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div role="group" aria-label={t('lang.label')} className="flex rounded-pill bg-surface-2 p-0.5">
            {(['es', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                aria-label={t(`lang.${l}`)}
                onClick={() => setLang(l)}
                className={cn('h-8 rounded-pill px-3 font-mono text-xs font-semibold uppercase', lang === l ? 'bg-surface text-ink shadow-e1' : 'text-ink-muted')}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-2.5 px-1">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{user.nombre}</p>
              <div className="mt-0.5">
                <Badge tone="ok">{user.rolEtiqueta ?? t(`roles.${user.role}`)}</Badge>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              aria-label={t('common.signOut')}
              title={t('common.signOut')}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-ink-soft hover:bg-surface-2"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
