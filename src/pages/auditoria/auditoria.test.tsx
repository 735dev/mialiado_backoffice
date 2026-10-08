import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import { aConsulta, filtrosIniciales } from './schemas/filtrosSchema';
import { rangoDesde } from './utils/fechas';
import { tonoDeAccion } from './utils/format';
import AuditoriaView from './views/AuditoriaView';

const listar = vi.fn();
const obtener = vi.fn();
const exportar = vi.fn();
vi.mock('@/pages/auditoria/providers/auditoriaProvider', () => ({
  listarEventos: (...a: unknown[]) => listar(...a),
  obtenerEvento: (...a: unknown[]) => obtener(...a),
  exportarEventos: (...a: unknown[]) => exportar(...a),
  listarPersonas: async () => ({ ok: true, data: [{ id: 1, nombre: 'Carlos Mendoza' }, { id: 2, nombre: 'Laura Rojas' }] }),
}));

const evento = (id: number, accion: string, persona: string, modulo = 'Comercios') => ({
  id,
  codigo: `EVT-0210-44${id}`,
  accion,
  modulo,
  objeto_tipo: 'Promoción',
  objeto: 'Brownie con helado · Golos Postres',
  ip: '190.38.44.12',
  created_at: new Date().toISOString(),
  usuario_id: id,
  persona,
  rol: 'Operaciones',
});

function pagina(items: unknown[], total = items.length) {
  return { ok: true, data: { data: items, total, page: 1, limit: 10, links: { next: null, previous: null } } };
}

function matchMedia(ancha: boolean) {
  window.matchMedia = ((q: string) => ({ matches: ancha, media: q, addEventListener: () => undefined, removeEventListener: () => undefined })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  resetStore();
  matchMedia(true);
  listar.mockReset().mockResolvedValue(pagina([evento(1, 'Aprobó', 'Laura Rojas'), evento(2, 'Rechazó', 'Carlos Mendoza')], 248));
  obtener.mockReset().mockResolvedValue({
    ok: true,
    data: {
      ...evento(1, 'Editó', 'Carlos Mendoza', 'Niveles y reglas'),
      detalle: { sesion: 'Verificada con 2FA', version: 'v15' },
      cambios: [
        { campo: 'Ventana de anulación', antes: '15 min', despues: '30 min' },
        { campo: 'Recarga mínima', antes: 3, despues: 5 },
      ],
      dispositivo: 'Chrome 141 · macOS',
    },
  });
  exportar.mockReset().mockResolvedValue({ ok: true, data: new Blob(['a'], { type: 'text/csv' }) });
  URL.createObjectURL = vi.fn(() => 'blob:x');
  URL.revokeObjectURL = vi.fn();
});

describe('B16 · utilidades', () => {
  it('los rangos parten de hoy y un rango invertido no viaja al servidor', () => {
    expect(rangoDesde('ultimos7', '2026-10-08')).toBe('2026-10-02');
    expect(rangoDesde('hoy', '2026-10-08')).toBe('2026-10-08');
    const c = aConsulta({ ...filtrosIniciales, rango: 'personalizado', desde: '2026-10-10', hasta: '2026-10-01' }, '2026-10-08');
    expect(c.hasta).toBe('');
    expect(c.desde).toBe('2026-10-02T00:00:00-04:00');
    const ok = aConsulta({ ...filtrosIniciales, rango: 'personalizado', desde: '2026-10-01', hasta: '2026-10-05', persona: '2' }, '2026-10-08');
    expect(ok).toMatchObject({ desde: '2026-10-01T00:00:00-04:00', hasta: '2026-10-05T23:59:59-04:00', usuario_id: '2' });
  });

  it('el color de la accion distingue aprobar, rechazar y editar', () => {
    expect(tonoDeAccion('Aprobó')).toBe('ok');
    expect(tonoDeAccion('Rechazó')).toBe('err');
    expect(tonoDeAccion('Editó')).toBe('warn');
    expect(tonoDeAccion('Inició sesión')).toBe('neutral');
  });
});

describe('B16 · pantalla', () => {
  it('muestra el registro paginado con quien, accion, objeto e IP', async () => {
    signInAs('admin');
    renderWithProviders(<AuditoriaView />, '/auditoria');
    const tabla = within(await screen.findByRole('table'));
    expect(tabla.getByText('Laura Rojas')).toBeInTheDocument();
    expect(tabla.getByText('Aprobó')).toBeInTheDocument();
    expect(tabla.getAllByText('190.38.44.12')).toHaveLength(2);
    expect(screen.getByText('Mostrando 2 de 248 eventos')).toBeInTheDocument();
    expect(listar).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: expect.any(Number) }));
  });

  it('filtrar por persona, modulo y accion consulta con esos valores desde la pagina 1', async () => {
    signInAs('admin');
    renderWithProviders(<AuditoriaView />, '/auditoria');
    await screen.findByText(/Mostrando 2 de 248/);
    await userEvent.selectOptions(await screen.findByLabelText('Filtrar por persona'), 'Laura Rojas');
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por módulo'), 'Comercios');
    await userEvent.selectOptions(screen.getByLabelText('Filtrar por acción'), 'Aprobó');
    await waitFor(() =>
      expect(listar).toHaveBeenLastCalledWith(expect.objectContaining({ usuario_id: '2', modulo: 'Comercios', accion: 'Aprobó', page: 1 })),
    );
  });

  it('un rango personalizado muestra las fechas y manda desde y hasta', async () => {
    signInAs('admin');
    renderWithProviders(<AuditoriaView />, '/auditoria');
    await screen.findByText(/Mostrando 2 de 248/);
    await userEvent.selectOptions(screen.getByLabelText('Rango de fechas'), 'personalizado');
    await userEvent.type(screen.getByLabelText('Desde'), '2026-10-01');
    await userEvent.type(screen.getByLabelText('Hasta'), '2026-10-05');
    await waitFor(() =>
      expect(listar).toHaveBeenLastCalledWith(expect.objectContaining({ desde: '2026-10-01T00:00:00-04:00', hasta: '2026-10-05T23:59:59-04:00' })),
    );
  });

  it('la busqueda espera a que termines de escribir y manda q', async () => {
    signInAs('admin');
    renderWithProviders(<AuditoriaView />, '/auditoria');
    await screen.findByText(/Mostrando 2 de 248/);
    await userEvent.type(screen.getByLabelText('Buscar en el registro'), 'brownie');
    await waitFor(() => expect(listar).toHaveBeenLastCalledWith(expect.objectContaining({ q: 'brownie' })));
    expect(listar.mock.calls.filter((c) => (c[0] as { q: string }).q === 'b')).toHaveLength(0);
  });

  it('abrir un evento muestra el antes y despues, la version y el dispositivo', async () => {
    signInAs('admin');
    renderWithProviders(<AuditoriaView />, '/auditoria');
    await screen.findByText(/Mostrando 2 de 248/);
    await userEvent.click(screen.getAllByRole('button', { name: /Ver detalle del evento/ })[0] as HTMLElement);
    expect(await screen.findByText('Ventana de anulación')).toBeInTheDocument();
    expect(obtener).toHaveBeenCalledWith(1);
    const fila = screen.getByText('Ventana de anulación').closest('tr') as HTMLElement;
    expect(within(fila).getByText('15 min')).toBeInTheDocument();
    expect(within(fila).getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('v15')).toBeInTheDocument();
    expect(screen.getByText('Chrome 141 · macOS')).toBeInTheDocument();
  });

  it('en movil el registro se vuelve tarjetas', async () => {
    matchMedia(false);
    signInAs('admin');
    renderWithProviders(<AuditoriaView />, '/auditoria');
    await screen.findByText(/Mostrando 2 de 248/);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2);
  });

  it('exportar baja el CSV por apiAxios con los filtros vigentes y lo guarda desde un blob', async () => {
    signInAs('admin');
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    renderWithProviders(<AuditoriaView />, '/auditoria');
    await screen.findByText(/Mostrando 2 de 248/);
    await userEvent.click(screen.getByRole('button', { name: 'Exportar registro' }));
    await waitFor(() => expect(exportar).toHaveBeenCalledWith(expect.objectContaining({ hasta: '', q: '' })));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect((click.mock.contexts[0] as HTMLAnchorElement).download).toMatch(/^auditoria-\d{4}-\d{2}-\d{2}\.csv$/);
    click.mockRestore();
  });

  it('sin eventos muestra el estado vacio', async () => {
    listar.mockResolvedValue(pagina([], 0));
    signInAs('admin');
    renderWithProviders(<AuditoriaView />, '/auditoria');
    expect(await screen.findByText('No hay eventos con estos filtros')).toBeInTheDocument();
  });
});
