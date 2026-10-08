import { useCallback, useState } from 'react';
import type { ApiResult } from '@/lib/api/types';
import { useT } from '@/lib/hooks/useT';
import { notify } from '@/lib/utils/notify';
import type { ActualizarCategoriaBody, CrearCategoriaBody } from '../models/categoria';
import { actualizarCategoria, crearCategoria, eliminarCategoria, ordenarCategorias } from '../providers/categoriasProvider';

/**
 * Escrituras de B11. Cada una devuelve `true` si salio bien; si no, avisa con notify.fromApiError (409 al eliminar una
 * categoria con subcategorias o comercios incluido). Tras un exito se recarga el arbol con `onDone`.
 */
export function useAccionesCategorias(onDone: () => void) {
  const t = useT();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async (request: () => Promise<ApiResult<unknown>>, message?: string) => {
      setBusy(true);
      const res = await request();
      setBusy(false);
      if (!res.ok) {
        notify.fromApiError(res);
        return false;
      }
      if (message) notify.toast.success(message);
      onDone();
      return true;
    },
    [onDone],
  );

  const crear = useCallback((body: CrearCategoriaBody) => run(() => crearCategoria(body), t('categorias.toast.creada')), [run, t]);
  const actualizar = useCallback(
    (id: number, body: ActualizarCategoriaBody, message?: string) => run(() => actualizarCategoria(id, body), message),
    [run],
  );
  const ordenar = useCallback(
    (orden: Array<{ id: number; posicion: number }>, message?: string) => run(() => ordenarCategorias(orden), message),
    [run],
  );
  const eliminar = useCallback((id: number) => run(() => eliminarCategoria(id), t('categorias.toast.eliminada')), [run, t]);

  return { busy, crear, actualizar, ordenar, eliminar };
}
