import { useCallback, useEffect, useState } from 'react';
import { usePagination } from '@/lib/hooks/usePagination';
import { notify } from '@/lib/utils/notify';
import type { CatalogoColumnas, Categoria, CuerpoReporte, EstimacionReporte, Programado, Reporte, Zona } from '../models/reporte';
import {
  descargarReporte,
  estimarReporte,
  listarCategorias,
  listarProgramados,
  listarReportes,
  listarZonas,
  obtenerColumnas,
} from '../providers/reportesProvider';
import { guardarArchivo, nombreSeguro } from '@/lib/utils/descarga';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

/** Columnas por tipo, categorias y zonas para armar el reporte. Si alguna falla, el selector queda sin opciones. */
export function useCatalogos() {
  const [columnas, setColumnas] = useState<CatalogoColumnas | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);

  useEffect(() => {
    let cancelled = false;
    void obtenerColumnas().then((r) => {
      if (cancelled) return;
      if (r.ok) setColumnas(r.data);
      else notify.fromApiError(r);
    });
    void listarCategorias().then((r) => {
      if (!cancelled && r.ok) setCategorias(r.data);
    });
    void listarZonas().then((r) => {
      if (!cancelled && r.ok) setZonas(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { columnas, categorias, zonas };
}

interface Snapshot {
  key: string;
  data: EstimacionReporte | null;
}

/** Filas, columnas y tamano aproximado del reporte que se esta armando (con espera de 350 ms). */
export function useEstimacionReporte(body: CuerpoReporte | null) {
  const key = JSON.stringify(body);
  const settled = useDebouncedValue(key);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    const parsed = JSON.parse(settled) as CuerpoReporte | null;
    if (!parsed) return;
    let cancelled = false;
    void estimarReporte(parsed).then((r) => {
      if (!cancelled) setSnap({ key: settled, data: r.ok ? r.data : null });
    });
    return () => {
      cancelled = true;
    };
  }, [settled]);

  return { data: body ? (snap?.data ?? null) : null, loading: body !== null && snap?.key !== key };
}

export function useDescargas() {
  return usePagination<Reporte, Record<string, never>>({ fetcher: listarReportes, initialParams: {}, initialLimit: 6 });
}

export function useProgramados() {
  const [items, setItems] = useState<Programado[]>([]);
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listarProgramados().then((r) => {
      if (cancelled) return;
      if (r.ok) setItems(r.data);
      else notify.fromApiError(r);
      setLoaded(tick);
    });
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { items, isLoading: loaded !== tick, reload };
}

/** Descarga un reporte por apiAxios (con el token en el encabezado) y lo guarda con un nombre saneado. */
export function useDescarga() {
  const [enCurso, setEnCurso] = useState<number | null>(null);
  const descargar = async (r: Pick<Reporte, 'id' | 'nombre' | 'formato'>) => {
    setEnCurso(r.id);
    const res = await descargarReporte(r.id);
    setEnCurso(null);
    if (res.ok) guardarArchivo(res.data, nombreSeguro(r.nombre, r.formato));
    else notify.fromApiError(res);
  };
  return { descargar, enCurso };
}
