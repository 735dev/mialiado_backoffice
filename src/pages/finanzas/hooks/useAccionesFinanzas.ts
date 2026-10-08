import { useCallback, useState } from 'react';
import type { ApiResult } from '@/lib/api/types';
import { useT } from '@/lib/hooks/useT';
import { notify } from '@/lib/utils/notify';
import { acreditarRecarga, conciliarPendientes, reembolsarRecarga } from '../providers/finanzasProvider';

export type Accion = 'acreditar' | 'reembolsar' | 'conciliar';

/**
 * Acciones de escritura de B09. Cada una avisa el resultado (los 409/403 del backend salen por notify.fromApiError)
 * y llama a `onDone` para que la pantalla recargue lista, KPIs y detalle.
 */
export function useAccionesFinanzas(onDone: () => void) {
  const t = useT();
  const [busy, setBusy] = useState<Accion | null>(null);

  const run = useCallback(
    async <T,>(accion: Accion, request: () => Promise<ApiResult<T>>, message: (data: T) => string) => {
      setBusy(accion);
      const res = await request();
      setBusy(null);
      if (!res.ok) {
        notify.fromApiError(res);
        return false;
      }
      notify.toast.success(message(res.data));
      onDone();
      return true;
    },
    [onDone],
  );

  const acreditar = useCallback((id: number) => run('acreditar', () => acreditarRecarga(id), () => t('finanzas.toast.acreditada')), [run, t]);
  const reembolsar = useCallback((id: number) => run('reembolsar', () => reembolsarRecarga(id), () => t('finanzas.toast.reembolsada')), [run, t]);
  const conciliar = useCallback(
    () => run('conciliar', conciliarPendientes, (d) => t('finanzas.toast.conciliadas', { n: d.acreditadas })),
    [run, t],
  );

  return { busy, acreditar, reembolsar, conciliar };
}
