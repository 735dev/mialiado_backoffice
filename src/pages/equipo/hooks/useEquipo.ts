import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/utils/notify';
import type { FiltroEstado, ListaEquipo } from '../models/equipo';
import { listarEquipo } from '../providers/equipoProvider';

interface Snapshot {
  key: string;
  lista: ListaEquipo | null;
}

/**
 * Miembros del panel. El endpoint devuelve todo el equipo de una vez (no es paginado), asi que no usa usePagination.
 * Al cambiar de pestana o recargar conserva la lista anterior en pantalla hasta que llega la nueva.
 */
export function useEquipo() {
  const [filtro, setFiltro] = useState<FiltroEstado>('todos');
  const [tick, setTick] = useState(0);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const key = `${filtro}:${tick}`;

  useEffect(() => {
    let cancelled = false;
    void listarEquipo(filtro).then((res) => {
      if (cancelled) return;
      if (!res.ok) notify.fromApiError(res);
      setSnap({ key: `${filtro}:${tick}`, lista: res.ok ? res.data : null });
    });
    return () => {
      cancelled = true;
    };
  }, [filtro, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return {
    filtro,
    setFiltro,
    miembros: snap?.lista?.data ?? [],
    resumen: snap?.lista?.resumen ?? null,
    isLoading: snap?.key !== key,
    failed: snap !== null && snap.lista === null && snap.key === key,
    reload,
  };
}
