import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import SoporteView from './views/SoporteView';

const listar = vi.fn();
const obtener = vi.fn();
const responder = vi.fn();
const actualizar = vi.fn();
vi.mock('@/pages/soporte/providers/soporteProvider', () => ({
  listarTickets: (...a: unknown[]) => listar(...a),
  obtenerTicket: (...a: unknown[]) => obtener(...a),
  responderTicket: (...a: unknown[]) => responder(...a),
  actualizarTicket: (...a: unknown[]) => actualizar(...a),
  crearTicket: async () => ({ ok: true, data: {} }),
  listarPlantillasRespuesta: async () => ({ ok: true, data: [{ id: 1, ambito: 'soporte', nombre: 'Pedir folio', titulo: null, cuerpo: 'Por favor indícanos el folio del canje.' }] }),
  buscarUsuarios: async () => ({ ok: true, data: [] }),
  listarMiembros: async () => ({ ok: true, data: [] }),
}));

const resumen = (id: number, sinLeer: boolean) => ({
  id,
  codigo: `T-20${40 + id}`,
  asunto: id === 1 ? 'No me aplicó el descuento' : 'El QR no carga',
  prioridad: id === 1 ? 'alta' : 'media',
  estado: 'abierto',
  origen: 'usuario',
  sin_leer: sinLeer,
  created_at: '2026-10-07T17:00:00+00:00',
  updated_at: '2026-10-07T17:00:00+00:00',
  asignado_a: null,
  usuario_id: 16,
  comercio: null,
  solicitante: id === 1 ? 'Pedro Pérez' : 'Camila Benítez',
});

const detalle = (cobro: unknown = null) => ({
  ...resumen(1, false),
  asignado: null,
  solicitante: { id: 16, nombre: 'Pedro Pérez', usuario: 'pedroperez', tipo: 'usuario', nivel: 'aliadoplus', compras: 57, correo: 'p@demo.com' },
  cobro,
  mensajes: [
    { id: 1, tipo: 'mensaje', cuerpo: 'Pagué completo y no me aplicaron mi descuento.', adjunto: null, created_at: '2026-10-07T17:00:00+00:00', autor_id: 16, autor: 'Pedro Pérez', es_solicitante: true },
    { id: 2, tipo: 'nota', cuerpo: 'Escribo a Big Burger para confirmarlo.', adjunto: null, created_at: '2026-10-07T17:10:00+00:00', autor_id: 2, autor: 'Laura', es_solicitante: false },
  ],
});

const COBRO = {
  id: 5,
  folio: 'AL-260401-0087',
  comercio: 'Big Burger',
  promocion: 'Doble Queso',
  fecha: '2026-10-01T23:42:00+00:00',
  consumo: 25,
  cobrado: 25,
  descuento_pct: 0,
  esperado_pct: 20,
  esperado: 20,
  estado: 'registrado',
};

beforeEach(() => {
  resetStore();
  listar.mockReset().mockResolvedValue({
    ok: true,
    data: {
      data: [resumen(1, true), resumen(2, false)],
      total: 2,
      page: 1,
      limit: 8,
      links: { next: null, previous: null },
      conteos: { sin_leer: 1, abiertos: 2, mios: 0, resueltos: 4 },
    },
  });
  obtener.mockReset().mockResolvedValue({ ok: true, data: detalle() });
  responder.mockReset().mockResolvedValue({ ok: true, data: {} });
  actualizar.mockReset().mockResolvedValue({ ok: true, data: {} });
});

async function abrirPrimero() {
  renderWithProviders(<SoporteView />, '/soporte');
  await userEvent.click(await screen.findByRole('button', { name: /No me aplicó el descuento/ }));
  await screen.findByRole('heading', { name: 'No me aplicó el descuento' });
}

describe('B13 · Soporte', () => {
  it('muestra la bandeja con conteos y cambia de pestana consultando por tab', async () => {
    signInAs('admin');
    renderWithProviders(<SoporteView />, '/soporte');
    expect(await screen.findByText('1 sin leer')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Abiertos 2' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Míos/ }));
    await waitFor(() => expect(listar).toHaveBeenCalledWith(expect.objectContaining({ tab: 'mios', page: 1 })));
  });

  it('abre un ticket, muestra el hilo con la nota interna y el cobro', async () => {
    obtener.mockResolvedValue({ ok: true, data: detalle(COBRO) });
    signInAs('admin');
    await abrirPrimero();
    expect(obtener).toHaveBeenCalledWith(1);
    expect(screen.getByText('Pagué completo y no me aplicaron mi descuento.')).toBeInTheDocument();
    expect(screen.getByText(/Nota interna · solo el equipo/)).toBeInTheDocument();
    expect(screen.getByText('AL-260401-0087')).toBeInTheDocument();
    expect(screen.getByText(/Esperado/)).toBeInTheDocument();
  });

  it('responde al solicitante con tipo mensaje y recarga el ticket', async () => {
    signInAs('admin');
    await abrirPrimero();
    await userEvent.type(screen.getByLabelText('Tu respuesta a Pedro Pérez'), 'Estamos validando con el comercio.');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar respuesta' }));
    await waitFor(() => expect(responder).toHaveBeenCalledWith(1, { cuerpo: 'Estamos validando con el comercio.', tipo: 'mensaje' }));
    await waitFor(() => expect(obtener).toHaveBeenCalledTimes(2));
  });

  it('una nota interna se manda con tipo nota', async () => {
    signInAs('admin');
    await abrirPrimero();
    await userEvent.click(screen.getByRole('button', { name: 'Nota interna' }));
    await userEvent.type(screen.getByLabelText('Nota interna para el equipo'), 'Revisar con finanzas');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar nota' }));
    await waitFor(() => expect(responder).toHaveBeenCalledWith(1, { cuerpo: 'Revisar con finanzas', tipo: 'nota' }));
  });

  it('sin texto no responde y muestra el error', async () => {
    signInAs('admin');
    await abrirPrimero();
    await userEvent.click(screen.getByRole('button', { name: 'Enviar respuesta' }));
    expect(await screen.findByText('Este campo es obligatorio')).toBeInTheDocument();
    expect(responder).not.toHaveBeenCalled();
  });

  it('resolver y cerrar envia lo escrito y luego marca el ticket como resuelto', async () => {
    signInAs('admin');
    await abrirPrimero();
    await userEvent.type(screen.getByLabelText('Tu respuesta a Pedro Pérez'), 'Listo, te devolvimos la diferencia.');
    await userEvent.click(screen.getByRole('button', { name: 'Resolver y cerrar' }));
    await waitFor(() => expect(actualizar).toHaveBeenCalledWith(1, { estado: 'resuelto' }));
    expect(responder).toHaveBeenCalledTimes(1);
    expect(responder.mock.invocationCallOrder[0]).toBeLessThan(actualizar.mock.invocationCallOrder[0] as number);
  });

  it('la plantilla rapida rellena la respuesta', async () => {
    signInAs('admin');
    await abrirPrimero();
    await userEvent.click(screen.getByRole('button', { name: 'Pedir folio' }));
    expect(screen.getByLabelText('Tu respuesta a Pedro Pérez')).toHaveValue('Por favor indícanos el folio del canje.');
  });

  it('un rol sin editar lee el hilo pero no puede responder', async () => {
    signInAs('soporte', { soporte: { ver: true, editar: false, aprobar: false } });
    await abrirPrimero();
    expect(screen.queryByRole('button', { name: 'Enviar respuesta' })).not.toBeInTheDocument();
    expect(screen.getByText(/no responderlos/)).toBeInTheDocument();
  });
});
