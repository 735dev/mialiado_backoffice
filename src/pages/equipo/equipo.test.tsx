import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DisplayMessage } from '@/components/feedback/DisplayMessage';
import { MODULOS } from '@/lib/constants/modules';
import { store } from '@/lib/store';
import { hideInfoModal } from '@/lib/store/slices/uiSlice';
import { renderWithProviders, resetStore, signInAs } from '@/test/utils';
import type { MatrizPermisos } from './models/equipo';
import { alternar, diferencias, normalizar } from './utils/permisos';
import EquipoView from './views/EquipoView';

const listar = vi.fn();
const invitar = vi.fn();
const actualizar = vi.fn();
const permisosGet = vi.fn();
const permisosPut = vi.fn();
vi.mock('@/pages/equipo/providers/equipoProvider', () => ({
  listarEquipo: (...a: unknown[]) => listar(...a),
  invitarMiembro: (...a: unknown[]) => invitar(...a),
  actualizarMiembro: (...a: unknown[]) => actualizar(...a),
  eliminarMiembro: async () => ({ ok: true, data: null }),
  restablecer2fa: async () => ({ ok: true, data: null }),
  obtenerPermisos: (...a: unknown[]) => permisosGet(...a),
  guardarPermisos: (...a: unknown[]) => permisosPut(...a),
}));

const miembro = (id: number, nombre: string, rol: string, estado: 'A' | 'P' | 'S', totp = true) => ({
  id,
  nombre,
  correo: `${nombre.split(' ')[0]?.toLowerCase()}@aliado.app`,
  rol,
  rol_etiqueta: rol,
  estado,
  estado_texto: '',
  totp_activo: totp,
  ultimo_acceso: '2026-10-06T17:00:00+00:00',
});

const MIEMBROS = [
  miembro(1, 'Carlos Mendoza', 'admin', 'A'),
  miembro(2, 'Laura Rojas', 'moderador', 'A'),
  miembro(5, 'Mariana Peña', 'soporte', 'A', false),
  miembro(6, 'José Cárdenas', 'finanzas', 'P', false),
];

const vacio = { ver: false, editar: false, aprobar: false };
function permisosBase(): { modulos: string[]; roles: unknown[]; permisos: MatrizPermisos; ultima_modificacion: unknown } {
  const rol = () => Object.fromEntries(MODULOS.map((m) => [m, { ...vacio, ver: m === 'resumen' }]));
  return {
    modulos: [...MODULOS],
    roles: [
      { rol: 'admin', etiqueta: 'Admin', miembros: 1 },
      { rol: 'moderador', etiqueta: 'Operaciones', miembros: 1 },
      { rol: 'finanzas', etiqueta: 'Finanzas', miembros: 1 },
      { rol: 'soporte', etiqueta: 'Soporte', miembros: 1 },
    ],
    permisos: { moderador: rol(), finanzas: rol(), soporte: rol() } as MatrizPermisos,
    ultima_modificacion: { por: 'Carlos Mendoza', fecha: '2026-09-28T17:00:00+00:00' },
  };
}

function pintar() {
  return renderWithProviders(
    <>
      <EquipoView />
      <DisplayMessage />
    </>,
    '/equipo',
  );
}

beforeEach(() => {
  resetStore();
  store.dispatch(hideInfoModal());
  window.matchMedia = ((q: string) => ({ matches: true, media: q, addEventListener: () => undefined, removeEventListener: () => undefined })) as unknown as typeof window.matchMedia;
  listar.mockReset().mockResolvedValue({ ok: true, data: { data: MIEMBROS, total: 4, resumen: { personas: 4, activas: 3, pendientes: 1 } } });
  invitar.mockReset().mockResolvedValue({ ok: true, data: { ...MIEMBROS[3], invitacion_token: 'tok-dev-123' } });
  actualizar.mockReset().mockResolvedValue({ ok: true, data: {} });
  permisosGet.mockReset().mockResolvedValue({ ok: true, data: permisosBase() });
  permisosPut.mockReset().mockResolvedValue({ ok: true, data: {} });
});

describe('B15 · logica de la matriz', () => {
  const base = normalizar(permisosBase().permisos, ['moderador', 'finanzas', 'soporte']);

  it('activar editar o aprobar activa ver; quitar ver quita editar y aprobar', () => {
    const conAprobar = alternar(base, 'soporte', 'comercios', 'aprobar');
    expect(conAprobar.soporte?.comercios).toEqual({ ver: true, editar: false, aprobar: true });
    const sinVer = alternar(conAprobar, 'soporte', 'comercios', 'ver');
    expect(sinVer.soporte?.comercios).toEqual({ ver: false, editar: false, aprobar: false });
  });

  it('solo se envian los roles y modulos que cambian', () => {
    const cambiada = alternar(base, 'finanzas', 'finanzas', 'editar');
    expect(diferencias(base, cambiada)).toEqual({ finanzas: { finanzas: { ver: true, editar: true, aprobar: false } } });
    expect(diferencias(base, base)).toEqual({});
  });
});

describe('B15 · pantalla', () => {
  it('lista los miembros con estado, resumen en singular/plural y marca a la persona de la sesion', async () => {
    signInAs('admin', null, 'Carlos Mendoza');
    pintar();
    expect((await screen.findAllByText('Laura Rojas')).length).toBeGreaterThan(0);
    expect(screen.getByText('4 personas · 3 activas · 1 invitación pendiente')).toBeInTheDocument();
    expect(screen.getAllByText('Sin acceso 2FA').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Invitación enviada').length).toBeGreaterThan(0);
  });

  it('la pestana Pendientes consulta por estado', async () => {
    signInAs('admin');
    pintar();
    await screen.findAllByText('Laura Rojas');
    await userEvent.click(screen.getByRole('button', { name: 'Pendientes' }));
    await waitFor(() => expect(listar).toHaveBeenCalledWith('pendientes'));
  });

  it('invitar valida el correo y envia la invitacion; en desarrollo muestra el codigo', async () => {
    signInAs('admin');
    pintar();
    await userEvent.click(await screen.findByRole('button', { name: 'Invitar miembro' }));
    const dialogo = await screen.findByRole('dialog');
    await userEvent.type(within(dialogo).getByLabelText('Nombres'), 'Ana');
    await userEvent.type(within(dialogo).getByLabelText('Apellidos'), 'Pérez');
    await userEvent.type(within(dialogo).getByLabelText('Correo'), 'no-es-correo');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Enviar invitación' }));
    expect(await within(dialogo).findByText('Correo inválido')).toBeInTheDocument();
    expect(invitar).not.toHaveBeenCalled();

    await userEvent.clear(within(dialogo).getByLabelText('Correo'));
    await userEvent.type(within(dialogo).getByLabelText('Correo'), 'ana.perez@aliado.app');
    await userEvent.click(within(dialogo).getByRole('button', { name: 'Enviar invitación' }));
    await waitFor(() => expect(invitar).toHaveBeenCalledWith({ correo: 'ana.perez@aliado.app', nombres: 'Ana', apellidos: 'Pérez', rol: 'soporte' }));
    expect(await within(dialogo).findByText('tok-dev-123')).toBeInTheDocument();
  });

  it('suspender pide confirmacion y manda estado S', async () => {
    signInAs('admin', null, 'Carlos Mendoza');
    pintar();
    await screen.findAllByText('Laura Rojas');
    await userEvent.click(screen.getAllByRole('button', { name: 'Suspender a Laura Rojas' })[0] as HTMLElement);
    const confirmacion = await screen.findByText(/¿Suspender a Laura Rojas\?/);
    expect(actualizar).not.toHaveBeenCalled();
    await userEvent.click(within(confirmacion.closest('[role="dialog"]') as HTMLElement).getByRole('button', { name: 'Confirmar' }));
    await waitFor(() => expect(actualizar).toHaveBeenCalledWith(2, { estado: 'S' }));
  });

  it('editar un permiso y guardar manda solo lo que cambio; Admin esta bloqueado', async () => {
    signInAs('admin');
    pintar();
    const editar = await screen.findByRole('checkbox', { name: 'Soporte: Comercios, editar' });
    expect(screen.getByRole('checkbox', { name: 'Admin: Comercios, ver' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Admin: Comercios, ver' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Guardar permisos' })).toBeDisabled();

    await userEvent.click(editar);
    expect(screen.getByRole('checkbox', { name: 'Soporte: Comercios, ver' })).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Guardar permisos' }));
    await waitFor(() => expect(permisosPut).toHaveBeenCalledWith({ soporte: { comercios: { ver: true, editar: true, aprobar: false } } }));
    await waitFor(() => expect(permisosGet).toHaveBeenCalledTimes(2));
  });

  it('descartar devuelve la matriz a lo guardado', async () => {
    signInAs('admin');
    pintar();
    const casilla = await screen.findByRole('checkbox', { name: 'Finanzas: Finanzas, aprobar' });
    await userEvent.click(casilla);
    expect(casilla).toBeChecked();
    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(casilla).not.toBeChecked();
    expect(permisosPut).not.toHaveBeenCalled();
  });

  it('sin permiso de editar no hay invitar, acciones ni casillas habilitadas', async () => {
    signInAs('soporte', { equipo: { ver: true, editar: false, aprobar: false } });
    pintar();
    await screen.findAllByText('Laura Rojas');
    expect(screen.queryByRole('button', { name: 'Invitar miembro' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Suspender a/ })).not.toBeInTheDocument();
    expect(await screen.findByRole('checkbox', { name: 'Soporte: Comercios, ver' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Guardar permisos' })).not.toBeInTheDocument();
  });
});
