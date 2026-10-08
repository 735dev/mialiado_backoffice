import { useCallback, useEffect, useState } from 'react';
import type { ApiError } from '@/lib/api/types';
import { listarCategorias } from '../providers/categoriasProvider';
import type { Arbol } from '../models/categoria';

/** Arbol de categorias (GET /categorias). `reload` lo vuelve a pedir sin vaciar lo que ya se ve. */
export function useCategorias() {
  const [arbol, setArbol] = useState<Arbol | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void listarCategorias().then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setArbol(res.data);
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
  return { arbol, error, isLoading: arbol === null && error === null, reload };
}
