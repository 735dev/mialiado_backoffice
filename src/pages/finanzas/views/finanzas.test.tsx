import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import type { Recarga, RecargaDetalle } from '../models/finanzas';
import FinanzasView from './FinanzasView';

const listarRecargas = vi.fn();
const obtenerResumen = vi.fn();
const obtenerRecarga = vi.fn();
const acreditarRecarga = vi.fn();
const reembolsarRecarga = vi.fn();
const conciliarPendientes = vi.fn();
vi.mock('../providers/finanzasProvider', () => ({
  listarRecargas: (...a: unknown[]) => listarRecargas(...a),
  obtenerResumen: (...a: unknown[]) => obtenerResumen(...a),
  obtenerRecarga: (...a: unknown[]) => obtenerRecarga(...a),
  acreditarRecarga: (...a: unknown[]) => acreditarRecarga(...a),
  reembolsarRecarga: (...a: unknown[]) => reembolsarRecarga(...a),
  conciliarPendientes: (...a: unknown[]) => conciliarPendientes(...a),
}));

const notifyFromApiError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('@/lib/utils/notify', () => ({
  notify: { fromApiError: (e: unknown) => notifyFromApiError(e), toast: { success: (m: string) => toastSuccess(m) } },
}));

const rec = (id: number, estado: Recarga['estado'], comercio = 'Café Páramo', monto = 25): Recarga => ({
  id,
  referencia: `TX-${id}`,
  metodo: 'paypal',
  monto,
  comision: 0.75,
  estado,
  created_at: '2026-10-02T12:42:00Z',
  comercio_id: id,
  comercio,
  logo_url: null,
});

const detalle = (r: Recarga, extra: Partial<RecargaDetalle> = {}): RecargaDetalle => ({
  id: r.id,
  referencia: r.referencia,
  metodo: r.metodo,
  monto: r.monto,
  comision: r.comision,
  estado: r.estado,
  proveedor_ref: null,
  conciliado_por: null,
  created_at: r.created_at,
  acreditada_at: null,
  comercio: { id: r.comercio_id, nombre: r.comercio, logo_url: null },
  saldo_actual: 13,
  saldo_tras_acreditar: r.estado === 'pendiente' ? 38 : null,
  linea_de_tiempo: [{ evento: 'Recarga iniciada', fecha: r.created_at }, { evento: 'Sin confirmación del procesador', hace_min: 192 }],
  ...extra,
});

const ok = <T,>(data: T) => ({ ok: true as const, data });
const page = (items: Recarga[]) => ok({ data: items, total: items.length, page: 1, limit: 9, links: { next: null, previous: null } });
const err = (status: number, detail: string) => ({ ok: false as const, status, title: 't', detail });

const PEND = rec(1, 'pendiente');
const ACRE = rec(2, 'acreditada', 'Big Burger', 100);

/** jsdom no tiene layout: `wide` decide si el detalle va a un lado (escritorio) o en una hoja (movil). */
function setViewport(wide: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches: wide,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }) as unknown as MediaQueryList) as typeof window.matchMedia;
}

beforeEach(() => {
  setViewport(true);
  resetStore();
  vi.clearAllMocks();
  signInAs('finanzas', { finanzas: { ver: true, editar: true, aprobar: true } });
  listarRecargas.mockImplementation(async (p: { estado: string }) =>
    page([PEND, ACRE].filter((r) => p.estado === 'todas' || r.estado === p.estado)),
  );
  obtenerResumen.mockResolvedValue(
    ok({
      kpis: {
        recargas_mes: { valor: 9240, variacion_pct: 7 },
        pendientes: { cantidad: 3, monto: 75 },
        comision: { valor: 277.2, variacion_pct: null },
        reembolsos: { monto: 60, operaciones: 2 },
      },
      conteos: { todas: 2, pendiente: 3, acreditada: 1, rechazada: 0, reembolsada: 0 },
    }),
  );
  obtenerRecarga.mockImplementation(async (id: number) => ok(detalle(id === 1 ? PEND : ACRE)));
  acreditarRecarga.mockResolvedValue(ok({}));
  reembolsarRecarga.mockResolvedValue(ok({}));
  conciliarPendientes.mockResolvedValue(ok({ acreditadas: 3 }));
});

describe('B09 Finanzas', () => {
  it('muestra KPIs con formato de dinero, movimientos y el detalle de la primera transaccion', async () => {
    renderWithProviders(<FinanzasView />);
    expect(await screen.findByText('$9.240,00')).toBeInTheDocument();
    expect(screen.getByText('3 · $75,00')).toBeInTheDocument();
    expect((await screen.findAllByText('Café Páramo')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Saldo tras acreditar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Conciliar 3 pendientes' })).toBeEnabled();
  });

  it('filtrar por estado y buscar vuelven a pedir la lista a la pagina 1', async () => {
    renderWithProviders(<FinanzasView />);
    await screen.findAllByText('Café Páramo');
    await userEvent.click(screen.getByRole('tab', { name: /Acreditadas/ }));
    await waitFor(() => expect(listarRecargas).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'acreditada', page: 1 })));
    await userEvent.type(screen.getByLabelText('Buscar transacción'), 'Big');
    await waitFor(() => expect(listarRecargas).toHaveBeenLastCalledWith(expect.objectContaining({ estado: 'acreditada', q: 'Big' })));
  });

  it('un reembolso pide confirmacion y solo entonces llama al backend', async () => {
    renderWithProviders(<FinanzasView />);
    await screen.findAllByText('Big Burger');
    await userEvent.click(screen.getAllByRole('button', { name: /Big Burger/ })[0]!);
    await userEvent.click(await screen.findByRole('button', { name: 'Reembolsar' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/Se devolverán \$100,00 de Big Burger/)).toBeInTheDocument();
    expect(reembolsarRecarga).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Reembolsar' }));
    await waitFor(() => expect(reembolsarRecarga).toHaveBeenCalledWith(2));
    expect(toastSuccess).toHaveBeenCalledWith('Recarga reembolsada');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('un 409 del reembolso se avisa y no cierra la sesion de trabajo', async () => {
    reembolsarRecarga.mockResolvedValue(err(409, 'El comercio ya gastó ese saldo'));
    renderWithProviders(<FinanzasView />);
    await screen.findAllByText('Big Burger');
    await userEvent.click(screen.getAllByRole('button', { name: /Big Burger/ })[0]!);
    await userEvent.click(await screen.findByRole('button', { name: 'Reembolsar' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Reembolsar' }));
    await waitFor(() => expect(notifyFromApiError).toHaveBeenCalledWith(expect.objectContaining({ status: 409 })));
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it('conciliar pide confirmacion, acredita y recarga KPIs y lista', async () => {
    renderWithProviders(<FinanzasView />);
    await userEvent.click(await screen.findByRole('button', { name: 'Conciliar 3 pendientes' }));
    const dialog = await screen.findByRole('dialog');
    const antes = obtenerResumen.mock.calls.length;
    await userEvent.click(within(dialog).getByRole('button', { name: 'Conciliar 3 pendientes' }));
    await waitFor(() => expect(conciliarPendientes).toHaveBeenCalledTimes(1));
    expect(toastSuccess).toHaveBeenCalledWith('3 recargas acreditadas');
    await waitFor(() => expect(obtenerResumen.mock.calls.length).toBeGreaterThan(antes));
  });

  it('acreditar manualmente una pendiente', async () => {
    renderWithProviders(<FinanzasView />);
    await userEvent.click(await screen.findByRole('button', { name: 'Acreditar manualmente' }));
    await waitFor(() => expect(acreditarRecarga).toHaveBeenCalledWith(1));
  });

  it('sin permiso de aprobar no hay acciones de dinero', async () => {
    resetStore();
    signInAs('finanzas', { finanzas: { ver: true, editar: false, aprobar: false } });
    renderWithProviders(<FinanzasView />);
    await screen.findByText('Saldo tras acreditar');
    expect(screen.queryByRole('button', { name: /Conciliar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Acreditar manualmente' })).not.toBeInTheDocument();
  });

  it('en movil el detalle se abre en una hoja al elegir una transaccion', async () => {
    setViewport(false);
    renderWithProviders(<FinanzasView />);
    await screen.findAllByText('Café Páramo');
    expect(screen.queryByText('Saldo tras acreditar')).not.toBeInTheDocument();
    await userEvent.click(screen.getAllByRole('button', { name: /Café Páramo/ })[0]!);
    expect(await screen.findByText('Saldo tras acreditar')).toBeInTheDocument();
  });

  it('lista vacia muestra el estado vacio', async () => {
    listarRecargas.mockResolvedValue(page([]));
    renderWithProviders(<FinanzasView />);
    expect(await screen.findByText('Sin transacciones')).toBeInTheDocument();
  });

  it('si el detalle falla ofrece reintentar', async () => {
    obtenerRecarga.mockResolvedValueOnce(err(500, 'x'));
    renderWithProviders(<FinanzasView />);
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Saldo tras acreditar')).toBeInTheDocument();
  });
});
