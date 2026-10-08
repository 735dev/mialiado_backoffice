import { useEffect, useState } from 'react';
import type { ApiError } from '@/lib/api/types';
import { obtenerRecarga } from '../providers/finanzasProvider';
import type { RecargaDetalle } from '../models/finanzas';

interface Loaded {
  id: number;
  key: string;
  data: RecargaDetalle | null;
  error: ApiError | null;
}

/** Detalle de la recarga elegida; `refreshKey` lo vuelve a pedir tras una accion. */
export function useRecargaDetalle(id: number | null, refreshKey: number) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${id}:${refreshKey}`;

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    void obtenerRecarga(id).then((res) => {
      if (cancelled) return;
      setLoaded(res.ok ? { id, key, data: res.data, error: null } : { id, key, data: null, error: res });
    });
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const sameId = loaded?.id === id;
  return {
    detalle: sameId ? loaded.data : null,
    error: sameId ? loaded.error : null,
    isLoading: id !== null && loaded?.key !== key,
  };
}
