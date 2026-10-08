import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@/lib/api/types';
import { obtenerResumen, type DiasResumen, type Resumen } from '@/providers/resumenProvider';

interface Snapshot {
  key: string;
  data: Resumen | null;
  error: ApiError | null;
}

type Estado = { status: 'loading' } | { status: 'error'; error: ApiError } | { status: 'ok'; data: Resumen };

/** Carga GET /resumen para el rango elegido; al cambiar de rango se conserva el ultimo dato (`refreshing`) hasta que llega el nuevo. */
export function useResumen(dias: DiasResumen) {
  const [tick, setTick] = useState(0);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const key = `${dias}:${tick}`;

  useEffect(() => {
    let cancelled = false;
    void obtenerResumen(dias).then((res) => {
      if (cancelled) return;
      setSnap((prev) => (res.ok ? { key, data: res.data, error: null } : { key, data: prev?.data ?? null, error: res }));
    });
    return () => {
      cancelled = true;
    };
  }, [dias, key]);

  const retry = useCallback(() => {
    setSnap(null);
    setTick((t) => t + 1);
  }, []);

  const refreshing = snap?.key !== key;
  let estado: Estado = { status: 'loading' };
  if (snap?.error && snap.key === key) estado = { status: 'error', error: snap.error };
  else if (snap?.data) estado = { status: 'ok', data: snap.data };

  return { estado, refreshing, retry };
}
