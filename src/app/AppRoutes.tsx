import { lazy, Suspense, useMemo, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '@/components/shell/AppShell';
import { Spinner } from '@/components/ui/Spinner';
import { homePath } from '@/lib/routes/access';
import { RedirectIfAuthenticated, RequireAccess } from '@/lib/routes/Guards';
import { PATHS } from '@/lib/routes/paths';
import { screens as allScreens } from '@/lib/routes/screens';
import type { ScreenRoute } from '@/lib/routes/types';
import { SECCIONES } from '@/lib/secciones';
import { useAppSelector } from '@/lib/store/hooks';

interface LoadedScreen {
  route: ScreenRoute;
  Component: LazyExoticComponent<ComponentType>;
}

const load = (screens: ScreenRoute[]): LoadedScreen[] => screens.map((route) => ({ route, Component: lazy(route.load) }));

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-primary-deep">
      <Spinner size={32} />
    </div>
  );
}

/** Inicio segun la sesion: login sin sesion; con sesion, la primera seccion que su rol puede ver (o B18). */
export function RootRedirect() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.user?.role ?? null);
  const permisos = useAppSelector((s) => s.auth.permisos);
  const target = isAuthenticated && role ? homePath({ role, permisos }, SECCIONES, PATHS.sinPermiso) : PATHS.login;
  return <Navigate to={target} replace />;
}

export function AppRoutes({ screens = allScreens }: { screens?: ScreenRoute[] }) {
  const plain = useMemo(() => load(screens.filter((s) => s.layout === 'plain')), [screens]);
  const shell = useMemo(() => load(screens.filter((s) => s.layout === 'shell')), [screens]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        {plain.map(({ route, Component }) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RedirectIfAuthenticated>
                <Component />
              </RedirectIfAuthenticated>
            }
          />
        ))}
        <Route
          element={
            <RequireAccess access="auth">
              <AppShell />
            </RequireAccess>
          }
        >
          {shell.map(({ route, Component }) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <RequireAccess access={route.access}>
                  <Suspense fallback={<Loading />}>
                    <Component />
                  </Suspense>
                </RequireAccess>
              }
            />
          ))}
        </Route>
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
}
