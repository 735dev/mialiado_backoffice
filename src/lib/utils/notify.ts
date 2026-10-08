import { toast } from 'sonner';
import type { ApiError } from '@/lib/api/types';
import { getStoreRef } from '@/lib/store';
import { showInfoModal } from '@/lib/store/slices/uiSlice';

class ConfirmRegistry {
  private map = new Map<string, () => void>();

  register(fn: () => void): string {
    const id = crypto.randomUUID();
    this.map.set(id, fn);
    return id;
  }

  run(id: string): void {
    const fn = this.map.get(id);
    this.map.delete(id);
    if (fn) fn();
  }

  discard(id: string): void {
    this.map.delete(id);
  }
}
export const confirmRegistry = new ConfirmRegistry();

const dispatch = (...args: Parameters<typeof showInfoModal>) => getStoreRef().dispatch(showInfoModal(...args));

/** Todo aviso al usuario pasa por aqui. Prohibido alert(), console.log visible o toast suelto. */
export const notify = {
  success: (description: string, code = 200) => dispatch({ type: 'success', description, code }),
  error: (description: string, code = 400) => dispatch({ type: 'error', description, code }),
  warning: (description: string, code = 400) => dispatch({ type: 'warning', description, code }),
  confirm: (description: string, onConfirm: () => void) => {
    const confirmActionId = confirmRegistry.register(onConfirm);
    dispatch({ type: 'confirm', description, confirmActionId });
  },
  toast: {
    success: (msg: string, desc?: string) => toast.success(msg, { description: desc }),
    error: (msg: string, desc?: string) => toast.error(msg, { description: desc }),
    warning: (msg: string, desc?: string) => toast.warning(msg, { description: desc }),
    info: (msg: string, desc?: string) => toast.info(msg, { description: desc }),
  },
  /** 422 muestra el `detail` exacto del backend en un toast; el resto abre el modal global. */
  fromApiError: (err: ApiError) => {
    // 422 y 403 son avisos breves: un 403 puede acabar en B18 (Sin permiso) y un toast sobrevive a ese cambio de pantalla.
    if (err.status === 422 || err.status === 403) {
      toast.error(err.detail);
      return;
    }
    dispatch({ type: err.status >= 500 || err.status === 0 ? 'error' : 'warning', description: err.detail, code: err.status });
  },
};
