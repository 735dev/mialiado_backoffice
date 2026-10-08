import { useEffect, useState } from 'react';
import { obtenerPendientes, type Pendientes } from '@/providers/pendientesProvider';

/** Insignias del menu. Si la persona no tiene el modulo resumen o falla la red, simplemente no hay insignias. */
export function usePendientes(enabled: boolean): Pendientes {
  const [pendientes, setPendientes] = useState<Pendientes>({});
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void obtenerPendientes().then((res) => {
      if (!cancelled && res.ok) setPendientes(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return pendientes;
}
