import { MODULOS } from '@/lib/constants/modules';
import { SECCIONES } from '@/lib/secciones';
import { PATHS, buildPath } from './paths';
import { screens } from './screens';

/** B17 (Rechazar con motivo) es un modal de B07, no una ruta. */
const CODES = ['B01', 'B02', 'B03', 'B04', 'B05', 'B06', 'B07', 'B08', 'B09', 'B10', 'B11', 'B12', 'B13', 'B14', 'B15', 'B16', 'B18'];

describe('mapa de pantallas', () => {
  it('estan todas las pantallas B01-B16 y B18', () => {
    expect(screens.map((s) => s.code).sort()).toEqual([...CODES].sort());
  });

  it('no hay rutas ni codigos repetidos', () => {
    const paths = screens.map((s) => s.path);
    expect(new Set(paths).size).toBe(paths.length);
    const codes = screens.map((s) => s.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('cada vista exporta un routeName igual a su ruta', async () => {
    for (const s of screens) {
      const mod = await s.load();
      expect(mod.routeName, `${s.code} (${s.path})`).toBe(s.path);
      expect(typeof mod.default).toBe('function');
    }
  });

  it('toda ruta declarada en PATHS tiene pantalla', () => {
    const paths = new Set(screens.map((s) => s.path));
    for (const p of Object.values(PATHS)) expect(paths.has(p), p).toBe(true);
  });

  it('las 13 secciones del menu son los 13 modulos del backend y apuntan a una pantalla de ese modulo', () => {
    expect(SECCIONES).toHaveLength(13);
    expect(SECCIONES.map((s) => s.id).sort()).toEqual([...MODULOS].sort());
    for (const sec of SECCIONES) {
      const screen = screens.find((s) => s.path === sec.ruta);
      expect(screen?.code, sec.id).toBe(sec.pantalla);
      expect(screen?.access, sec.id).toMatchObject({ modulo: sec.id, accion: 'ver' });
    }
  });

  it('buildPath reemplaza parametros', () => {
    expect(buildPath(PATHS.comercio, { id: 7 })).toBe('/comercios/7');
  });
});
