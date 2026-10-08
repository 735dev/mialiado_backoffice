import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import type { Arbol } from '../models/categoria';
import CategoriasView from './CategoriasView';

const listarCategorias = vi.fn();
const crearCategoria = vi.fn();
const actualizarCategoria = vi.fn();
const ordenarCategorias = vi.fn();
const eliminarCategoria = vi.fn();
vi.mock('../providers/categoriasProvider', () => ({
  listarCategorias: (...a: unknown[]) => listarCategorias(...a),
  crearCategoria: (...a: unknown[]) => crearCategoria(...a),
  actualizarCategoria: (...a: unknown[]) => actualizarCategoria(...a),
  ordenarCategorias: (...a: unknown[]) => ordenarCategorias(...a),
  eliminarCategoria: (...a: unknown[]) => eliminarCategoria(...a),
}));

const notifyFromApiError = vi.fn();
const toastSuccess = vi.fn();
vi.mock('@/lib/utils/notify', () => ({
  notify: { fromApiError: (e: unknown) => notifyFromApiError(e), toast: { success: (m: string) => toastSuccess(m) } },
}));

const ok = <T,>(data: T) => ({ ok: true as const, data });
const err = (status: number, detail: string) => ({ ok: false as const, status, title: 't', detail });

const sub = (id: number, parent: number, nombre: string, posicion: number, comercios: number, visible = true) => ({
  id,
  parent_id: parent,
  nombre,
  icono: null,
  posicion,
  visible,
  comercios,
});

const ARBOL: Arbol = {
  data: [
    {
      id: 1,
      parent_id: null,
      nombre: 'Comida y alimentos',
      icono: null,
      posicion: 0,
      visible: true,
      comercios: 41,
      subcategorias: [sub(2, 1, 'Restaurantes', 0, 38), sub(3, 1, 'Comida rápida', 1, 41), sub(4, 1, 'Postres', 2, 19, false)],
    },
    { id: 5, parent_id: null, nombre: 'Actividades', icono: null, posicion: 1, visible: true, comercios: 31, subcategorias: [sub(6, 5, 'Deportes', 0, 0)] },
    { id: 7, parent_id: null, nombre: 'Moda y calzado', icono: null, posicion: 2, visible: true, comercios: 11, subcategorias: [] },
  ],
  total_subcategorias: 4,
  total_comercios: 83,
};

function setViewport(wide: boolean) {
  window.matchMedia = ((query: string) =>
    ({ matches: wide, media: query, addEventListener: () => undefined, removeEventListener: () => undefined }) as unknown as MediaQueryList) as typeof window.matchMedia;
}

const fila = (id: number) => screen.getByTestId(`fila-${id}`);

beforeEach(() => {
  setViewport(true);
  resetStore();
  vi.clearAllMocks();
  signInAs('admin');
  listarCategorias.mockResolvedValue(ok(ARBOL));
  [crearCategoria, actualizarCategoria, ordenarCategorias, eliminarCategoria].forEach((m) => m.mockResolvedValue(ok({})));
});

describe('B11 Categorias', () => {
  it('muestra el arbol con totales, la primera categoria abierta y las ocultas marcadas', async () => {
    renderWithProviders(<CategoriasView />);
    expect(await screen.findByText('Comida y alimentos')).toBeInTheDocument();
    expect(screen.getByText(/4 subcategorías · 83 comercios/)).toBeInTheDocument();
    expect(screen.getByText('Comida rápida')).toBeInTheDocument();
    expect(screen.queryByText('Deportes')).not.toBeInTheDocument();
    expect(screen.getByText('Oculta')).toBeInTheDocument();
    expect(screen.getByText('Sin subcategorías · 11 comercios')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Expandir todo' }));
    expect(screen.getByText('Deportes')).toBeInTheDocument();
  });

  it('activar o desactivar una categoria llama al backend y recarga', async () => {
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    await userEvent.click(screen.getByRole('switch', { name: 'Mostrar Comida rápida en la app' }));
    await waitFor(() => expect(actualizarCategoria).toHaveBeenCalledWith(3, { visible: false }));
    expect(toastSuccess).toHaveBeenCalledWith('Comida rápida ahora está oculta');
    await waitFor(() => expect(listarCategorias).toHaveBeenCalledTimes(2));
  });

  it('subir una subcategoria manda el orden completo de sus hermanos', async () => {
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    await userEvent.click(screen.getByRole('button', { name: 'Subir Comida rápida' }));
    await waitFor(() =>
      expect(ordenarCategorias).toHaveBeenCalledWith([
        { id: 3, posicion: 0 },
        { id: 2, posicion: 1 },
        { id: 4, posicion: 2 },
      ]),
    );
  });

  it('arrastrar una categoria sobre otra del mismo nivel la reordena; entre niveles no hace nada', async () => {
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    const dataTransfer = { effectAllowed: '' };
    fireEvent.dragStart(fila(7), { dataTransfer });
    fireEvent.drop(fila(3), { dataTransfer });
    expect(ordenarCategorias).not.toHaveBeenCalled();
    fireEvent.dragStart(fila(7), { dataTransfer });
    fireEvent.drop(fila(1), { dataTransfer });
    await waitFor(() =>
      expect(ordenarCategorias).toHaveBeenCalledWith([
        { id: 7, posicion: 0 },
        { id: 1, posicion: 1 },
        { id: 5, posicion: 2 },
      ]),
    );
  });

  it('edita nombre y posicion con validacion y guarda cada cosa en su endpoint', async () => {
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    await userEvent.click(screen.getByRole('button', { name: 'Editar Comida rápida' }));
    const panel = await screen.findByRole('complementary', { name: 'Editor de categoría' });
    expect(within(panel).getByText('Editando subcategoría')).toBeInTheDocument();

    const nombre = within(panel).getByLabelText('Nombre');
    await userEvent.clear(nombre);
    await userEvent.click(within(panel).getByRole('button', { name: 'Guardar cambios' }));
    expect(await within(panel).findByText('Debe tener al menos 2 caracteres')).toBeInTheDocument();
    expect(actualizarCategoria).not.toHaveBeenCalled();

    await userEvent.type(nombre, 'Fast food');
    await userEvent.click(within(panel).getByRole('button', { name: 'Subir posición' }));
    await userEvent.click(within(panel).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(actualizarCategoria).toHaveBeenCalledWith(3, { nombre: 'Fast food' }));
    await waitFor(() =>
      expect(ordenarCategorias).toHaveBeenCalledWith([
        { id: 3, posicion: 0 },
        { id: 2, posicion: 1 },
        { id: 4, posicion: 2 },
      ]),
    );
  });

  it('una posicion fuera de rango no llega al backend', async () => {
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    await userEvent.click(screen.getByRole('button', { name: 'Editar Comida rápida' }));
    const panel = await screen.findByRole('complementary', { name: 'Editor de categoría' });
    const pos = within(panel).getByLabelText('Posición');
    await userEvent.clear(pos);
    await userEvent.type(pos, '9');
    await userEvent.click(within(panel).getByRole('button', { name: 'Guardar cambios' }));
    expect(await within(panel).findByText('Máximo 3')).toBeInTheDocument();
    expect(ordenarCategorias).not.toHaveBeenCalled();
  });

  it('crea una subcategoria dentro de una categoria principal', async () => {
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    await userEvent.click(screen.getByRole('button', { name: /Nueva categoría/ }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Cafetería');
    await userEvent.selectOptions(within(dialog).getByLabelText('Dentro de'), '1');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Icono heart' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear' }));
    await waitFor(() => expect(crearCategoria).toHaveBeenCalledWith({ nombre: 'Cafetería', icono: 'heart', parent_id: 1, visible: true }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('eliminar pide confirmacion; un 409 se avisa y la categoria sigue seleccionada', async () => {
    eliminarCategoria.mockResolvedValue(err(409, 'Tiene comercios'));
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    await userEvent.click(screen.getByRole('button', { name: 'Editar Comida rápida' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    const dialog = await screen.findByRole('dialog');
    expect(eliminarCategoria).not.toHaveBeenCalled();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(notifyFromApiError).toHaveBeenCalledWith(expect.objectContaining({ status: 409 })));
    expect(screen.getByRole('complementary', { name: 'Editor de categoría', hidden: true })).toBeInTheDocument();
  });

  it('eliminar con exito cierra el editor', async () => {
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    await userEvent.click(screen.getByRole('button', { name: 'Editar Comida rápida' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar' }));
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(eliminarCategoria).toHaveBeenCalledWith(3));
    await waitFor(() => expect(screen.queryByRole('complementary', { name: 'Editor de categoría' })).not.toBeInTheDocument());
  });

  it('sin permiso de editar es solo lectura', async () => {
    resetStore();
    signInAs('moderador', { categorias: { ver: true, editar: false, aprobar: false } });
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    expect(screen.queryByRole('button', { name: /Nueva categoría/ })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Mostrar Comida rápida en la app' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Subir Comida rápida' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Editar Comida rápida' }));
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument();
  });

  it('en movil el editor se abre en una hoja', async () => {
    setViewport(false);
    renderWithProviders(<CategoriasView />);
    await screen.findByText('Comida rápida');
    await userEvent.click(screen.getByRole('button', { name: 'Editar Comida rápida' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Editando subcategoría')).toBeInTheDocument();
  });

  it('si falla la carga ofrece reintentar', async () => {
    listarCategorias.mockResolvedValueOnce(err(500, 'x'));
    renderWithProviders(<CategoriasView />);
    expect(await screen.findByText('No pudimos cargar las categorías')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Comida y alimentos')).toBeInTheDocument();
  });
});
