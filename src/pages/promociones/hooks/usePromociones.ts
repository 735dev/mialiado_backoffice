import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ApiResult } from '@/lib/api/types';
import { usePagination } from '@/lib/hooks/usePagination';
import { notify } from '@/lib/utils/notify';
import {
  aprobarPromocion,
  aprobarSinAlertas,
  listarPromociones,
  obtenerPromocion,
  pedirCambiosPromocion,
  rechazarPromocion,
  type MotivoRechazo,
  type PromoConteos,
  type PromoDetalle,
  type PromoFila,
  type PromoTipo,
} from '@/providers/promocionesProvider';

export type FiltroTipo = 'todas' | PromoTipo;
type Filtros = { tipo?: PromoTipo };

const LIMIT = 8;

/**
 * B07: cola de revision (mas antiguas primero, "Ver las N restantes" agrega paginas), seleccion de una promocion con su detalle
 * y las acciones de moderacion. Tras cada accion la cola se vuelve a pedir (la promocion sale de la cola) y se selecciona la siguiente.
 */
export function usePromociones() {
  const [tipo, setTipo] = useState<FiltroTipo>('todas');
  const [conteos, setConteos] = useState<PromoConteos | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [detalleState, setDetalleState] = useState<{ id: number; res: ApiResult<PromoDetalle> } | null>(null);
  const [tick, setTick] = useState(0);

  const fetcher = useCallback(async (params: Filtros & { page: number; limit: number }) => {
    const res = await listarPromociones(params);
    if (res.ok) setConteos(res.data.conteos);
    return res;
  }, []);
  const initialParams = useMemo<Filtros>(() => (tipo === 'todas' ? {} : { tipo }), [tipo]);
  const list = usePagination<PromoFila, Filtros>({ fetcher, initialParams, initialLimit: LIMIT, mode: 'append' });

  const activeId = list.items.find((p) => p.id === selectedId)?.id ?? list.items[0]?.id ?? null;
  const seleccionada = list.items.find((p) => p.id === activeId) ?? null;

  useEffect(() => {
    if (activeId === null) return;
    let cancelled = false;
    void obtenerPromocion(activeId).then((res) => {
      if (!cancelled) setDetalleState({ id: activeId, res });
    });
    return () => {
      cancelled = true;
    };
  }, [activeId, tick]);

  const detalle = detalleState?.id === activeId ? detalleState.res : null;
  const reintentarDetalle = useCallback(() => setTick((n) => n + 1), []);

  const { reload } = list;
  const ejecutar = useCallback(
    async <T,>(fn: () => Promise<ApiResult<T>>, exito: (data: T) => string): Promise<boolean> => {
      setBusy(true);
      const res = await fn();
      setBusy(false);
      if (res.ok) {
        notify.toast.success(exito(res.data));
        reload();
        return true;
      }
      notify.fromApiError(res);
      // 409: otra persona ya la moderó; se refresca la cola para que desaparezca.
      if (res.status === 409) reload();
      return false;
    },
    [reload],
  );

  const aprobar = useCallback((id: number, exito: string) => ejecutar(() => aprobarPromocion(id), () => exito), [ejecutar]);
  const rechazar = useCallback(
    (id: number, motivo: MotivoRechazo, comentario: string | undefined, exito: string) => ejecutar(() => rechazarPromocion(id, motivo, comentario), () => exito),
    [ejecutar],
  );
  const pedirCambios = useCallback((id: number, comentario: string, exito: string) => ejecutar(() => pedirCambiosPromocion(id, comentario), () => exito), [ejecutar]);
  const aprobarLasSinAlertas = useCallback((exito: (n: number) => string) => ejecutar(() => aprobarSinAlertas(), (d) => exito(d.aprobadas)), [ejecutar]);

  return {
    ...list,
    tipo,
    setTipo,
    conteos,
    activeId,
    seleccionada,
    seleccionar: setSelectedId,
    detalle,
    reintentarDetalle,
    busy,
    aprobar,
    rechazar,
    pedirCambios,
    aprobarLasSinAlertas,
    restantes: Math.max(0, list.total - list.items.length),
  };
}
