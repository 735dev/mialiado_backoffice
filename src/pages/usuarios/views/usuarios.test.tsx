import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import type { UsuarioDetalle, UsuarioFila } from '@/providers/usuariosProvider';
import UsuarioDetalleView from './UsuarioDetalleView';
import UsuariosView from './UsuariosView';

const listarUsuarios = vi.fn();
const obtenerUsuario = vi.fn();
const listarCanjesUsuario = vi.fn();
const bloquearUsuario = vi.fn();
const desbloquearUsuario = vi.fn();
const cambiarNivelUsuario = vi.fn();
const enviarMensajeUsuario = vi.fn();
vi.mock('@/providers/usuariosProvider', () => ({
  listarUsuarios: (...a: unknown[]) => listarUsuarios(...a),
  obtenerUsuario: (...a: unknown[]) => obtenerUsuario(...a),
  listarCanjesUsuario: (...a: unknown[]) => listarCanjesUsuario(...a),
  bloquearUsuario: (...a: unknown[]) => bloquearUsuario(...a),
  desbloquearUsuario: (...a: unknown[]) => desbloquearUsuario(...a),
  cambiarNivelUsuario: (...a: unknown[]) => cambiarNivelUsuario(...a),
  enviarMensajeUsuario: (...a: unknown[]) => enviarMensajeUsuario(...a),
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

const fila = (id: number, nombre: string, extra: Partial<UsuarioFila> = {}): UsuarioFila => ({
  id,
  nombre,
  usuario: nombre.split(' ')[0]!.toLowerCase(),
  foto_url: null,
  ciudad: 'Rubio',
  nivel: 'aliadoplus',
  compras: 57,
  ahorro_total: 124,
  estado: 'Activo',
  ultimo_acceso: '2026-10-08T03:42:00+00:00',
  ...extra,
});

const resumen = {
  total: 7,
  bloqueados: { usuarios: 1, porcentaje: 14.3 },
  niveles: [
    { nivel: 'aliado', usuarios: 3, porcentaje: 42.9, desde: 0 },
    { nivel: 'aliadopro', usuarios: 2, porcentaje: 28.6, desde: 20 },
    { nivel: 'aliadoplus', usuarios: 2, porcentaje: 28.6, desde: 50 },
  ],
};

const page = (data: UsuarioFila[], total = data.length) => ({
  ok: true as const,
  data: { data, total, page: 1, limit: 10, links: { next: null, previous: null }, resumen },
});

const detalle = (extra: Partial<UsuarioDetalle> = {}): UsuarioDetalle => ({
  id: 16,
  nombre: 'Pedro Pérez',
  usuario: 'pedroperez',
  correo: 'pedro@demo.com',
  telefono: '04146738744',
  foto_url: null,
  ciudad: 'Rubio',
  cedula: '123',
  carnet_plus: true,
  estado: 'Activo',
  motivo_bloqueo: null,
  nivel_forzado: null,
  registro: '2026-01-12T00:00:00+00:00',
  ultimo_acceso: '2026-10-08T03:42:00+00:00',
  compras: 57,
  ahorro_total: 124,
  comercios_visitados: 6,
  primera_compra: '2026-08-09T17:10:00+00:00',
  calificaciones: { total: 27, promedio: 4.2, comercios: 6 },
  progreso: {
    codigo: 'aliadoplus',
    nombre: 'AliadoPlus',
    puntos_extra: 10,
    compras: 57,
    compras_mes: 1,
    es_maximo: true,
    bajo_por_inactividad: false,
    siguiente: null,
    mantenimiento: { requeridas: 3, hechas: 1, faltan: 2 },
  },
  ultimos_canjes: [
    { id: 1, folio: 'AL-1', fecha: '2026-10-07T10:00:00+00:00', comercio: 'Big Burger', promocion: 'Doble Queso', descuento_pct: 20, ahorro: 4, estado: 'Canjeado' },
  ],
  ...extra,
});

function renderLista() {
  return renderWithProviders(
    <Routes>
      <Route path="/usuarios" element={<UsuariosView />} />
      <Route path="/usuarios/:id" element={<p>DETALLE</p>} />
    </Routes>,
    '/usuarios',
  );
}

function renderDetalle() {
  return renderWithProviders(
    <Routes>
      <Route path="/usuarios" element={<p>LISTA</p>} />
      <Route path="/usuarios/:id" element={<UsuarioDetalleView />} />
    </Routes>,
    '/usuarios/16',
  );
}

beforeEach(() => {
  resetStore();
  signInAs('admin');
  [listarUsuarios, obtenerUsuario, listarCanjesUsuario, bloquearUsuario, desbloquearUsuario, cambiarNivelUsuario, enviarMensajeUsuario, notifyFromApiError].forEach((m) => m.mockReset());
  notifyConfirm.mockClear();
});

describe('B05 usuarios', () => {
  it('muestra el resumen por nivel y las filas, y lleva al detalle', async () => {
    listarUsuarios.mockResolvedValue(page([fila(16, 'Pedro Pérez'), fila(20, 'Ana Torres', { nivel: 'aliado', estado: 'Bloqueado' })], 2));
    renderLista();
    expect(await screen.findByText('Pedro Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    expect(screen.getByText(/42,9\s?% de los usuarios/)).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1–2 de 2 usuarios')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: 'Ver detalle de Pedro Pérez' }));
    expect(await screen.findByText('DETALLE')).toBeInTheDocument();
  });

  it('la pestana Bloqueados y la busqueda filtran en el backend y reinician la pagina', async () => {
    listarUsuarios.mockResolvedValue(page([fila(16, 'Pedro Pérez')]));
    renderLista();
    await screen.findByText('Pedro Pérez');
    await userEvent.click(screen.getByRole('tab', { name: 'Bloqueados' }));
    await waitFor(() => expect(listarUsuarios).toHaveBeenLastCalledWith(expect.objectContaining({ tab: 'bloqueados', page: 1 })));
    await userEvent.type(screen.getByPlaceholderText('Buscar por nombre, @usuario o correo'), 'ana');
    await waitFor(() => expect(listarUsuarios).toHaveBeenLastCalledWith(expect.objectContaining({ tab: 'bloqueados', q: 'ana' })), { timeout: 2000 });
  });

  it('sin resultados con filtros ofrece quitarlos', async () => {
    listarUsuarios.mockResolvedValueOnce(page([fila(16, 'Pedro Pérez')])).mockResolvedValue(page([], 0));
    renderLista();
    await screen.findByText('Pedro Pérez');
    await userEvent.click(screen.getByRole('tab', { name: 'AliadoPro' }));
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
    listarUsuarios.mockResolvedValue(page([fila(16, 'Pedro Pérez')]));
    await userEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }));
    expect(await screen.findByText('Pedro Pérez')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Todos' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('B06 usuario, detalle', () => {
  it('una persona sin calificaciones (promedio null) no rompe el detalle', async () => {
    obtenerUsuario.mockResolvedValue({ ok: true, data: detalle({ calificaciones: { total: 0, promedio: null, comercios: 0 } }) });
    renderDetalle();
    expect(await screen.findByText(/media —/)).toBeInTheDocument();
  });

  it('bloquear pide motivo y confirmacion y envia el motivo elegido', async () => {
    obtenerUsuario.mockResolvedValue({ ok: true, data: detalle() });
    bloquearUsuario.mockResolvedValue({ ok: true, data: detalle({ estado: 'Bloqueado', motivo_bloqueo: 'Fraude' }) });
    renderDetalle();
    expect(await screen.findByRole('heading', { name: 'Pedro Pérez' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: 'Fraude' }));
    await userEvent.click(screen.getByRole('button', { name: 'Bloquear con motivo' }));
    expect(notifyConfirm).toHaveBeenCalledWith(expect.stringContaining('Pedro Pérez'), expect.any(Function));
    await waitFor(() => expect(bloquearUsuario).toHaveBeenCalledWith(16, 'Fraude'));
    expect(await screen.findByText('Motivo: Fraude')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Desbloquear usuario' })).toBeEnabled();
  });

  it('con "Otro" el motivo es obligatorio', async () => {
    obtenerUsuario.mockResolvedValue({ ok: true, data: detalle() });
    renderDetalle();
    await screen.findByRole('heading', { name: 'Pedro Pérez' });
    await userEvent.click(screen.getByRole('radio', { name: 'Otro' }));
    await userEvent.click(screen.getByRole('button', { name: 'Bloquear con motivo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Este campo es obligatorio');
    expect(notifyConfirm).not.toHaveBeenCalled();
    expect(bloquearUsuario).not.toHaveBeenCalled();
  });

  it('desbloquear confirma y llama al backend', async () => {
    obtenerUsuario.mockResolvedValue({ ok: true, data: detalle({ estado: 'Bloqueado', motivo_bloqueo: 'Fraude' }) });
    desbloquearUsuario.mockResolvedValue({ ok: true, data: detalle() });
    renderDetalle();
    await userEvent.click(await screen.findByRole('button', { name: 'Desbloquear usuario' }));
    await waitFor(() => expect(desbloquearUsuario).toHaveBeenCalledWith(16));
    expect(await screen.findByRole('button', { name: 'Bloquear con motivo' })).toBeInTheDocument();
  });

  it('cambiar de nivel valida el motivo y manda `null` cuando se vuelve a automatico', async () => {
    obtenerUsuario.mockResolvedValue({ ok: true, data: detalle({ nivel_forzado: 'aliadopro' }) });
    cambiarNivelUsuario.mockResolvedValue({ ok: true, data: detalle() });
    renderDetalle();
    await userEvent.click(await screen.findByRole('button', { name: 'Ajustar nivel' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar nivel' }));
    expect(await within(dialog).findByText('Debe tener al menos 3 caracteres')).toBeInTheDocument();
    expect(cambiarNivelUsuario).not.toHaveBeenCalled();
    await userEvent.selectOptions(within(dialog).getByLabelText('Nivel'), 'auto');
    await userEvent.type(within(dialog).getByLabelText('Motivo del ajuste'), 'Vuelve al cálculo');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar nivel' }));
    await waitFor(() => expect(cambiarNivelUsuario).toHaveBeenCalledWith(16, null, 'Vuelve al cálculo'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('el mensaje respeta 40 y 120 caracteres', async () => {
    obtenerUsuario.mockResolvedValue({ ok: true, data: detalle() });
    enviarMensajeUsuario.mockResolvedValue({ ok: true, data: { enviado: true } });
    renderDetalle();
    await userEvent.click(await screen.findByRole('button', { name: 'Enviar mensaje' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Título (máx. 40)'), 'x'.repeat(41));
    await userEvent.type(within(dialog).getByLabelText('Mensaje (máx. 120)'), 'Hola');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enviar mensaje' }));
    expect(await within(dialog).findByText('Debe tener como máximo 40 caracteres')).toBeInTheDocument();
    expect(enviarMensajeUsuario).not.toHaveBeenCalled();
    const titulo = within(dialog).getByLabelText('Título (máx. 40)');
    await userEvent.clear(titulo);
    await userEvent.type(titulo, 'Crédito');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Enviar mensaje' }));
    await waitFor(() => expect(enviarMensajeUsuario).toHaveBeenCalledWith(16, 'Crédito', 'Hola'));
  });

  it('sin permiso de editar las acciones quedan desactivadas', async () => {
    resetStore();
    signInAs('soporte', { usuarios: { ver: true, editar: false, aprobar: false } });
    obtenerUsuario.mockResolvedValue({ ok: true, data: detalle() });
    renderDetalle();
    await screen.findByRole('heading', { name: 'Pedro Pérez' });
    expect(screen.getByRole('button', { name: 'Ajustar nivel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Enviar mensaje' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bloquear con motivo' })).toBeDisabled();
  });

  it('un 404 muestra "no encontrado" y permite volver', async () => {
    obtenerUsuario.mockResolvedValue({ ok: false, status: 404, title: 't', detail: 'Usuario no encontrado' });
    renderDetalle();
    expect(await screen.findByRole('heading', { name: 'Usuario no encontrado' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Volver a usuarios' }));
    expect(await screen.findByText('LISTA')).toBeInTheDocument();
  });

  it('"Ver todos" carga el historial paginado de canjes', async () => {
    obtenerUsuario.mockResolvedValue({ ok: true, data: detalle() });
    listarCanjesUsuario.mockResolvedValue({
      ok: true,
      data: {
        data: [{ id: 9, folio: 'AL-9', created_at: '2026-10-01T10:00:00+00:00', descuento: 2, descuento_pct: 10, total: 18, estado: 'anulado', comercio: 'Cines Unidos', promocion: null }],
        total: 57,
        page: 1,
        limit: 10,
        links: { next: 'x', previous: null },
      },
    });
    renderDetalle();
    await userEvent.click(await screen.findByRole('button', { name: 'Ver todos' }));
    expect(await screen.findByText('Cines Unidos')).toBeInTheDocument();
    expect(screen.getByText('Anulado')).toBeInTheDocument();
    expect(listarCanjesUsuario).toHaveBeenCalledWith(16, expect.objectContaining({ page: 1 }));
  });
});
