import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Accion, Modulo } from '@/lib/constants/modules';
import { ROLES, type Role } from '@/lib/constants/roles';
import { useT } from '@/lib/hooks/useT';
import { notify } from '@/lib/utils/notify';
import type { MatrizPermisos, RespuestaPermisos } from '../models/equipo';
import { guardarPermisos, obtenerPermisos } from '../providers/equipoProvider';
import { alternar, diferencias, normalizar } from '../utils/permisos';

const EDITABLES = ROLES.filter((r): r is Exclude<Role, 'admin'> => r !== 'admin');

/** Matriz de permisos por rol: se edita un borrador local y recien «Guardar permisos» envia solo lo que cambio. */
export function usePermisos(onSaved?: () => void) {
  const t = useT();
  const [tick, setTick] = useState(0);
  const [datos, setDatos] = useState<{ tick: number; respuesta: RespuestaPermisos | null } | null>(null);
  const [borrador, setBorrador] = useState<MatrizPermisos | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void obtenerPermisos().then((res) => {
      if (cancelled) return;
      if (!res.ok) notify.fromApiError(res);
      setDatos({ tick, respuesta: res.ok ? res.data : null });
      setBorrador(res.ok ? normalizar(res.data.permisos, EDITABLES) : null);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const respuesta = datos?.respuesta ?? null;
  const original = useMemo(() => (respuesta ? normalizar(respuesta.permisos, EDITABLES) : null), [respuesta]);
  const cambios = useMemo(() => (original && borrador ? diferencias(original, borrador) : {}), [original, borrador]);
  const sucio = Object.keys(cambios).length > 0;

  const toggle = useCallback((rol: Role, modulo: Modulo, accion: Accion) => {
    setBorrador((prev) => (prev ? alternar(prev, rol, modulo, accion) : prev));
  }, []);

  const descartar = useCallback(() => setBorrador(original), [original]);

  const guardar = async () => {
    if (!sucio) return;
    setGuardando(true);
    const res = await guardarPermisos(cambios);
    setGuardando(false);
    if (!res.ok) {
      notify.fromApiError(res);
      return;
    }
    notify.toast.success(t('equipo.matrix.saved'));
    setTick((n) => n + 1);
    onSaved?.();
  };

  return {
    isLoading: datos === null,
    failed: datos !== null && respuesta === null,
    respuesta,
    borrador,
    sucio,
    guardando,
    toggle,
    descartar,
    guardar,
    reload: () => setTick((n) => n + 1),
  };
}
