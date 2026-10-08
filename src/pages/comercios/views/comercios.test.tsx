import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComercioDetalle, ComercioItem } from '@/providers/comerciosProvider';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import ComercioDetalleView from './ComercioDetalleView';
import ComerciosView from './ComerciosView';

const listarComercios = vi.fn();
const obtenerComercio = vi.fn();
const aprobarComercio = vi.fn();
const rechazarComercio = vi.fn();
const revisarDocumento = vi.fn();
const iniciarRevision = vi.fn();
vi.mock('@/providers/comerciosProvider', () => ({
  listarComercios: (...a: unknown[]) => listarComercios(...a),
  obtenerComercio: (...a: unknown[]) => obtenerComercio(...a),
  aprobarComercio: (...a: unknown[]) => aprobarComercio(...a),
  rechazarComercio: (...a: unknown[]) => rechazarComercio(...a),
  revisarDocumento: (...a: unknown[]) => revisarDocumento(...a),
  iniciarRevision: (...a: unknown[]) => iniciarRevision(...a),
  invitarComercio: vi.fn(),
  listarCategorias: async () => ({ ok: true, data: [{ id: 1, nombre: 'Restaurantes' }] }),
  listarZonas: async () => ({ ok: true, data: [{ id: 1, nombre: 'Guasimos' }] }),
}));

vi.mock('@/lib/utils/notify', () => ({
  notify: {
    fromApiError: vi.fn(),
    confirm: (_d: string, ok: () => void) => ok(),
    toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
  },
  confirmRegistry: { discard: vi.fn(), run: vi.fn() },
}));

const item = (id: number, nombre: string, estado: ComercioItem['estado'] = 'Activo'): ComercioItem => ({
  id,
  nombre,
  rif: `J-0000${id}-1`,
  logo_url: null,
  zona: 'Guasimos',
  categoria: 'Restaurantes',
  verificacion: estado === 'Por verificar' ? 'pendiente' : 'verificado',
  sts: 'A',
  estado,
  promos: 2,
  canjes_30d: 177,
  created_at: '2026-03-14T10:00:00',
});

const CONTEOS = { todos: 3, por_verificar: 1, activos: 2, suspendidos: 0 };

function pagina(items: ComercioItem[], total = items.length) {
  return { ok: true as const, data: { data: items, total, page: 1, limit: 10, links: { next: null, previous: null }, conteos: CONTEOS } };
}

const detalle = (over: Partial<ComercioDetalle> = {}): ComercioDetalle => ({
  id: 1,
  nombre: 'Pizzería Don Nino',
  rif: 'J-50218934-1',
  razon_social: 'Inversiones Don Nino 2026, C.A.',
  categoria: 'Comida y alimentos › Restaurantes',
  direccion: 'Calle 5, Urb. Los Guasimos',
  zona: 'Guasimos',
  ciudad: 'San Cristóbal',
  lat: 7.7669,
  lng: -72.225,
  logo_url: null,
  whatsapp: '+58 424 770 3128',
  instagram: '@pizzeriadonnino',
  correo_contacto: 'donnino@gmail.com',
  verificacion: 'pendiente',
  motivo_rechazo: null,
  sts: 'A',
  estado: 'Por verificar',
  created_at: '2026-09-29T16:12:00',
  horario: [
    { dia: 0, nombre: 'Lunes', abierto: false, turnos: [] },
    { dia: 1, nombre: 'Martes', abierto: true, turnos: [{ desde: '11:00', hasta: '22:00' }] },
    { dia: 2, nombre: 'Miércoles', abierto: true, turnos: [{ desde: '11:00', hasta: '22:00' }] },
  ],
  apertura: null,
  dueno: { id: 9, nombre: 'Antonio Rossi', rol: 'Administrador', correo: 'a@b.c', telefono: null },
  documentos: [
    { id: 1, tipo: 'rif', nombre: 'rif.pdf', url: '/static/rif.pdf', revisado: true },
    { id: 2, tipo: 'registro', nombre: 'registro.pdf', url: '/static/reg.pdf', revisado: false },
    { id: 3, tipo: 'fachada', nombre: 'fachada.jpg', url: '/static/f.jpg', revisado: false },
  ],
  documentos_revisados: 1,
  linea_de_tiempo: [{ evento: 'Registro enviado', fecha: '2026-09-29T16:12:00', por: null }],
  ...over,
});

const full = { ver: true, editar: true, aprobar: true };
const soloVer = { ver: true, editar: false, aprobar: false };

function renderApp(route: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/comercios" element={<ComerciosView />} />
      <Route path="/comercios/:id" element={<ComercioDetalleView />} />
    </Routes>,
    route,
  );
}

function setViewport(desktop: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: desktop,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  setViewport(true);
  resetStore();
  [listarComercios, obtenerComercio, aprobarComercio, rechazarComercio, revisarDocumento, iniciarRevision].forEach((m) => m.mockReset());
  signInAs('moderador', { comercios: full });
});

describe('B03 lista de comercios', () => {
  it('muestra la tabla con conteos por pestana y estados', async () => {
    listarComercios.mockResolvedValue(pagina([item(1, 'Big Burger'), item(2, 'Pizzería Don Nino', 'Por verificar')]));
    renderApp('/comercios');
    expect(await screen.findByText('Big Burger')).toBeInTheDocument();
    expect(screen.getAllByText('Por verificar').length).toBeGreaterThan(0);
    expect(screen.getByRole('tab', { name: /Por verificar\s*1/ })).toBeInTheDocument();
    expect(screen.getAllByText('J-00001-1').length).toBeGreaterThan(0);
    expect(listarComercios).toHaveBeenCalledWith(expect.objectContaining({ tab: 'todos', page: 1 }));
  });

  it('en movil la lista se muestra como tarjetas', async () => {
    setViewport(false);
    listarComercios.mockResolvedValue(pagina([item(1, 'Big Burger')]));
    renderApp('/comercios');
    expect(await screen.findByText('Big Burger')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByText('Canjes 30 d')).toBeInTheDocument();
  });

  it('la pestana y la busqueda (con debounce) vuelven a consultar con los filtros', async () => {
    listarComercios.mockResolvedValue(pagina([item(1, 'Big Burger')]));
    renderApp('/comercios');
    await screen.findByText('Big Burger');
    await userEvent.click(screen.getByRole('tab', { name: /Por verificar/ }));
    await waitFor(() => expect(listarComercios).toHaveBeenLastCalledWith(expect.objectContaining({ tab: 'por_verificar' })));

    const before = listarComercios.mock.calls.length;
    await userEvent.type(screen.getByLabelText('Buscar por nombre o RIF'), 'nino');
    expect(listarComercios.mock.calls.length).toBe(before);
    await waitFor(() => expect(listarComercios).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'nino', tab: 'por_verificar' })), { timeout: 2000 });
    expect(listarComercios.mock.calls.length).toBe(before + 1);
  });

  it('sin resultados ofrece limpiar filtros', async () => {
    listarComercios.mockResolvedValueOnce(pagina([item(1, 'Big Burger')]));
    listarComercios.mockResolvedValue(pagina([], 0));
    renderApp('/comercios');
    await screen.findByText('Big Burger');
    await userEvent.type(screen.getByLabelText('Buscar por nombre o RIF'), 'zzz');
    expect(await screen.findByText('Sin resultados', undefined, { timeout: 2000 })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    await waitFor(() => expect(listarComercios).toHaveBeenLastCalledWith(expect.objectContaining({ q: '' })));
  });

  it('invitar comercio queda deshabilitado sin permiso editar', async () => {
    signInAs('soporte', { comercios: soloVer });
    listarComercios.mockResolvedValue(pagina([item(1, 'Big Burger')]));
    renderApp('/comercios');
    await screen.findByText('Big Burger');
    expect(screen.getByRole('button', { name: 'Invitar comercio' })).toBeDisabled();
  });

  it('abre la verificacion al elegir un comercio', async () => {
    listarComercios.mockResolvedValue(pagina([item(1, 'Pizzería Don Nino', 'Por verificar')]));
    obtenerComercio.mockResolvedValue({ ok: true, data: detalle() });
    renderApp('/comercios');
    await userEvent.click(await screen.findByRole('link', { name: 'Pizzería Don Nino' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Pizzería Don Nino' })).toBeInTheDocument();
    expect(obtenerComercio).toHaveBeenCalledWith(1);
  });
});

describe('B04 verificacion de comercio', () => {
  it('muestra datos, documentos, ubicacion sin confirmar y la decision 1 de 5', async () => {
    obtenerComercio.mockResolvedValue({ ok: true, data: detalle() });
    renderApp('/comercios/1');
    expect(await screen.findByText('Inversiones Don Nino 2026, C.A.')).toBeInTheDocument();
    expect(screen.getByText('mar a mié · 11:00–22:00')).toBeInTheDocument();
    expect(screen.getByText('Sin confirmar')).toBeInTheDocument();
    expect(screen.getByTitle('Mapa de la ubicación del comercio')).toBeInTheDocument();
    expect(screen.getByText('Verificación 1 de 5')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('checkbox', { name: 'Dirección confirmada en el mapa' }));
    expect(screen.getByText('Confirmada')).toBeInTheDocument();
    expect(screen.getByText('Verificación 2 de 5')).toBeInTheDocument();
  });

  it('marcar un documento como revisado actualiza con la respuesta del backend', async () => {
    obtenerComercio.mockResolvedValue({ ok: true, data: detalle() });
    const d = detalle();
    revisarDocumento.mockResolvedValue({ ok: true, data: { ...d, documentos: d.documentos.map((x) => ({ ...x, revisado: true })) } });
    renderApp('/comercios/1');
    await screen.findByText('Verificación 1 de 5');
    await userEvent.click(screen.getByRole('button', { name: 'Marcar Registro mercantil como revisado' }));
    expect(revisarDocumento).toHaveBeenCalledWith(1, 2, true);
    expect(await screen.findByText('Verificación 3 de 5')).toBeInTheDocument();
  });

  it('aprobar pide confirmacion y deja el comercio verificado', async () => {
    obtenerComercio.mockResolvedValue({ ok: true, data: detalle() });
    aprobarComercio.mockResolvedValue({ ok: true, data: detalle({ verificacion: 'verificado', estado: 'Activo' }) });
    renderApp('/comercios/1');
    await userEvent.click(await screen.findByRole('button', { name: /Aprobar y activar/ }));
    await waitFor(() => expect(aprobarComercio).toHaveBeenCalledWith(1));
    expect(await screen.findByText('Este comercio ya está verificado.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aprobar y activar/ })).toBeDisabled();
  });

  it('rechazar abre B17: exige motivo, y con motivo envia el texto y el comentario', async () => {
    obtenerComercio.mockResolvedValue({ ok: true, data: detalle() });
    rechazarComercio.mockResolvedValue({ ok: true, data: detalle({ verificacion: 'rechazado', estado: 'Rechazado', motivo_rechazo: 'RIF no válido o no coincide. Sube el vigente' }) });
    renderApp('/comercios/1');
    await userEvent.click(await screen.findByRole('button', { name: /^Rechazar$/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rechazar comercio' }));
    expect(await within(dialog).findByText('Elige un motivo')).toBeInTheDocument();
    expect(rechazarComercio).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('radio', { name: 'RIF no válido o no coincide' }));
    await userEvent.type(within(dialog).getByLabelText(/Comentario para el comercio/), 'Sube el vigente');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rechazar comercio' }));
    await waitFor(() => expect(rechazarComercio).toHaveBeenCalledWith(1, { motivo: 'RIF no válido o no coincide', comentario: 'Sube el vigente' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText(/Comercio rechazado/)).toBeInTheDocument();
  });

  it('"Otro motivo" exige comentario', async () => {
    obtenerComercio.mockResolvedValue({ ok: true, data: detalle() });
    renderApp('/comercios/1');
    await userEvent.click(await screen.findByRole('button', { name: /^Rechazar$/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Otro motivo' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Rechazar comercio' }));
    expect(await within(dialog).findByText('Cuéntanos el motivo en el comentario')).toBeInTheDocument();
    expect(rechazarComercio).not.toHaveBeenCalled();
  });

  it('sin permiso aprobar/editar las acciones quedan deshabilitadas', async () => {
    signInAs('soporte', { comercios: soloVer });
    obtenerComercio.mockResolvedValue({ ok: true, data: detalle() });
    renderApp('/comercios/1');
    await screen.findByText('Verificación 1 de 5');
    expect(screen.getByRole('button', { name: /Aprobar y activar/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /^Rechazar$/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Marcar Registro mercantil como revisado' })).toBeDisabled();
  });

  it('un comercio inexistente muestra el estado vacio', async () => {
    obtenerComercio.mockResolvedValue({ ok: false, status: 404, title: 't', detail: 'Comercio no encontrado' });
    renderApp('/comercios/99');
    expect(await screen.findByText('No encontramos este comercio')).toBeInTheDocument();
  });
});
