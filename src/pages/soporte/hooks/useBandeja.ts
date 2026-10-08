import { useCallback, useMemo, useState } from 'react';
import { usePagination } from '@/lib/hooks/usePagination';
import type { ConsultaBandeja, ConteosBandeja, OrigenTicket, Prioridad, TabBandeja, TicketResumen } from '../models/ticket';
import { listarTickets } from '../providers/soporteProvider';
import { useDebounced } from './useDebounced';

/** Bandeja paginada: pestana, busqueda (con espera), filtros y los conteos que devuelve el servidor. */
export function useBandeja() {
  const [tab, setTab] = useState<TabBandeja>('abiertos');
  const [busqueda, setBusqueda] = useState('');
  const [prioridad, setPrioridad] = useState<Prioridad | ''>('');
  const [origen, setOrigen] = useState<OrigenTicket | ''>('');
  const [conteos, setConteos] = useState<ConteosBandeja | null>(null);
  const q = useDebounced(busqueda);

  const fetcher = useCallback(async (p: ConsultaBandeja & { page: number; limit: number }) => {
    const res = await listarTickets(p);
    if (res.ok) setConteos(res.data.conteos);
    return res;
  }, []);

  const initialParams = useMemo<ConsultaBandeja>(() => ({ tab, q, prioridad, origen }), [tab, q, prioridad, origen]);
  const pagination = usePagination<TicketResumen, ConsultaBandeja>({ fetcher, initialParams, initialLimit: 8 });

  return { ...pagination, tab, setTab, busqueda, setBusqueda, prioridad, setPrioridad, origen, setOrigen, conteos };
}
