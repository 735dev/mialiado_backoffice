import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import { reporteInicial, reporteSchema } from './schemas/reporteSchemas';
import { nombreSeguro } from './utils/descarga';
import { rangoRapido } from './utils/format';
import ReportesView from './views/ReportesView';

const columnas = vi.fn();
const estimar = vi.fn();
const generar = vi.fn();
const listar = vi.fn();
const descargar = vi.fn();
const crearProg = vi.fn();
const listarProg = vi.fn();
vi.mock('@/pages/reportes/providers/reportesProvider', () => ({
  obtenerColumnas: (...a: unknown[]) => columnas(...a),
  estimarReporte: (...a: unknown[]) => estimar(...a),
  generarReporte: (...a: unknown[]) => generar(...a),
  listarReportes: (...a: unknown[]) => listar(...a),
  descargarReporte: (...a: unknown[]) => descargar(...a),
  crearProgramado: (...a: unknown[]) => crearProg(...a),
  listarProgramados: (...a: unknown[]) => listarProg(...a),
  borrarProgramado: async () => ({ ok: true, data: null }),
  listarCategorias: async () => ({ ok: true, data: [{ id: 1, nombre: 'Comida', subcategorias: [{ id: 2, nombre: 'Restaurantes' }] }] }),
  listarZonas: async () => ({ ok: true, data: [{ id: 1, nombre: 'Cordero' }] }),
}));

const CATALOGO = {
  columnas: {
    canjes: ['folio', 'comercio', 'usuario', 'cajero'],
    comercios: ['id', 'nombre'],
    usuarios: ['id'],
    recargas: ['referencia'],
    impulsos: ['id'],
    valoraciones: ['comercio'],
  },
  por_defecto: {
    canjes: ['folio', 'comercio', 'usuario'],
    comercios: ['id', 'nombre'],
    usuarios: ['id'],
    recargas: ['referencia'],
    impulsos: ['id'],
    valoraciones: ['comercio'],
  },
};

const listo = { id: 7, nombre: 'Canjes de septiembre', tipo: 'canjes', formato: 'xlsx', estado: 'listo', filas: 10, bytes: 1_500_000, created_at: '2026-10-07T13:12:00+00:00' };
const fallo = { id: 8, nombre: 'Impulsos del trimestre', tipo: 'impulsos', formato: 'csv', estado: 'fallo', filas: null, bytes: null, created_at: '2026-09-29T13:12:00+00:00' };

beforeEach(() => {
  resetStore();
  columnas.mockReset().mockResolvedValue({ ok: true, data: CATALOGO });
  estimar.mockReset().mockResolvedValue({ ok: true, data: { filas: 3912, columnas: 3, bytes_aprox: 1_468_006 } });
  generar.mockReset().mockResolvedValue({ ok: true, data: { ...listo, id: 9, nombre: 'Canjes' } });
  listar.mockReset().mockResolvedValue({ ok: true, data: { data: [listo, fallo], total: 2, page: 1, limit: 6, links: { next: null, previous: null } } });
  descargar.mockReset().mockResolvedValue({ ok: true, data: new Blob(['a,b'], { type: 'text/csv' }) });
  crearProg.mockReset().mockResolvedValue({ ok: true, data: {} });
  listarProg.mockReset().mockResolvedValue({
    ok: true,
    data: [{ id: 1, nombre: 'Canjes por comercio', tipo: 'canjes', formato: 'xlsx', frecuencia: 'semanal', dia: 0, hora: '08:00', destinatario: 'laura@aliado.app', activo: true, columnas: null }],
  });
  URL.createObjectURL = vi.fn(() => 'blob:prueba');
  URL.revokeObjectURL = vi.fn();
});

describe('B14 · utilidades', () => {
  it('el nombre de descarga se sanea (sin rutas ni caracteres peligrosos) y lleva la extension del formato', () => {
    const ruta = nombreSeguro('../../etc/passwd', 'csv');
    expect(ruta).not.toMatch(/[/\\]/);
    expect(ruta).not.toContain('..');
    expect(ruta.endsWith('.csv')).toBe(true);
    expect(nombreSeguro('Canjes de septiembre', 'xlsx')).toBe('Canjes de septiembre.xlsx');
    expect(nombreSeguro('Año <script>.exe', 'csv')).toBe('Ano _script_.exe.csv');
    expect(nombreSeguro('', 'xlsx')).toBe('reporte.xlsx');
  });

  it('los rangos rapidos parten de la fecha de hoy', () => {
    expect(rangoRapido('ultimos7', '2026-10-08')).toEqual({ desde: '2026-10-02', hasta: '2026-10-08' });
    expect(rangoRapido('esteMes', '2026-10-08')).toEqual({ desde: '2026-10-01', hasta: '2026-10-08' });
    expect(rangoRapido('mesAnterior', '2026-10-08')).toEqual({ desde: '2026-09-01', hasta: '2026-09-30' });
    expect(rangoRapido('ultimos90', '2026-10-08').desde).toBe('2026-07-11');
  });

  it('PDF y un rango invertido no validan', () => {
    const base = { ...reporteInicial, columnas: ['folio'] };
    const pdf = reporteSchema.safeParse({ ...base, formato: 'pdf' });
    expect(!pdf.success && pdf.error.issues[0]?.message).toBe('reportes.errors.pdf');
    const rango = reporteSchema.safeParse({ ...base, desde: '2026-10-10', hasta: '2026-10-01' });
    expect(!rango.success && rango.error.issues[0]?.message).toBe('reportes.errors.rango');
    expect(reporteSchema.safeParse(base).success).toBe(true);
  });
});

describe('B14 · pantalla', () => {
  it('marca las columnas por defecto, estima el reporte y deja PDF deshabilitado con aviso', async () => {
    signInAs('admin');
    renderWithProviders(<ReportesView />, '/reportes');
    await waitFor(() => expect(screen.getByLabelText('Folio')).toBeChecked());
    expect(screen.getByLabelText('Cajero')).not.toBeChecked();
    expect(await screen.findByText(/3\.912 filas estimadas · 3 columnas/)).toBeInTheDocument();
    const pdf = screen.getByRole('button', { name: 'PDF' });
    expect(pdf).toBeDisabled();
    expect(pdf).toHaveAccessibleDescription(/PDF aún no está disponible/);
  });

  it('generar manda el cuerpo con tipo, formato y columnas, y recarga las descargas', async () => {
    signInAs('admin');
    renderWithProviders(<ReportesView />, '/reportes');
    await userEvent.click(await screen.findByLabelText('Cajero'));
    await userEvent.click(screen.getByRole('button', { name: 'Generar reporte' }));
    await waitFor(() =>
      expect(generar).toHaveBeenCalledWith(expect.objectContaining({ tipo: 'canjes', formato: 'xlsx', columnas: ['folio', 'comercio', 'usuario', 'cajero'] })),
    );
    await waitFor(() => expect(listar.mock.calls.length).toBeGreaterThan(1));
  });

  it('sin columnas no genera y pide elegir al menos una', async () => {
    signInAs('admin');
    renderWithProviders(<ReportesView />, '/reportes');
    for (const c of ['Folio', 'Comercio', 'Usuario']) await userEvent.click(await screen.findByLabelText(c));
    await userEvent.click(screen.getByRole('button', { name: 'Generar reporte' }));
    expect(await screen.findByText('Elige al menos una columna')).toBeInTheDocument();
    expect(generar).not.toHaveBeenCalled();
  });

  it('descarga por apiAxios y guarda con nombre saneado desde una URL blob', async () => {
    signInAs('admin');
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    renderWithProviders(<ReportesView />, '/reportes');
    await userEvent.click(await screen.findByRole('button', { name: 'Descargar Canjes de septiembre' }));
    await waitFor(() => expect(descargar).toHaveBeenCalledWith(7));
    await waitFor(() => expect(click).toHaveBeenCalled());
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    const ancla = click.mock.contexts[0] as HTMLAnchorElement;
    expect(ancla.download).toBe('Canjes de septiembre.xlsx');
    expect(ancla.href).toBe('blob:prueba');
    click.mockRestore();
  });

  it('un reporte fallido no se descarga: ofrece generarlo de nuevo', async () => {
    signInAs('admin');
    renderWithProviders(<ReportesView />, '/reportes');
    expect(await screen.findByText('Falló')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descargar Impulsos del trimestre' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Generar de nuevo Impulsos del trimestre' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Impulsos' }));
    expect(screen.getByRole('button', { name: 'Impulsos' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('programar un reporte semanal manda la frecuencia, el dia y el destinatario', async () => {
    signInAs('admin');
    renderWithProviders(<ReportesView />, '/reportes');
    expect(await screen.findByText(/Cada lunes/i)).toBeInTheDocument();
    await userEvent.click(await screen.findByRole('button', { name: 'Programar envío' }));
    const dialogo = await screen.findByRole('dialog');
    await userEvent.type(within(dialogo).getByLabelText('Nombre'), 'Recargas del viernes');
    await userEvent.type(within(dialogo).getByLabelText('Enviar a'), 'finanzas@aliado.app');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Programar' }));
    await waitFor(() =>
      expect(crearProg).toHaveBeenCalledWith(
        expect.objectContaining({ nombre: 'Recargas del viernes', frecuencia: 'semanal', dia: 0, hora: '08:00', destinatario: 'finanzas@aliado.app', formato: 'xlsx' }),
      ),
    );
  });

  it('un rol sin editar puede descargar pero no ve generar ni programar', async () => {
    signInAs('soporte', { reportes: { ver: true, editar: false, aprobar: false } });
    renderWithProviders(<ReportesView />, '/reportes');
    expect(await screen.findByRole('button', { name: 'Descargar Canjes de septiembre' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Generar reporte' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nuevo' })).not.toBeInTheDocument();
  });
});
