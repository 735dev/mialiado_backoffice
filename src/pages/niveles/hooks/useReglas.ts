import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@/lib/api/types';
import { obtenerReglas } from '../providers/reglasProvider';
import type { Reglas } from '../models/reglas';

/** Reglas vigentes (GET /reglas). `reload` las vuelve a pedir sin vaciar lo que ya se ve. */
export function useReglas() {
  const [data, setData] = useState<Reglas | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void obtenerReglas().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setData(res.data);
        setError(null);
      } else setError(res);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => {
    setError(null);
    setTick((t) => t + 1);
  }, []);
  return { data, error, isLoading: data === null && error === null, reload };
}
