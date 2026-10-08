import { useCallback } from 'react';
import type { Accion, Modulo } from '@/lib/constants/modules';
import { can } from '@/lib/routes/access';
import { persistor } from '@/lib/store';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout } from '@/lib/store/slices/authSlice';

export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const permisos = useAppSelector((s) => s.auth.permisos);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = user?.role ?? null;

  const signOut = useCallback(async () => {
    dispatch(logout());
    await persistor.purge();
  }, [dispatch]);

  /** Permiso por modulo y accion segun la matriz del backend (admin siempre puede). */
  const puede = useCallback((modulo: Modulo, accion: Accion = 'ver') => can({ role, permisos }, modulo, accion), [role, permisos]);

  return { user, role, permisos, isAuthenticated, puede, signOut };
}
