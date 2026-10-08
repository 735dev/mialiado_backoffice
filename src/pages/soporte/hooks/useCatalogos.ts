import { useEffect, useState } from 'react';
import type { MiembroEquipo, PlantillaRespuesta } from '../models/ticket';
import { listarMiembros, listarPlantillasRespuesta } from '../providers/soporteProvider';

/** Plantillas de respuesta del equipo de soporte. */
export function usePlantillasRespuesta(): PlantillaRespuesta[] {
  const [items, setItems] = useState<PlantillaRespuesta[]>([]);
  useEffect(() => {
    let cancelled = false;
    void listarPlantillasRespuesta().then((res) => {
      if (!cancelled && res.ok) setItems(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return items;
}

/** Miembros a quienes se puede asignar un ticket; solo se consulta si el rol puede ver Equipo. */
export function useMiembros(enabled: boolean): MiembroEquipo[] {
  const [items, setItems] = useState<MiembroEquipo[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void listarMiembros().then((res) => {
      if (!cancelled && res.ok) setItems(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);
  return items;
}
