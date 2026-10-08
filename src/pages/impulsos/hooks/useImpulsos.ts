import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/lib/hooks/usePagination';
import { notify } from '@/lib/utils/notify';
import {
  listarImpulsos,
  obtenerResumenImpulsos,
  pausarImpulso,
  reanudarImpulso,
  type Dias,
  type ImpulsoEstado,
  type ImpulsoFila,
  type ImpulsosResumen,
} from '@/providers/impulsosProvider';
import { useDebouncedValue } from './useDebouncedValue';

export type FiltroEstado = 'todas' | ImpulsoEstado;
type Filtros = { estado?: ImpulsoEstado; q?: string };

/** B08: KPIs y grafico por periodo (7/30/90 dias), lista paginada de campanas con filtro por estado y busqueda, y pausar/reanudar. */
export function useImpulsos() {
  const [dias, setDias] = useState<Dias>(30);
  const [resumen, setResumen] = useState<{ dias: Dias; data: ImpulsosResumen } | null>(null);
  const [resumenError, setResumenError] = useState(false);
  const [tick, setTick] = useState(0);
  const [estado, setEstado] = useState<FiltroEstado>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const q = useDebouncedValue(busqueda.trim());

  useEffect(() => {
    let cancelled = false;
    void obtenerResumenImpulsos(dias).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setResumen({ dias, data: res.data });
        setResumenError(false);
      } else {
        setResumenError(true);
        notify.fromApiError(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dias, tick]);

  const initialParams = useMemo<Filtros>(() => ({ ...(estado === 'todas' ? {} : { estado }), ...(q ? { q } : {}) }), [estado, q]);
  const list = usePagination<ImpulsoFila, Filtros>({ fetcher: listarImpulsos, initialParams });
  const { reload } = list;

  const cambiarEstado = useCallback(
    async (impulso: ImpulsoFila, accion: 'pausar' | 'reanudar', exito: string) => {
      setBusyId(impulso.id);
      const res = await (accion === 'pausar' ? pausarImpulso(impulso.id) : reanudarImpulso(impulso.id));
      setBusyId(null);
      if (res.ok) {
        notify.toast.success(exito);
      } else {
        notify.fromApiError(res);
      }
      // En exito cambian la lista y los conteos; en 409 el estado ya era otro y tambien se refresca.
      if (res.ok || res.status === 409) {
        reload();
        setTick((n) => n + 1);
      }
    },
    [reload],
  );

  const resumenActual = resumen?.data ?? null;
  return {
    ...list,
    dias,
    setDias,
    resumen: resumenActual,
    resumenCargando: !resumenError && resumen?.dias !== dias,
    resumenError,
    reintentarResumen: () => setTick((n) => n + 1),
    estado,
    setEstado,
    busqueda,
    setBusqueda,
    busyId,
    pausar: (i: ImpulsoFila, exito: string) => cambiarEstado(i, 'pausar', exito),
    reanudar: (i: ImpulsoFila, exito: string) => cambiarEstado(i, 'reanudar', exito),
    hayFiltros: estado !== 'todas' || q !== '',
    limpiar: () => {
      setEstado('todas');
      setBusqueda('');
    },
  };
}
