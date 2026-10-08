import { useCallback, useEffect, useState } from 'react';
import type { ApiError, ApiResult } from '@/lib/api/types';
import { notify } from '@/lib/utils/notify';
import {
  bloquearUsuario,
  cambiarNivelUsuario,
  desbloquearUsuario,
  enviarMensajeUsuario,
  obtenerUsuario,
  type NivelCodigo,
  type UsuarioDetalle,
} from '@/providers/usuariosProvider';

/** B06: carga el detalle y ejecuta las acciones (todas devuelven el detalle actualizado). */
export function useUsuarioDetalle(id: number) {
  const [usuario, setUsuario] = useState<UsuarioDetalle | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reinicia el estado al cambiar de usuario o reintentar
    setLoading(true);
    void obtenerUsuario(id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (res.ok) {
        setUsuario(res.data);
        setError(null);
      } else {
        setError(res);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, tick]);

  const reintentar = useCallback(() => setTick((n) => n + 1), []);

  /** Ejecuta una accion: true si salio bien (y ya refleja el detalle nuevo); los errores pasan por notify. */
  const accion = useCallback(async (fn: () => Promise<ApiResult<UsuarioDetalle>>, exito: string): Promise<ApiResult<UsuarioDetalle>> => {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (res.ok) {
      setUsuario(res.data);
      notify.toast.success(exito);
    } else {
      notify.fromApiError(res);
    }
    return res;
  }, []);

  const bloquear = useCallback((motivo: string, exito: string) => accion(() => bloquearUsuario(id, motivo), exito), [accion, id]);
  const desbloquear = useCallback((exito: string) => accion(() => desbloquearUsuario(id), exito), [accion, id]);
  const cambiarNivel = useCallback(
    (nivel: NivelCodigo | null, motivo: string, exito: string) => accion(() => cambiarNivelUsuario(id, nivel, motivo), exito),
    [accion, id],
  );
  const enviarMensaje = useCallback((titulo: string, mensaje: string) => enviarMensajeUsuario(id, titulo, mensaje), [id]);

  return { usuario, error, loading, busy, reintentar, bloquear, desbloquear, cambiarNivel, enviarMensaje };
}
