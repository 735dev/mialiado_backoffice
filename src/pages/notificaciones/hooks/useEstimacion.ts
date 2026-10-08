import { useEffect, useState } from 'react';
import type { Estimacion, ParamsEstimar } from '../models/notificacion';
import { estimarAlcance } from '../providers/notificacionesProvider';
import { useDebounced } from './useDebounced';

interface Snapshot {
  key: string;
  data: Estimacion | null;
}

/** Alcance estimado de un segmento (con espera de 350 ms al cambiar). `loading` mientras la consulta vigente no responde. */
export function useEstimacion(params: ParamsEstimar, enabled = true) {
  const key = JSON.stringify(params);
  const settled = useDebounced(key);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void estimarAlcance(JSON.parse(settled) as ParamsEstimar).then((res) => {
      if (!cancelled) setSnap({ key: settled, data: res.ok ? res.data : null });
    });
    return () => {
      cancelled = true;
    };
  }, [settled, enabled]);

  return { data: snap?.data ?? null, loading: enabled && snap?.key !== key };
}
