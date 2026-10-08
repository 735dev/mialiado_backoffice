import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import type { Reglas } from '../models/reglas';
import NivelesView from './NivelesView';

const obtenerReglas = vi.fn();
const guardarReglas = vi.fn();
const listarVersiones = vi.fn();
const restaurarVersion = vi.fn();
vi.mock('../providers/reglasProvider', () => ({
  obtenerReglas: (...a: unknown[]) => obtenerReglas(...a),
  guardarReglas: (...a: unknown[]) => guardarReglas(...a),
  listarVersiones: (...a: unknown[]) => listarVersiones(...a),
  restaurarVersion: (...a: unknown[]) => restaurarVersion(...a),
}));

const notifyFromApiError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('@/lib/utils/notify', () => ({
  notify: { fromApiError: (e: unknown) => notifyFromApiError(e), toast: { success: (m: string) => toastSuccess(m) } },
}));

const ok = <T,>(data: T) => ({ ok: true as const, data });
const err = (status: number, detail: string) => ({ ok: false as const, status, title: 't', detail });

const REGLAS: Reglas = {
  version: 14,
  niveles: [
    { codigo: 'aliado', nombre: 'Aliado', orden: 0, desde: 0, puntos_extra: 0, usuarios: 8900 },
    { codigo: 'aliadopro', nombre: 'AliadoPro', orden: 1, desde: 20, puntos_extra: 5, usuarios: 2900 },
    { codigo: 'aliadoplus', nombre: 'AliadoPlus', orden: 2, desde: 50, puntos_extra: 10, usuarios: 680 },
  ],
  reglas: {
    ventana_anulacion_min: 20,
    descuento_max_pct: 40,
    recarga_minima: 5,
    compras_mes_mantener: 3,
    dias_baja_nivel: 30,
    moderacion_previa: false,
    combinacion: 'mayor_ahorro',
    puja_minima: 1,
    qr_vigencia_seg: 60,
  },
  vista_previa: {
    precio_normal: 8,
    descuento_base: 10,
    niveles: [],
    ejemplo_flash: { descuento_pct: 25, precio_aliadopro: 6 },
  },
  versiones: [
    { version: 14, resumen: 'Anulación en 20 min', fecha: '2026-09-24T12:00:00+00:00', autor: 'Laura Rojas' },
    { version: 13, resumen: 'Tope de descuento 40 %', fecha: '2026-09-02T12:00:00+00:00', autor: 'Marcos Díaz' },
  ],
};

async function setNum(label: string, value: string) {
  const input = screen.getByLabelText(label);
  await userEvent.clear(input);
  await userEvent.type(input, value);
}

beforeEach(() => {
  resetStore();
  vi.clearAllMocks();
  signInAs('admin', null, 'Laura Rojas');
  obtenerReglas.mockResolvedValue(ok(REGLAS));
  guardarReglas.mockResolvedValue(ok({}));
  restaurarVersion.mockResolvedValue(ok({}));
  listarVersiones.mockResolvedValue(ok(REGLAS.versiones));
});

describe('B10 Niveles y reglas', () => {
  it('muestra niveles, reglas, vista previa con formato de dinero y versiones', async () => {
    renderWithProviders(<NivelesView />);
    expect(await screen.findByText('Niveles de cliente')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasta, Aliado')).toHaveValue(19);
    expect(screen.getByLabelText('Hasta, AliadoPro')).toHaveValue(49);
    expect(screen.getByLabelText('Puntos extra, AliadoPro')).toHaveValue(5);
    expect(screen.getByText('$6,80')).toBeInTheDocument();
    expect(screen.getByText('Anulación en 20 min')).toBeInTheDocument();
    expect(screen.queryByText('Cambios sin publicar')).not.toBeInTheDocument();
  });

  it('editar una regla marca el borrador, publica solo lo cambiado y recarga', async () => {
    renderWithProviders(<NivelesView />);
    await screen.findByText('Niveles de cliente');
    await setNum('Ventana de anulación', '30');
    expect(await screen.findByText('Cambios sin publicar')).toBeInTheDocument();
    expect(screen.getByText('Publicado: 20 min')).toBeInTheDocument();
    expect(screen.getByText('Borrador de Laura Rojas')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Publicar cambios' }));
    const dialog = await screen.findByRole('dialog');
    expect(guardarReglas).not.toHaveBeenCalled();
    await userEvent.type(within(dialog).getByLabelText(/Resumen de la versión/), 'Anulación en 30 min');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Publicar cambios' }));

    await waitFor(() => expect(guardarReglas).toHaveBeenCalledWith({ ventana_anulacion_min: 30, resumen: 'Anulación en 30 min' }));
    expect(toastSuccess).toHaveBeenCalledWith('Versión publicada');
    await waitFor(() => expect(obtenerReglas).toHaveBeenCalledTimes(2));
  });

  it('cambiar el tope de un nivel mueve el desde del siguiente y manda los tres niveles', async () => {
    renderWithProviders(<NivelesView />);
    await screen.findByText('Niveles de cliente');
    await setNum('Hasta, Aliado', '24');
    expect(screen.getByText('25')).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'Publicar cambios' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Publicar cambios' }));
    await waitFor(() =>
      expect(guardarReglas).toHaveBeenCalledWith({
        niveles: [
          { codigo: 'aliado', desde: 0, puntos_extra: 0 },
          { codigo: 'aliadopro', desde: 25, puntos_extra: 5 },
          { codigo: 'aliadoplus', desde: 50, puntos_extra: 10 },
        ],
      }),
    );
  });

  it('la vista previa sigue al borrador', async () => {
    renderWithProviders(<NivelesView />);
    await screen.findByText('Niveles de cliente');
    fireEvent.change(screen.getByLabelText('Puntos extra, Aliado'), { target: { value: '12' } });
    expect(await screen.findByText('$6,24')).toBeInTheDocument();
    expect(screen.getAllByText('Borrador').length).toBeGreaterThan(0);
  });

  it('valida con Zod: tramos no crecientes y valores fuera de rango no llegan al backend', async () => {
    renderWithProviders(<NivelesView />);
    await screen.findByText('Niveles de cliente');
    await setNum('Hasta, AliadoPro', '10');
    await setNum('Descuento máximo permitido', '150');
    await userEvent.click(await screen.findByRole('button', { name: 'Publicar cambios' }));
    expect(await screen.findByText('Debe ser mayor que el tope del nivel anterior')).toBeInTheDocument();
    expect(screen.getByText('Máximo 100')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(guardarReglas).not.toHaveBeenCalled();
  });

  it('descartar vuelve a lo publicado', async () => {
    renderWithProviders(<NivelesView />);
    await screen.findByText('Niveles de cliente');
    await setNum('Ventana de anulación', '45');
    await userEvent.click(await screen.findByRole('button', { name: 'Descartar' }));
    expect(screen.getByLabelText('Ventana de anulación')).toHaveValue(20);
    expect(screen.queryByText('Cambios sin publicar')).not.toBeInTheDocument();
  });

  it('un 422 del backend se avisa y deja el borrador', async () => {
    guardarReglas.mockResolvedValue(err(422, 'No hay cambios'));
    renderWithProviders(<NivelesView />);
    await screen.findByText('Niveles de cliente');
    await setNum('Ventana de anulación', '30');
    await userEvent.click(await screen.findByRole('button', { name: 'Publicar cambios' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Publicar cambios' }));
    await waitFor(() => expect(notifyFromApiError).toHaveBeenCalledWith(expect.objectContaining({ status: 422 })));
    expect(screen.getByLabelText('Ventana de anulación')).toHaveValue(30);
  });

  it('restaurar una version pide confirmacion y llama al backend', async () => {
    renderWithProviders(<NivelesView />);
    await screen.findByText('Niveles de cliente');
    await userEvent.click(screen.getByRole('button', { name: 'Restaurar' }));
    const dialog = await screen.findByRole('dialog');
    expect(restaurarVersion).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Restaurar' }));
    await waitFor(() => expect(restaurarVersion).toHaveBeenCalledWith(13));
    expect(toastSuccess).toHaveBeenCalledWith('Se restauró la v13');
  });

  it('sin permiso de editar los campos quedan de solo lectura y no hay publicar ni restaurar', async () => {
    resetStore();
    signInAs('moderador', { niveles_reglas: { ver: true, editar: false, aprobar: false } });
    renderWithProviders(<NivelesView />);
    await screen.findByText('Niveles de cliente');
    expect(screen.getByLabelText('Ventana de anulación')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Restaurar' })).not.toBeInTheDocument();
  });

  it('si falla la carga ofrece reintentar', async () => {
    obtenerReglas.mockResolvedValueOnce(err(500, 'Error del servidor'));
    renderWithProviders(<NivelesView />);
    expect(await screen.findByText('No pudimos cargar las reglas')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Niveles de cliente')).toBeInTheDocument();
  });
});
