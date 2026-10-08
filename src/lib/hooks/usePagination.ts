import { useCallback, useEffect, useState } from 'react';
import type { ApiResult, Paginated } from '@/lib/api/types';
import { env } from '@/lib/config/env';
import { notify } from '@/lib/utils/notify';

export interface UsePaginationArgs<T, Q extends object> {
  fetcher: (params: Q & { page: number; limit: number }) => Promise<ApiResult<Paginated<T>>>;
  initialParams: Q;
  initialLimit?: number;
  enabled?: boolean;
  /** `replace` (tablas, paginador) o `append` (scroll infinito en movil con `loadMore`). */
  mode?: 'replace' | 'append';
}

type Links = Paginated<unknown>['links'];
const NO_LINKS: Links = { next: null, previous: null };

interface Snapshot<T> {
  /** Consulta a la que corresponde este resultado; si difiere de la actual, esta cargando. */
  key: string;
  items: T[];
  total: number;
  links: Links;
}

/**
 * Listados paginados con `page`/`limit`. Si `initialParams` cambia (por contenido) vuelve a la pagina 1.
 * Descarta respuestas viejas cuando se dispara otra consulta antes de que termine la anterior.
 * Recomendado: pasar `fetcher` estable (funcion de modulo) e `initialParams` memoizado.
 */
export function usePagination<T, Q extends object>({
  fetcher,
  initialParams,
  initialLimit = env.limit,
  enabled = true,
  mode = 'replace',
}: UsePaginationArgs<T, Q>) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [params, setParams] = useState<Q>(initialParams);
  const [tick, setTick] = useState(0);
  const [snap, setSnap] = useState<Snapshot<T> | null>(null);

  // Ajuste de estado durante el render: si cambian los filtros de entrada, reinicia la pagina.
  const initialKey = JSON.stringify(initialParams);
  const [prevInitialKey, setPrevInitialKey] = useState(initialKey);
  if (prevInitialKey !== initialKey) {
    setPrevInitialKey(initialKey);
    setParams(initialParams);
    setPage(1);
  }

  const requestKey = JSON.stringify([params, page, limit, tick]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void fetcher({ ...params, page, limit }).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setSnap((prev) => ({
          key: requestKey,
          items: mode === 'append' && page > 1 && prev ? [...prev.items, ...res.data.data] : res.data.data,
          total: res.data.total,
          links: res.data.links,
        }));
      } else {
        notify.fromApiError(res);
        setSnap((prev) => ({ key: requestKey, items: prev?.items ?? [], total: prev?.total ?? 0, links: prev?.links ?? NO_LINKS }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetcher, params, page, limit, enabled, mode, requestKey]);

  const isLoading = enabled && snap?.key !== requestKey;
  const links = snap?.links ?? NO_LINKS;
  const hasMore = links.next !== null;

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) setPage((p) => p + 1);
  }, [hasMore, isLoading]);

  const reload = useCallback(() => {
    setPage(1);
    setTick((t) => t + 1);
  }, []);

  return {
    page,
    limit,
    total: snap?.total ?? 0,
    links,
    items: snap?.items ?? [],
    isLoading,
    hasMore,
    setPage,
    setLimit,
    setParams,
    loadMore,
    reload,
  };
}
