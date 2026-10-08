import { useCallback, useEffect, useState } from 'react';
import type { ApiError, ApiResult } from '@/lib/api/types';
import { notify } from '@/lib/utils/notify';
import { obtenerComercio, type ComercioDetalle } from '@/providers/comerciosProvider';

type Estado = { status: 'loading' } | { status: 'error'; error: ApiError } | { status: 'ok'; data: ComercioDetalle };

/** Carga B04 y expone `run` para las acciones (cada una devuelve el detalle actualizado). */
export function useComercioDetalle(id: number) {
  const [estado, setEstado] = useState<Estado>({ status: 'loading' });
  const [tick, setTick] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void obtenerComercio(id).then((res) => {
      if (!cancelled) setEstado(res.ok ? { status: 'ok', data: res.data } : { status: 'error', error: res });
    });
    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  const retry = useCallback(() => {
    setEstado({ status: 'loading' });
    setTick((t) => t + 1);
  }, []);

  /** Ejecuta una accion; si sale bien reemplaza el detalle y avisa. Devuelve true si salio bien. */
  const run = useCallback(async (action: () => Promise<ApiResult<ComercioDetalle>>, okMessage?: string): Promise<boolean> => {
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (!res.ok) {
      notify.fromApiError(res);
      return false;
    }
    setEstado({ status: 'ok', data: res.data });
    if (okMessage) notify.toast.success(okMessage);
    return true;
  }, []);

  return { estado, retry, run, busy };
}
