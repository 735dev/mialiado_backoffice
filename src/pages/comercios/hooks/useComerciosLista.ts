import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

/** `?categoria=<id>` (lo usa «Ver los N comercios» de B11): id valido o null. */
function categoriaDeUrl(params: URLSearchParams): number | null {
  const n = Number(params.get('categoria'));
  return Number.isInteger(n) && n > 0 ? n : null;
}

export const FILTROS_INICIALES: FiltrosState = { tab: 'todos', q: '', categoriaId: null, zona: '' };

type Query = { tab: TabComercios; q: string; categoria_id: number | null; zona: string };

/** Lista B03: filtros + busqueda con debounce + paginacion (`usePagination`) + conteos por pestana. */
export function useComerciosLista() {
  const [params, setParams] = useSearchParams();
  const categoriaUrl = categoriaDeUrl(params);
  const [resto, setResto] = useState<Omit<FiltrosState, 'categoriaId'>>({ tab: FILTROS_INICIALES.tab, q: '', zona: '' });
  // La categoria vive en la URL (fuente unica): un enlace desde otra seccion o el boton atras la aplican sin sincronizar estados.
  const filtros = useMemo<FiltrosState>(() => ({ ...resto, categoriaId: categoriaUrl }), [resto, categoriaUrl]);
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

  const guardarCategoria = useCallback(
    (id: number | null) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (id === null) next.delete('categoria');
          else next.set('categoria', String(id));
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );
  const patch = useCallback(
    (p: Partial<FiltrosState>) => {
      const { categoriaId, ...otros } = p;
      if (Object.keys(otros).length) setResto((f) => ({ ...f, ...otros }));
      if (categoriaId !== undefined) guardarCategoria(categoriaId);
    },
    [guardarCategoria],
  );
  const limpiar = useCallback(() => {
    setResto((f) => ({ tab: f.tab, q: '', zona: '' }));
    guardarCategoria(null);
  }, [guardarCategoria]);
  const hayFiltros = filtros.q.trim() !== '' || filtros.categoriaId !== null || filtros.zona !== '';

  return { filtros, patch, limpiar, hayFiltros, conteos, categorias, zonas, lista, buscando: filtros.q.trim() !== q };
}
