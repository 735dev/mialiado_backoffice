import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import type { PromoDetalle, PromoFila } from '@/providers/promocionesProvider';
import PromocionesView from './PromocionesView';

const listarPromociones = vi.fn();
const obtenerPromocion = vi.fn();
const aprobarPromocion = vi.fn();
const rechazarPromocion = vi.fn();
const pedirCambiosPromocion = vi.fn();
const aprobarSinAlertas = vi.fn();
vi.mock('@/providers/promocionesProvider', () => ({
  listarPromociones: (...a: unknown[]) => listarPromociones(...a),
  obtenerPromocion: (...a: unknown[]) => obtenerPromocion(...a),
  aprobarPromocion: (...a: unknown[]) => aprobarPromocion(...a),
  rechazarPromocion: (...a: unknown[]) => rechazarPromocion(...a),
  pedirCambiosPromocion: (...a: unknown[]) => pedirCambiosPromocion(...a),
  aprobarSinAlertas: (...a: unknown[]) => aprobarSinAlertas(...a),
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

const fila = (id: number, titulo: string, extra: Partial<PromoFila> = {}): PromoFila => ({
  id,
  codigo: `AL-PD-${id}`,
  titulo,
  tipo: 'descuento',
  foto: null,
  comercio: { id: 1, nombre: 'Golos Postres', logo_url: null },
  enviada_por: 'Golos Dueño',
  creada: new Date(Date.now() - 3 * 3600_000).toISOString(),
  descuento_base: 15,
  descuento_max: 25,
  alertas: [],
  revision: 'Listo',
  tope: 50,
  ...extra,
});

const detalle = (f: PromoFila, extra: Partial<PromoDetalle> = {}): PromoDetalle => ({
  ...f,
  estado: 'pendiente',
  descripcion: null,
  fotos: [],
  precio_normal: 10,
  inicio: new Date().toISOString(),
  fin: new Date(Date.now() + 10 * 86400_000).toISOString(),
  hora_desde: null,
  hora_hasta: null,
  dias: null,
  condiciones: [],
  precios_por_nivel: [
    { nivel: 'aliado', descuento_pct: 15, precio: 8.5, puntos_extra: 0 },
    { nivel: 'aliadopro', descuento_pct: 20, precio: 8, puntos_extra: 5 },
    { nivel: 'aliadoplus', descuento_pct: 25, precio: 7.5, puntos_extra: 10 },
  ],
  reglas_automaticas: {
    cumplidas: 4,
    total: 5,
    checks: [
      { clave: 'descuento_maximo', ok: true, texto: '-25% con AliadoPlus. Tope: 50 %' },
      { clave: 'fotos', ok: false, texto: '0 cargadas' },
    ],
  },
  comercio_detalle: { id: 1, nombre: 'Golos Postres', rif: 'J-1', verificacion: 'verificado', direccion: 'Av. Principal' },
  motivos_rechazo: [
    { codigo: 'supera_maximo', texto: 'Supera el máximo permitido' },
    { codigo: 'otro', texto: 'Otro motivo' },
  ],
  ...extra,
});

const A = fila(9, 'Brownie con helado');
const B = fila(12, 'Vitaminas y suplementos', { tipo: 'flash', revision: 'Sin foto', alertas: [{ codigo: 'sin_foto', mensaje: 'Sin foto' }] });

const cola = (items: PromoFila[], total = items.length) => ({
  ok: true as const,
  data: { data: items, total, page: 1, limit: 8, links: { next: null, previous: null }, conteos: { todas: total, descuento: 1, flash: 1, sin_alertas: 1 } },
});

function setup(items = [A, B]) {
  listarPromociones.mockResolvedValue(cola(items));
  obtenerPromocion.mockImplementation((id: number) => Promise.resolve({ ok: true, data: detalle(items.find((i) => i.id === id) ?? A) }));
}

beforeEach(() => {
  resetStore();
  signInAs('admin');
  [listarPromociones, obtenerPromocion, aprobarPromocion, rechazarPromocion, pedirCambiosPromocion, aprobarSinAlertas, notifyFromApiError].forEach((m) => m.mockReset());
  notifyConfirm.mockClear();
});

describe('B07 moderacion de promociones', () => {
  it('muestra la cola, selecciona la primera y carga su detalle con reglas y precios', async () => {
    setup();
    renderWithProviders(<PromocionesView />);
    expect(await screen.findByRole('article', { name: 'Brownie con helado' })).toBeInTheDocument();
    expect(obtenerPromocion).toHaveBeenCalledWith(9);
    expect(screen.getByText('4 de 5')).toBeInTheDocument();
    expect(screen.getByText('Precio por nivel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vitaminas y suplementos/ })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: /Vitaminas y suplementos/ }));
    expect(await screen.findByRole('article', { name: 'Vitaminas y suplementos' })).toBeInTheDocument();
  });

  it('el filtro por tipo pide solo ese tipo al backend', async () => {
    setup();
    renderWithProviders(<PromocionesView />);
    await screen.findByRole('article', { name: 'Brownie con helado' });
    await userEvent.click(screen.getByRole('tab', { name: /Promo Flash/ }));
    await waitFor(() => expect(listarPromociones).toHaveBeenLastCalledWith(expect.objectContaining({ tipo: 'flash', page: 1 })));
  });

  it('aprobar llama al backend y vuelve a pedir la cola', async () => {
    setup();
    aprobarPromocion.mockResolvedValue({ ok: true, data: { id: 9, estado: 'activa' } });
    renderWithProviders(<PromocionesView />);
    await screen.findByRole('article', { name: 'Brownie con helado' });
    listarPromociones.mockResolvedValue(cola([B]));
    await userEvent.click(screen.getByRole('button', { name: 'Aprobar y publicar' }));
    await waitFor(() => expect(aprobarPromocion).toHaveBeenCalledWith(9));
    expect(await screen.findByRole('article', { name: 'Vitaminas y suplementos' })).toBeInTheDocument();
  });

  it('rechazar abre B17: exige motivo, y "Otro" exige comentario', async () => {
    setup();
    rechazarPromocion.mockResolvedValue({ ok: true, data: { id: 9, estado: 'rechazada' } });
    renderWithProviders(<PromocionesView />);
    await screen.findByRole('article', { name: 'Brownie con helado' });
    await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rechazar promoción' }));
    expect(await within(dialog).findByText('Este campo es obligatorio')).toBeInTheDocument();
    expect(rechazarPromocion).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('radio', { name: 'Otro motivo' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rechazar promoción' }));
    expect(await within(dialog).findByText('Este campo es obligatorio')).toBeInTheDocument();
    expect(rechazarPromocion).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('radio', { name: 'Supera el máximo permitido' }));
    await userEvent.type(within(dialog).getByLabelText(/Comentario para el comercio/), 'Baja el descuento');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rechazar promoción' }));
    await waitFor(() => expect(rechazarPromocion).toHaveBeenCalledWith(9, 'supera_maximo', 'Baja el descuento'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('pedir cambios exige la nota para el comercio', async () => {
    setup();
    pedirCambiosPromocion.mockResolvedValue({ ok: true, data: { id: 9, estado: 'borrador' } });
    renderWithProviders(<PromocionesView />);
    await screen.findByRole('article', { name: 'Brownie con helado' });
    await userEvent.click(screen.getByRole('button', { name: 'Pedir cambios' }));
    expect(await screen.findByText('Debe tener al menos 3 caracteres')).toBeInTheDocument();
    expect(pedirCambiosPromocion).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText('Nota para el comercio'), 'Foto más nítida');
    await userEvent.click(screen.getByRole('button', { name: 'Pedir cambios' }));
    await waitFor(() => expect(pedirCambiosPromocion).toHaveBeenCalledWith(9, 'Foto más nítida'));
  });

  it('un 409 (ya moderada) avisa y refresca la cola', async () => {
    setup();
    aprobarPromocion.mockResolvedValue({ ok: false, status: 409, title: 'c', detail: 'La promoción ya no está pendiente' });
    renderWithProviders(<PromocionesView />);
    await screen.findByRole('article', { name: 'Brownie con helado' });
    const llamadas = listarPromociones.mock.calls.length;
    await userEvent.click(screen.getByRole('button', { name: 'Aprobar y publicar' }));
    await waitFor(() => expect(notifyFromApiError).toHaveBeenCalledWith(expect.objectContaining({ status: 409 })));
    await waitFor(() => expect(listarPromociones.mock.calls.length).toBeGreaterThan(llamadas));
  });

  it('"Aprobar las N sin alertas" pide confirmacion', async () => {
    setup();
    aprobarSinAlertas.mockResolvedValue({ ok: true, data: { aprobadas: 1 } });
    renderWithProviders(<PromocionesView />);
    await screen.findByRole('article', { name: 'Brownie con helado' });
    await userEvent.click(screen.getByRole('button', { name: 'Aprobar las 1 sin alertas' }));
    expect(notifyConfirm).toHaveBeenCalled();
    await waitFor(() => expect(aprobarSinAlertas).toHaveBeenCalled());
  });

  it('sin permiso de aprobar las acciones quedan desactivadas', async () => {
    resetStore();
    signInAs('moderador', { promociones: { ver: true, editar: true, aprobar: false } });
    setup();
    renderWithProviders(<PromocionesView />);
    await screen.findByRole('article', { name: 'Brownie con helado' });
    for (const name of ['Aprobar y publicar', 'Rechazar', 'Pedir cambios', 'Aprobar las 1 sin alertas']) {
      expect(screen.getByRole('button', { name })).toBeDisabled();
    }
  });

  it('cola vacia muestra el estado "al dia"', async () => {
    listarPromociones.mockResolvedValue(cola([]));
    renderWithProviders(<PromocionesView />);
    expect(await screen.findByText('Cola al día')).toBeInTheDocument();
  });
});
