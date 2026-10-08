import { vi } from 'vitest';
import { store } from '@/lib/store';
import { hideInfoModal } from '@/lib/store/slices/uiSlice';
import { confirmRegistry, notify } from './notify';

const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: { error: (...a: unknown[]) => toastError(...a), success: vi.fn(), warning: vi.fn(), info: vi.fn(), promise: vi.fn() },
}));

describe('notify', () => {
  beforeEach(() => {
    store.dispatch(hideInfoModal());
    toastError.mockClear();
  });

  it('422 muestra el detail exacto en un toast, sin modal', () => {
    notify.fromApiError({ ok: false, status: 422, title: 't', detail: 'Correo ya registrado' });
    expect(toastError).toHaveBeenCalledWith('Correo ya registrado');
    expect(store.getState().ui.infoModal.open).toBe(false);
  });

  it('5xx abre el modal de error y 4xx el de advertencia', () => {
    notify.fromApiError({ ok: false, status: 503, title: 't', detail: 'caido' });
    expect(store.getState().ui.infoModal).toMatchObject({ open: true, type: 'error', code: 503 });
    notify.fromApiError({ ok: false, status: 403, title: 't', detail: 'no' });
    expect(store.getState().ui.infoModal).toMatchObject({ type: 'warning', code: 403 });
  });

  it('sin red (status 0) es un error', () => {
    notify.fromApiError({ ok: false, status: 0, title: 'errors.network', detail: 'errors.network' });
    expect(store.getState().ui.infoModal.type).toBe('error');
  });

  it('confirm registra la accion y la ejecuta una sola vez', () => {
    const fn = vi.fn();
    notify.confirm('common.confirm', fn);
    const id = store.getState().ui.infoModal.confirmActionId as string;
    confirmRegistry.run(id);
    confirmRegistry.run(id);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
