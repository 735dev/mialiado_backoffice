import { useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { useZodForm } from '@/components/form/useZodForm';
import { usePagination } from '@/lib/hooks/usePagination';
import { notify } from '@/lib/utils/notify';
import type { ConsultaAuditoria, DetalleEvento, Evento, Persona } from '../models/evento';
import { listarEventos, listarPersonas, obtenerEvento } from '../providers/auditoriaProvider';
import { aConsulta, filtrosIniciales, filtrosSchema, type FiltrosForm } from '../schemas/filtrosSchema';
import { hoyCaracas } from '../utils/fechas';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';

/** Registro paginado: los filtros viven en un formulario RHF+Zod y cada cambio vuelve a la pagina 1 (lo hace usePagination). */
export function useAuditoria() {
  const methods = useZodForm<FiltrosForm>(filtrosSchema, filtrosIniciales);
  const v = useWatch({ control: methods.control }) as FiltrosForm;
  const q = useDebouncedValue(v.q);

  const consulta = useMemo<ConsultaAuditoria>(
    () => aConsulta({ accion: v.accion, persona: v.persona, modulo: v.modulo, rango: v.rango, desde: v.desde, hasta: v.hasta, q }, hoyCaracas()),
    [v.accion, v.persona, v.modulo, v.rango, v.desde, v.hasta, q],
  );
  const pagination = usePagination<Evento, ConsultaAuditoria>({ fetcher: listarEventos, initialParams: consulta });
  return { methods, consulta, ...pagination };
}

/**
 * Personas para el filtro. Con permiso de Equipo se listan todas; sin el, solo las que aparecen en la pagina actual
 * (el backend no ofrece otro listado de personas a este rol).
 */
export function usePersonas(puedeVerEquipo: boolean, eventos: Evento[]): Persona[] {
  const [equipo, setEquipo] = useState<Persona[]>([]);
  useEffect(() => {
    if (!puedeVerEquipo) return;
    let cancelled = false;
    void listarPersonas().then((r) => {
      if (!cancelled && r.ok) setEquipo(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [puedeVerEquipo]);

  return useMemo(() => {
    if (puedeVerEquipo) return equipo;
    const vistas = new Map<number, string>();
    for (const e of eventos) if (e.usuario_id !== null && e.persona) vistas.set(e.usuario_id, e.persona);
    return [...vistas].map(([id, nombre]) => ({ id, nombre }));
  }, [puedeVerEquipo, equipo, eventos]);
}

export function useDetalleEvento(id: number) {
  const [snap, setSnap] = useState<{ id: number; detalle: DetalleEvento | null } | null>(null);
  useEffect(() => {
    let cancelled = false;
    void obtenerEvento(id).then((r) => {
      if (cancelled) return;
      if (!r.ok) notify.fromApiError(r);
      setSnap({ id, detalle: r.ok ? r.data : null });
    });
    return () => {
      cancelled = true;
    };
  }, [id]);
  const listo = snap?.id === id;
  return { detalle: listo ? snap.detalle : null, isLoading: !listo, failed: listo && snap.detalle === null };
}
