import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import type { ImpulsoFila, ImpulsosResumen } from '@/providers/impulsosProvider';
import ImpulsosView from './ImpulsosView';

const obtenerResumenImpulsos = vi.fn();
const listarImpulsos = vi.fn();
const pausarImpulso = vi.fn();
const reanudarImpulso = vi.fn();
vi.mock('@/providers/impulsosProvider', () => ({
  obtenerResumenImpulsos: (...a: unknown[]) => obtenerResumenImpulsos(...a),
  listarImpulsos: (...a: unknown[]) => listarImpulsos(...a),
  pausarImpulso: (...a: unknown[]) => pausarImpulso(...a),
  reanudarImpulso: (...a: unknown[]) => reanudarImpulso(...a),
}));

const notifyConfirm = vi.fn((_d: string, fn: () => void) => fn());
const notifyFromApiError = vi.fn();
vi.mock('@/lib/utils/notify', () => ({
  notify: {
    confirm: (d: string, fn: () => void) => notifyConfirm(d, fn),
    fromApiError: (e: unknown) => notifyFromApiError(e),
    toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  },
}));

const resumen = (dias: 7 | 30 | 90 = 30): ImpulsosResumen => ({
  dias,
  kpis: {
    gasto_total: { valor: 39.5, variacion_pct: null },
    vistas: { valor: 11969, variacion_pct: 12 },
    ctr: { valor: 2.3, variacion_pts: -0.4, definicion: 'canjes / vistas' },
    canjes_atribuidos: { valor: 278, variacion_pct: -2 },
  },
  serie: [
    { fecha: '2026-10-06', gasto: 4, canjes: 2 },
    { fecha: '2026-10-07', gasto: 6, canjes: 3 },
    { fecha: '2026-10-08', gasto: 0, canjes: 0 },
  ],
  campanas: { total: 4, en_curso: 3, finalizadas: 0, pausadas: 1 },
  puja_promedio: 2.13,
  puja_minima: 1,
});

const fila = (id: number, comercio: string, estado: ImpulsoFila['estado']): ImpulsoFila => ({
  id,
  puja_diaria: 2,
  dias: 3,
  gasto: 6,
  vistas: 1920,
  canjes: 54,
  estado,
  inicio: null,
  fin: null,
  comercio_id: id,
  comercio,
  logo_url: null,
  promocion: 'Doble Queso Burger',
  alcance_min: 400,
  alcance_max: 900,
});

const page = (data: ImpulsoFila[]) => ({ ok: true as const, data: { data, total: data.length, page: 1, limit: 10, links: { next: null, previous: null } } });

const renderView = () => renderWithProviders(<ImpulsosView />);

beforeEach(() => {
  resetStore();
  signInAs('admin');
  [obtenerResumenImpulsos, listarImpulsos, pausarImpulso, reanudarImpulso, notifyFromApiError].forEach((m) => m.mockReset());
  notifyConfirm.mockClear();
  obtenerResumenImpulsos.mockImplementation((dias: 7 | 30 | 90) => Promise.resolve({ ok: true, data: resumen(dias) }));
  listarImpulsos.mockResolvedValue(page([fila(1, 'Big Burger', 'en_curso'), fila(2, 'Café Páramo', 'pausada'), fila(3, 'Burger Queen', 'finalizada')]));
});

describe('B08 impulsos', () => {
  it('muestra KPIs, el grafico con su resumen accesible y las campanas', async () => {
    renderView();
    expect(await screen.findByText('Big Burger')).toBeInTheDocument();
    expect(screen.getByText('Gasto total')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /5 canjes atribuidos en los últimos 30 días/ })).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1–3 de 3 campañas')).toBeInTheDocument();
    expect(screen.getByText(/Mínimo permitido/)).toBeInTheDocument();
  });

  it('cambiar el periodo vuelve a pedir el resumen', async () => {
    renderView();
    await screen.findByText('Big Burger');
    await userEvent.click(screen.getByRole('tab', { name: '90 d' }));
    await waitFor(() => expect(obtenerResumenImpulsos).toHaveBeenLastCalledWith(90));
  });

  it('el filtro por estado y la busqueda se envian al backend', async () => {
    renderView();
    await screen.findByText('Big Burger');
    await userEvent.click(screen.getByRole('tab', { name: 'Pausadas' }));
    await waitFor(() => expect(listarImpulsos).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'pausada', page: 1 })));
    await userEvent.type(screen.getByPlaceholderText('Buscar comercio o campaña'), 'caf');
    await waitFor(() => expect(listarImpulsos).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'pausada', q: 'caf' })), { timeout: 2000 });
  });

  it('pausa una campana en curso con confirmacion y refresca', async () => {
    pausarImpulso.mockResolvedValue({ ok: true, data: { id: 1, estado: 'pausada' } });
    renderView();
    await screen.findByText('Big Burger');
    const llamadas = listarImpulsos.mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pausar la campaña de Big Burger' }));
    expect(notifyConfirm).toHaveBeenCalledWith(expect.stringContaining('Big Burger'), expect.any(Function));
    await waitFor(() => expect(pausarImpulso).toHaveBeenCalledWith(1));
    await waitFor(() => expect(listarImpulsos.mock.calls.length).toBeGreaterThan(llamadas));
  });

  it('reanuda una pausada; las finalizadas no tienen accion', async () => {
    reanudarImpulso.mockResolvedValue({ ok: true, data: { id: 2, estado: 'en_curso' } });
    renderView();
    await screen.findByText('Café Páramo');
    expect(screen.queryByRole('button', { name: /campaña de Burger Queen/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reanudar la campaña de Café Páramo' }));
    await waitFor(() => expect(reanudarImpulso).toHaveBeenCalledWith(2));
  });

  it('un 409 al pausar avisa y refresca la lista', async () => {
    pausarImpulso.mockResolvedValue({ ok: false, status: 409, title: 'c', detail: 'La campaña ya no está en curso' });
    renderView();
    await screen.findByText('Big Burger');
    const llamadas = listarImpulsos.mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Pausar la campaña de Big Burger' }));
    await waitFor(() => expect(notifyFromApiError).toHaveBeenCalledWith(expect.objectContaining({ status: 409 })));
    await waitFor(() => expect(listarImpulsos.mock.calls.length).toBeGreaterThan(llamadas));
  });

  it('sin permiso de editar, pausar y reanudar quedan desactivados', async () => {
    resetStore();
    signInAs('finanzas', { impulsos: { ver: true, editar: false, aprobar: false } });
    renderView();
    await screen.findByText('Big Burger');
    expect(screen.getByRole('button', { name: 'Pausar la campaña de Big Burger' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Reanudar la campaña de Café Páramo' })).toBeDisabled();
  });

  it('sin campanas muestra el estado vacio; con filtros ofrece quitarlos', async () => {
    listarImpulsos.mockResolvedValue(page([]));
    renderView();
    expect(await screen.findByText('Aún no hay campañas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: 'En curso' }));
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
  });

  it('si el resumen falla ofrece reintentar', async () => {
    obtenerResumenImpulsos.mockResolvedValue({ ok: false, status: 500, title: 't', detail: 'boom' });
    renderView();
    expect(await screen.findByText('No pudimos cargar el resumen de impulsos')).toBeInTheDocument();
    obtenerResumenImpulsos.mockImplementation((dias: 7 | 30 | 90) => Promise.resolve({ ok: true, data: resumen(dias) }));
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Gasto total')).toBeInTheDocument();
  });
});
