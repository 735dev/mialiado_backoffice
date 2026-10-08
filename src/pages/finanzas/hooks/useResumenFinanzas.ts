import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@/lib/api/types';
import { obtenerResumen } from '../providers/finanzasProvider';
import type { ResumenFinanzas } from '../models/finanzas';

/** KPIs y conteos por estado de las tarjetas y las pestañas. */
export function useResumenFinanzas() {
  const [data, setData] = useState<ResumenFinanzas | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void obtenerResumen().then((res) => {
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

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, isLoading: data === null && error === null, reload };
}
