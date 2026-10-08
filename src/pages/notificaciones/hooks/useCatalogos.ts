import { useCallback, useEffect, useState } from 'react';
import type { Plantilla, Zona } from '../models/notificacion';
import { listarPlantillas, listarZonas } from '../providers/notificacionesProvider';

/** Zonas conocidas para el segmento «Por zona». Si falla, queda vacio (el segmento avisa que no hay zonas). */
export function useZonas(): Zona[] {
  const [zonas, setZonas] = useState<Zona[]>([]);
  useEffect(() => {
    let cancelled = false;
    void listarZonas().then((res) => {
      if (!cancelled && res.ok) setZonas(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return zonas;
}

export function usePlantillas(enabled: boolean) {
  const [items, setItems] = useState<Plantilla[]>([]);
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void listarPlantillas().then((res) => {
      if (cancelled) return;
      if (res.ok) setItems(res.data);
      setLoaded(tick);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled, tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { items, isLoading: enabled && loaded !== tick, reload };
}
