import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import type { Resumen } from '@/providers/resumenProvider';
import ResumenView from './ResumenView';

const obtenerResumen = vi.fn();
vi.mock('@/providers/resumenProvider', () => ({ obtenerResumen: (...a: unknown[]) => obtenerResumen(...a) }));

const dia = (n: number, canjes: number) => ({ fecha: `2026-10-${String(n).padStart(2, '0')}`, canjes, media_7d: canjes - 1 });

const DATA: Resumen = {
  kpis: {
    usuarios_activos: { valor: 12480, variacion_pct: 6 },
    canjes_mes: { valor: 3912, variacion_pct: -11 },
    comercios_activos: { valor: 214, variacion_pct: 2, nuevos: 4 },
    ingresos_impulsos: { valor: 4860, variacion_pct: null },
  },
  canjes_por_dia: { dias: 30, serie: [dia(1, 120), dia(2, 90), dia(3, 150)] },
  pendientes: { comercios_por_verificar: 7, promos_por_moderar: 12, tickets_abiertos: 5, tickets_sin_leer: 3, recargas_por_conciliar: 0 },
  top_comercios: [{ posicion: 1, id: 1, nombre: 'Big Burger', logo_url: null, canjes: 177 }],
  canjes_por_categoria: [{ categoria: 'Comida rápida', canjes: 1600, porcentaje: 41 }],
  actividad_reciente: [{ texto: 'Don Nino envió su registro', detalle: 'Pizzería Don Nino', fecha: new Date().toISOString(), tipo: 'comercio' }],
};

const ver = { ver: true, editar: false, aprobar: false };
const sin = { ver: false, editar: false, aprobar: false };

function renderResumen() {
  return renderWithProviders(
    <Routes>
      <Route path="/resumen" element={<ResumenView />} />
      <Route path="/comercios" element={<p>LISTA COMERCIOS</p>} />
    </Routes>,
    '/resumen',
  );
}

beforeEach(() => {
  resetStore();
  obtenerResumen.mockReset();
  signInAs('moderador', { resumen: ver, comercios: ver, promociones: ver, soporte: sin, finanzas: sin, reportes: sin, notificaciones: sin, auditoria: sin }, 'Laura Rojas');
});

describe('B02 resumen', () => {
  it('muestra metricas, pendientes y rankings con los datos del backend', async () => {
    obtenerResumen.mockResolvedValue({ ok: true, data: DATA });
    renderResumen();
    expect(await screen.findByText('12.480')).toBeInTheDocument();
    expect(screen.getByText('$4.860,00')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Laura/);
    expect(screen.getByText('comercios por verificar')).toBeInTheDocument();
    expect(screen.getByText('Big Burger')).toBeInTheDocument();
    expect(screen.getByText('41%')).toBeInTheDocument();
    expect(screen.getByText('Don Nino envió su registro')).toBeInTheDocument();
    expect(screen.getByText('+4')).toBeInTheDocument();
    expect(screen.getByText('11%')).toBeInTheDocument();
    expect(screen.getByText('Sin mes previo')).toBeInTheDocument();
    expect(obtenerResumen).toHaveBeenCalledWith(30);
  });

  it('cambiar de rango vuelve a pedir el resumen y el tooltip muestra el dia', async () => {
    obtenerResumen.mockResolvedValue({ ok: true, data: DATA });
    renderResumen();
    await screen.findByText('12.480');
    await userEvent.click(screen.getByRole('button', { name: '90 d' }));
    await waitFor(() => expect(obtenerResumen).toHaveBeenLastCalledWith(90));
    await screen.findByText('12.480');
    await userEvent.hover(screen.getAllByTestId('canjes-col')[2] as Element);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('150 canjes');
  });

  it('los pendientes de modulos sin permiso quedan deshabilitados y los demas navegan', async () => {
    obtenerResumen.mockResolvedValue({ ok: true, data: DATA });
    renderResumen();
    await screen.findByText('12.480');
    const filas = screen.getAllByRole('listitem').filter((li) => li.textContent?.includes('tickets de soporte'));
    expect(within(filas[0] as HTMLElement).getByRole('button', { name: 'Revisar' })).toBeDisabled();
    const comercios = screen.getAllByRole('listitem').find((li) => li.textContent?.includes('comercios por verificar')) as HTMLElement;
    await userEvent.click(within(comercios).getByRole('link', { name: 'Revisar' }));
    expect(await screen.findByText('LISTA COMERCIOS')).toBeInTheDocument();
  });

  it('un error muestra el estado de error con reintento', async () => {
    obtenerResumen.mockResolvedValueOnce({ ok: false, status: 500, title: 't', detail: 'Falla del servidor' });
    obtenerResumen.mockResolvedValueOnce({ ok: true, data: DATA });
    renderResumen();
    expect(await screen.findByText('No pudimos cargar el resumen')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('12.480')).toBeInTheDocument();
  });
});
