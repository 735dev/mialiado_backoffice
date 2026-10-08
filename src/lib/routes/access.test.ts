import { SECCIONES } from '@/lib/secciones';
import { can, decideAccess, homePath } from './access';
import { ACCESS } from './types';

const soporte = {
  role: 'soporte' as const,
  isAuthenticated: true,
  permisos: {
    resumen: { ver: true, editar: false, aprobar: false },
    soporte: { ver: true, editar: true, aprobar: true },
  },
};

describe('can', () => {
  it('admin siempre puede, aunque la matriz no lo liste', () => {
    expect(can({ role: 'admin', permisos: null }, 'equipo', 'aprobar')).toBe(true);
  });
  it('el resto depende de la matriz del backend', () => {
    expect(can(soporte, 'soporte', 'editar')).toBe(true);
    expect(can(soporte, 'resumen', 'editar')).toBe(false);
    expect(can(soporte, 'finanzas')).toBe(false);
  });
  it('sin matriz cargada no hay permiso', () => {
    expect(can({ role: 'moderador', permisos: null }, 'resumen')).toBe(false);
  });
});

describe('decideAccess', () => {
  it('publica: siempre', () => {
    expect(decideAccess(ACCESS.public, { isAuthenticated: false, role: null, permisos: null })).toBe('allow');
  });
  it('sin sesion va a login', () => {
    expect(decideAccess(ACCESS.modulo('resumen'), { isAuthenticated: false, role: null, permisos: null })).toBe('login');
  });
  it('auth: cualquier persona del equipo', () => {
    expect(decideAccess(ACCESS.auth, soporte)).toBe('allow');
  });
  it('por modulo: permite o prohibe segun la matriz', () => {
    expect(decideAccess(ACCESS.modulo('soporte'), soporte)).toBe('allow');
    expect(decideAccess(ACCESS.modulo('finanzas'), soporte)).toBe('forbidden');
    expect(decideAccess(ACCESS.modulo('soporte', 'aprobar'), soporte)).toBe('allow');
    expect(decideAccess(ACCESS.modulo('resumen', 'editar'), soporte)).toBe('forbidden');
  });
  it('por rol: solo los roles indicados', () => {
    expect(decideAccess({ roles: ['admin'] }, soporte)).toBe('forbidden');
    expect(decideAccess({ roles: ['admin'] }, { isAuthenticated: true, role: 'admin', permisos: null })).toBe('allow');
  });
});

describe('homePath', () => {
  it('es la primera seccion visible del rol', () => {
    expect(homePath(soporte, SECCIONES, '/sin-permiso')).toBe('/resumen');
    expect(homePath({ role: 'soporte', permisos: { soporte: soporte.permisos.soporte } }, SECCIONES, '/sin-permiso')).toBe('/soporte');
  });
  it('sin ninguna seccion cae en B18', () => {
    expect(homePath({ role: 'finanzas', permisos: {} }, SECCIONES, '/sin-permiso')).toBe('/sin-permiso');
  });
});
