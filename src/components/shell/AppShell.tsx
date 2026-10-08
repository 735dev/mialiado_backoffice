import { Menu, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AliLogo } from '@/components/shell/icons';
import { Sidebar } from '@/components/shell/Sidebar';
import { useAuth } from '@/lib/hooks/useAuth';
import { usePendientes } from '@/lib/hooks/usePendientes';
import { useRefreshProfile } from '@/lib/hooks/useRefreshProfile';
import { useT } from '@/lib/hooks/useT';
import { PATHS } from '@/lib/routes/paths';
import { cerrarSesion } from '@/providers/adminAuthProvider';
import { getStoreRef } from '@/lib/store';

/**
 * Marco del panel: menu lateral flotante en escritorio (md+) y cajon con barra superior en movil.
 * Al montar refresca el perfil/permisos y las insignias de pendientes.
 */
export default function AppShell() {
  const t = useT();
  const navigate = useNavigate();
  const { puede, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const pendientes = usePendientes(puede('resumen'));
  useRefreshProfile();

  const handleSignOut = useCallback(async () => {
    await cerrarSesion(getStoreRef().getState().auth.refreshToken);
    await signOut();
    navigate(PATHS.login, { replace: true });
  }, [navigate, signOut]);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-pill focus:bg-surface focus:px-4 focus:py-2">
        {t('common.skipToContent')}
      </a>

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-surface px-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t('common.menu')}
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2"
        >
          <Menu size={22} />
        </button>
        <AliLogo size={28} />
        <span className="text-lg font-extrabold tracking-tight">aliado</span>
      </header>

      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-[288px] max-w-[85vw] bg-surface p-5 shadow-e2 transition-transform duration-200 md:bottom-5 md:left-5 md:top-5 md:w-[264px] md:translate-x-0 md:rounded-panel md:p-5 md:px-4 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t('common.closeMenu')}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-2 md:hidden"
        >
          <X size={18} />
        </button>
        <Sidebar pendientes={pendientes} onNavigate={() => setOpen(false)} onSignOut={() => void handleSignOut()} />
      </aside>

      <main id="contenido" className="min-w-0 p-4 md:py-8 md:pl-[320px] md:pr-8">
        <Outlet />
      </main>
    </div>
  );
}
