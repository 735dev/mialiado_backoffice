import { useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/lib/hooks/usePagination';
import { listarRecargas } from '../providers/finanzasProvider';
import type { FiltroEstado, Recarga, RecargasQuery } from '../models/finanzas';

const DEBOUNCE_MS = 350;

/** Movimientos paginados con filtro por estado y busqueda (folio o comercio) con espera al teclear. */
export function useRecargas() {
  const [estado, setEstado] = useState<FiltroEstado>('todas');
  const [texto, setTexto] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setQ(texto), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [texto]);

  const initialParams = useMemo<RecargasQuery>(() => ({ estado, q }), [estado, q]);
  const pagination = usePagination<Recarga, RecargasQuery>({ fetcher: listarRecargas, initialParams, initialLimit: 9 });
  return { ...pagination, estado, setEstado, texto, setTexto, q };
}
