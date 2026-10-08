import { buildDictionaries, dictionaries, getDeep, translate } from './index';

describe('translate', () => {
  const dict = { a: { b: 'Hola {name}', min: 'Minimo {n}' } };

  it('resuelve claves anidadas y variables', () => {
    expect(translate(dict, 'a.b', { name: 'Ali' })).toBe('Hola Ali');
  });
  it('admite clave|n', () => {
    expect(translate(dict, 'a.min|3')).toBe('Minimo 3');
  });
  it('devuelve el texto tal cual si no es clave', () => {
    expect(translate(dict, 'Texto libre')).toBe('Texto libre');
  });
  it('getDeep no confunde nodos con textos', () => {
    expect(getDeep(dict, 'a')).toBeUndefined();
  });
});

const keys = (o: object, p = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v as object, `${p}${k}.`) : [`${p}${k}`]));

describe('buildDictionaries', () => {
  it('monta los i18n de cada feature bajo su nombre', () => {
    const d = buildDictionaries({
      '/src/pages/comercios/i18n/es.json': { title: 'Comercios' },
      '/src/pages/comercios/i18n/en.json': { title: 'Merchants' },
      '/otra/ruta/es.json': { x: 'ignorado' },
    });
    expect(getDeep(d.es, 'comercios.title')).toBe('Comercios');
    expect(getDeep(d.en, 'comercios.title')).toBe('Merchants');
    expect(getDeep(d.es, 'x')).toBeUndefined();
  });

  it('los diccionarios reales tienen las mismas claves en es y en', () => {
    expect(keys(dictionaries.en).sort()).toEqual(keys(dictionaries.es).sort());
  });

  it('ninguna feature se llama como una clave comun (la pisaria)', () => {
    const common = ['common', 'nav', 'roles', 'pagination', 'placeholder', 'errors', 'theme', 'lang'];
    const pages = import.meta.glob('/src/pages/*/i18n/es.json');
    for (const path of Object.keys(pages)) {
      const feature = /\/src\/pages\/([^/]+)\//.exec(path)?.[1] ?? '';
      expect(common, `la feature ${feature} usa un nombre reservado`).not.toContain(feature);
    }
  });
});
