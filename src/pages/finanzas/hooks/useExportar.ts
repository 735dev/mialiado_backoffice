import { useCallback } from 'react';
import { useT } from '@/lib/hooks/useT';
import type { Recarga } from '../models/finanzas';
import { downloadCsv } from '../utils/download';
import { toCsv } from '../utils/format';
import { useFormato } from './useFormato';

/** Exporta a CSV los movimientos que se ven (pagina y filtro actuales); el backend no tiene endpoint de exportacion. */
export function useExportar(items: Recarga[]) {
  const t = useT();
  const { money, dateTime } = useFormato();
  return useCallback(() => {
    const head = ['transaccion', 'comercio', 'metodo', 'monto', 'comision', 'estado', 'fecha'].map((k) => t(`finanzas.col.${k}`));
    const rows = items.map((r) => [r.referencia, r.comercio, r.metodo, money(r.monto), money(r.comision), t(`finanzas.estado.${r.estado}`), dateTime(r.created_at)]);
    downloadCsv('movimientos.csv', toCsv([head, ...rows]));
  }, [items, t, money, dateTime]);
}
