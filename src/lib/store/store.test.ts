import { store } from './index';
import { logout, profileLoaded, signedIn, tokensRenewed } from './slices/authSlice';
import { setLang } from './slices/langSlice';
import { toggleTheme } from './slices/themeSlice';
import { hideInfoModal, showInfoModal } from './slices/uiSlice';

const user = { id: 1, nombre: 'Carlos', correo: 'a@b.co', role: 'admin' as const };

describe('store', () => {
  beforeEach(() => {
    store.dispatch(logout());
  });

  it('signedIn y logout', () => {
    store.dispatch(signedIn({ token: 't', user, permisos: null }));
    expect(store.getState().auth).toMatchObject({ token: 't', isAuthenticated: true });
    store.dispatch(logout());
    expect(store.getState().auth).toMatchObject({ token: null, isAuthenticated: false, user: null });
  });

  it('guarda permisos y los refresca con profileLoaded', () => {
    store.dispatch(signedIn({ token: 't', user, permisos: { resumen: { ver: true, editar: false, aprobar: false } } }));
    store.dispatch(profileLoaded({ user: { ...user, role: 'finanzas' }, permisos: { finanzas: { ver: true, editar: true, aprobar: true } } }));
    expect(store.getState().auth.user?.role).toBe('finanzas');
    expect(store.getState().auth.permisos).toEqual({ finanzas: { ver: true, editar: true, aprobar: true } });
    expect(store.getState().auth.token).toBe('t');
  });

  it('tokensRenewed cambia el par sin tocar el usuario', () => {
    store.dispatch(signedIn({ token: 't', refreshToken: 'r', user, permisos: null }));
    store.dispatch(tokensRenewed({ token: 't2', refreshToken: 'r2' }));
    expect(store.getState().auth).toMatchObject({ token: 't2', refreshToken: 'r2', isAuthenticated: true, user });
  });

  it('tema e idioma', () => {
    store.dispatch(setLang('en'));
    expect(store.getState().lang.current).toBe('en');
    store.dispatch(setLang('es'));
    const before = store.getState().theme.mode;
    store.dispatch(toggleTheme());
    expect(store.getState().theme.mode).toBe(before === 'dark' ? 'light' : 'dark');
  });

  it('ui abre y cierra el modal global', () => {
    store.dispatch(showInfoModal({ type: 'error', description: 'x', code: 500 }));
    expect(store.getState().ui.infoModal).toMatchObject({ open: true, type: 'error', code: 500 });
    store.dispatch(hideInfoModal());
    expect(store.getState().ui.infoModal.open).toBe(false);
  });

  it('persiste solo auth, theme y lang (ui nunca)', async () => {
    store.dispatch(signedIn({ token: 'persisted', user, permisos: null }));
    store.dispatch(showInfoModal({ type: 'warning', description: 'no se guarda' }));
    await new Promise((r) => setTimeout(r, 80));
    const raw = Object.entries(localStorage).find(([k]) => k.startsWith('persist:aliado-backoffice'))?.[1];
    expect(raw).toBeDefined();
    const saved = JSON.parse(raw as string) as Record<string, string>;
    expect(Object.keys(saved)).toEqual(expect.arrayContaining(['auth', 'theme', 'lang']));
    expect(saved).not.toHaveProperty('ui');
  });
});
