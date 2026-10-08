import { useCallback, useMemo, useState } from 'react';
import type { Paginated } from '@/lib/api/types';
import { usePagination } from '@/lib/hooks/usePagination';
import { listarUsuarios, type UsuarioFila, type UsuariosQuery, type UsuarioTab, type UsuariosResumen } from '@/providers/usuariosProvider';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

type Filtros = Omit<UsuariosQuery, 'page' | 'limit'>;

/** B05: lista paginada con pestana de nivel/estado, busqueda y ciudad; guarda ademas el `resumen` que llega con la lista. */
export function useUsuarios() {
  const [tab, setTab] = useState<UsuarioTab>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [resumen, setResumen] = useState<UsuariosResumen | null>(null);
  const q = useDebouncedValue(busqueda.trim());
  const ciudadFiltro = useDebouncedValue(ciudad.trim());

  const fetcher = useCallback(async (params: Filtros & { page: number; limit: number }) => {
    const res = await listarUsuarios(params);
    if (!res.ok) return res;
    setResumen(res.data.resumen);
    return { ok: true as const, data: res.data as Paginated<UsuarioFila> };
  }, []);

  const initialParams = useMemo<Filtros>(() => ({ tab, q, ciudad: ciudadFiltro }), [tab, q, ciudadFiltro]);
  const list = usePagination<UsuarioFila, Filtros>({ fetcher, initialParams });
  const hayFiltros = tab !== 'todos' || q !== '' || ciudadFiltro !== '';

  const limpiar = useCallback(() => {
    setTab('todos');
    setBusqueda('');
    setCiudad('');
  }, []);

  return { ...list, tab, setTab, busqueda, setBusqueda, ciudad, setCiudad, resumen, hayFiltros, limpiar };
}
