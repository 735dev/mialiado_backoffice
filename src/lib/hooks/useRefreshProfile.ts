import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { profileLoaded } from '@/lib/store/slices/authSlice';
import { obtenerMe } from '@/providers/adminAuthProvider';

/** Al abrir el panel con una sesion guardada, refresca el perfil y la matriz de permisos (pudo cambiar en B15). */
export function useRefreshProfile(): void {
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role ?? null);
  useEffect(() => {
    if (!role) return;
    let cancelled = false;
    void obtenerMe(role).then((res) => {
      if (!cancelled && res.ok) dispatch(profileLoaded({ user: res.data.user, permisos: res.data.permisos }));
    });
    return () => {
      cancelled = true;
    };
  }, [dispatch, role]);
}
