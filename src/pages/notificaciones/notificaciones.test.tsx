import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DisplayMessage } from '@/components/feedback/DisplayMessage';
import { store } from '@/lib/store';
import { hideInfoModal } from '@/lib/store/slices/uiSlice';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import NotificacionesView from './views/NotificacionesView';
import { notificacionSchema, valoresIniciales } from './schemas/notificacionSchema';
import { enHorarioSilencioso } from './utils/horario';

const listar = vi.fn();
const estimar = vi.fn();
const crear = vi.fn();
vi.mock('@/pages/notificaciones/providers/notificacionesProvider', () => ({
  listarNotificaciones: (...a: unknown[]) => listar(...a),
  estimarAlcance: (...a: unknown[]) => estimar(...a),
  crearNotificacion: (...a: unknown[]) => crear(...a),
  enviarPrueba: async () => ({ ok: true, data: {} }),
  enviarNotificacion: async () => ({ ok: true, data: { enviados: 1 } }),
  cancelarNotificacion: async () => ({ ok: true, data: null }),
  listarPlantillas: async () => ({ ok: true, data: [] }),
  crearPlantilla: async () => ({ ok: true, data: {} }),
  borrarPlantilla: async () => ({ ok: true, data: null }),
  listarZonas: async () => ({ ok: true, data: [{ id: 3, nombre: 'Cordero' }] }),
}));

const fila = (id: number, estado: string, titulo: string) => ({
  id,
  titulo,
  mensaje: 'm',
  segmento: 'todos',
  segmento_texto: 'Todos',
  filtro: null,
  programada_para: null,
  estado,
  destinatarios: 10,
  enviados: 10,
  aperturas: 3,
  apertura_pct: 30,
  enviada_at: '2026-10-02T17:00:00+00:00',
  created_at: '2026-10-02T16:00:00+00:00',
});

function pagina(items: unknown[]) {
  return { ok: true, data: { data: items, total: items.length, page: 1, limit: 10, links: { next: null, previous: null } } };
}

function pintar() {
  return renderWithProviders(
    <>
      <NotificacionesView />
      <DisplayMessage />
    </>,
    '/notificaciones',
  );
}

beforeEach(() => {
  resetStore();
  store.dispatch(hideInfoModal());
  listar.mockReset().mockResolvedValue(pagina([fila(1, 'enviada', 'Martes de cine'), fila(2, 'programada', 'Subiste a AliadoPro')]));
  estimar.mockReset().mockResolvedValue({ ok: true, data: { alcance: 3200, total_usuarios: 12480, porcentaje: 26, tasa_apertura_tipica: 34 } });
  crear.mockReset().mockResolvedValue({ ok: true, data: { ...fila(9, 'enviada', 'Hola'), enviados: 3200 } });
});

describe('B12 · horario silencioso', () => {
  it('10 pm a 7 am es silencioso; 7 am y 9:59 pm no', () => {
    expect(enHorarioSilencioso('22:00')).toBe(true);
    expect(enHorarioSilencioso('23:30')).toBe(true);
    expect(enHorarioSilencioso('06:59')).toBe(true);
    expect(enHorarioSilencioso('07:00')).toBe(false);
    expect(enHorarioSilencioso('21:59')).toBe(false);
  });

  it('programar en la franja silenciosa o en el pasado no valida', () => {
    const base = { ...valoresIniciales, titulo: 'Hola', mensaje: 'Mensaje', cuando: 'programar' as const };
    const noche = notificacionSchema.safeParse({ ...base, fecha: '2099-01-01', hora: '23:00' });
    expect(noche.success).toBe(false);
    expect(!noche.success && noche.error.issues[0]?.message).toBe('notificaciones.errors.silencio');
    const pasado = notificacionSchema.safeParse({ ...base, fecha: '2020-01-01', hora: '10:00' });
    expect(!pasado.success && pasado.error.issues[0]?.message).toBe('notificaciones.errors.pasado');
    expect(notificacionSchema.safeParse({ ...base, fecha: '2099-01-01', hora: '10:00' }).success).toBe(true);
  });
});

describe('B12 · pantalla', () => {
  it('muestra el historial y cambia de pestana consultando por tab', async () => {
    signInAs('admin');
    pintar();
    expect((await screen.findAllByText('Martes de cine')).length).toBeGreaterThan(0);
    expect(listar).toHaveBeenCalledWith(expect.objectContaining({ tab: 'todos', page: 1 }));
    await userEvent.click(screen.getByRole('button', { name: 'Programados' }));
    await waitFor(() => expect(listar).toHaveBeenCalledWith(expect.objectContaining({ tab: 'programados' })));
  });

  it('enviar ahora pide confirmacion con el alcance y manda modo=ahora', async () => {
    signInAs('admin');
    pintar();
    await userEvent.type(await screen.findByLabelText('Título'), 'Tu aliado te extraña');
    await userEvent.type(screen.getByLabelText('Mensaje'), 'Hay 12 promos nuevas');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar notificación' }));
    const dialogo = await screen.findByRole('dialog');
    expect(within(dialogo).getByText('Se enviará ahora a 3200 personas. ¿Continuar?')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Confirmar' }));
    await waitFor(() =>
      expect(crear).toHaveBeenCalledWith(expect.objectContaining({ titulo: 'Tu aliado te extraña', segmento: 'todos', modo: 'ahora' })),
    );
  });

  it('si el servidor reprograma por horario silencioso lo avisa', async () => {
    crear.mockResolvedValue({ ok: true, data: { ...fila(9, 'programada', 'Hola'), reprogramada: true } });
    signInAs('admin');
    pintar();
    await userEvent.type(await screen.findByLabelText('Título'), 'Hola');
    await userEvent.type(screen.getByLabelText('Mensaje'), 'Mundo');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar notificación' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Confirmar' }));
    expect(await screen.findByText(/quedó programada para las 7:00 am/)).toBeInTheDocument();
  });

  it('programar a las 11 pm muestra el error y no llama al servidor', async () => {
    signInAs('admin');
    pintar();
    await userEvent.type(await screen.findByLabelText('Título'), 'Hola');
    await userEvent.type(screen.getByLabelText('Mensaje'), 'Mundo');
    await userEvent.click(screen.getByRole('button', { name: 'Programar' }));
    await userEvent.type(screen.getByLabelText('Fecha'), '2099-01-01');
    const hora = screen.getByLabelText('Hora');
    await userEvent.clear(hora);
    await userEvent.type(hora, '23:00');
    await userEvent.click(screen.getByRole('button', { name: 'Programar envío' }));
    expect(await screen.findByText('No se envían push entre 10:00 pm y 7:00 am')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it('un rol sin permiso de editar solo ve el historial', async () => {
    signInAs('soporte', { notificaciones: { ver: true, editar: false, aprobar: false } });
    pintar();
    expect((await screen.findAllByText('Martes de cine')).length).toBeGreaterThan(0);
    expect(screen.queryByLabelText('Título')).not.toBeInTheDocument();
    expect(screen.getByText(/no crear ni enviar notificaciones/)).toBeInTheDocument();
  });
});
