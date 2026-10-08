import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/lib/hooks/usePagination';
import {
  listarCategorias,
  listarComercios,
  listarZonas,
  type CategoriaOpcion,
  type ComercioItem,
  type ConteosComercios,
  type TabComercios,
  type ZonaOpcion,
} from '@/providers/comerciosProvider';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

export interface FiltrosState {
  tab: TabComercios;
  q: string;
  categoriaId: number | null;
  zona: string;
}

export const FILTROS_INICIALES: FiltrosState = { tab: 'todos', q: '', categoriaId: null, zona: '' };

type Query = { tab: TabComercios; q: string; categoria_id: number | null; zona: string };

/** Lista B03: filtros + busqueda con debounce + paginacion (`usePagination`) + conteos por pestana. */
export function useComerciosLista() {
  const [filtros, setFiltros] = useState<FiltrosState>(FILTROS_INICIALES);
  const [conteos, setConteos] = useState<ConteosComercios | null>(null);
  const [categorias, setCategorias] = useState<CategoriaOpcion[]>([]);
  const [zonas, setZonas] = useState<ZonaOpcion[]>([]);
  const q = useDebouncedValue(filtros.q.trim(), 350);

  const fetcher = useCallback(async (p: Query & { page: number; limit: number }) => {
    const res = await listarComercios(p);
    if (res.ok) setConteos(res.data.conteos);
    return res;
  }, []);

  const initialParams = useMemo<Query>(
    () => ({ tab: filtros.tab, q, categoria_id: filtros.categoriaId, zona: filtros.zona }),
    [filtros.tab, q, filtros.categoriaId, filtros.zona],
  );
  const lista = usePagination<ComercioItem, Query>({ fetcher, initialParams });

  useEffect(() => {
    let cancelled = false;
    void listarCategorias().then((r) => !cancelled && r.ok && setCategorias(r.data));
    void listarZonas().then((r) => !cancelled && r.ok && setZonas(r.data));
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = useCallback((p: Partial<FiltrosState>) => setFiltros((f) => ({ ...f, ...p })), []);
  const limpiar = useCallback(() => setFiltros((f) => ({ ...FILTROS_INICIALES, tab: f.tab })), []);
  const hayFiltros = filtros.q.trim() !== '' || filtros.categoriaId !== null || filtros.zona !== '';

  return { filtros, patch, limpiar, hayFiltros, conteos, categorias, zonas, lista, buscando: filtros.q.trim() !== q };
}
