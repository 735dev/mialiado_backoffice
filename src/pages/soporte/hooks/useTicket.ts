import { useCallback, useEffect, useState } from 'react';
import { notify } from '@/lib/utils/notify';
import type { TicketDetalle } from '../models/ticket';
import { obtenerTicket } from '../providers/soporteProvider';

interface Snapshot {
  id: number;
  ticket: TicketDetalle | null;
}

/** Detalle de un ticket. Al recargar tras una accion conserva el hilo en pantalla (solo la primera carga muestra «cargando»). */
export function useTicket(id: number | null) {
  const [tick, setTick] = useState(0);
  const [snap, setSnap] = useState<Snapshot | null>(null);

  useEffect(() => {
    if (id === null) return;
    let cancelled = false;
    void obtenerTicket(id).then((res) => {
      if (cancelled) return;
      if (!res.ok) notify.fromApiError(res);
      setSnap({ id, ticket: res.ok ? res.data : null });
    });
    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  const current = snap && snap.id === id ? snap : null;
  return { ticket: current?.ticket ?? null, isLoading: id !== null && current === null, failed: current !== null && current.ticket === null, reload };
}
