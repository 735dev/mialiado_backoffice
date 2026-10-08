import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(__dirname);

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    return e.isDirectory() ? walk(full) : [full];
  });
}

const all = walk(SRC);
const files = all.filter((f) => /\.(ts|tsx)$/.test(f));
const rel = (f: string) => path.relative(SRC, f).replace(/\\/g, '/');
const read = (f: string) => fs.readFileSync(f, 'utf8');
/** Codigo sin comentarios (los comentarios pueden nombrar lo prohibido). */
const code = (f: string) => read(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const isTest = (f: string) => /\.test\.tsx?$/.test(f);

const features = fs
  .readdirSync(path.join(SRC, 'pages'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

describe('reglas de arquitectura', () => {
  it('ningun archivo supera 1000 lineas', () => {
    const big = all.filter((f) => /\.(ts|tsx|json|css)$/.test(f) && read(f).split('\n').length > 1000).map(rel);
    expect(big).toEqual([]);
  });

  it('axios solo se importa en src/lib/api (y en tipos)', () => {
    const offenders = files.filter(
      (f) => !rel(f).startsWith('lib/api/') && !isTest(f) && /^import (?!type).*from ['"]axios['"]/m.test(read(f)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('nadie llama fetch directo: todo HTTP pasa por apiAxios', () => {
    const offenders = files.filter((f) => !isTest(f) && /(?<![.\w])fetch\(/.test(read(f)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('nadie lee import.meta.env fuera de env.ts y vite-env', () => {
    const offenders = files.filter(
      (f) => !['lib/config/env.ts', 'vite-env.d.ts', 'architecture.test.ts'].includes(rel(f)) && /import\.meta\.env/.test(read(f)),
    );
    expect(offenders.map(rel)).toEqual([]);
  });

  it('localStorage/sessionStorage solo los toca redux-persist (store) y las pruebas', () => {
    const offenders = files.filter((f) => !isTest(f) && !rel(f).startsWith('test/') && /\b(localStorage|sessionStorage)\b/.test(read(f)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('el codigo no usa alert, prompt ni confirm del navegador', () => {
    const offenders = files.filter((f) => !isTest(f) && /(?<![.\w])(alert|prompt|confirm)\(|window\.(alert|prompt|confirm)\(/.test(code(f)));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('no hay imports cruzados entre features (alias ni rutas relativas)', () => {
    const offenders: string[] = [];
    for (const f of files.filter((x) => rel(x).startsWith('pages/') && !isTest(x))) {
      const feature = rel(f).split('/')[1] as string;
      for (const m of read(f).matchAll(/from ['"]@\/pages\/([^/'"]+)/g)) {
        if (m[1] !== feature) offenders.push(`${rel(f)} -> ${m[0]}`);
      }
      // Una ruta relativa que sale de la carpeta de la feature tambien es un cruce.
      for (const m of read(f).matchAll(/from ['"](\.\.?\/[^'"]*)['"]/g)) {
        const target = path.resolve(path.dirname(f), m[1] as string);
        if (!target.startsWith(path.join(SRC, 'pages', feature))) offenders.push(`${rel(f)} -> ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('lib, components y providers no dependen de pages/', () => {
    const offenders = files.filter((f) => /^(lib|components|providers)\//.test(rel(f)) && /from ['"]@\/pages\//.test(read(f)) && !isTest(f));
    expect(offenders.map(rel)).toEqual([]);
  });

  it('cada feature tiene routes.ts e i18n es/en con las mismas claves', () => {
    expect(features.length).toBeGreaterThan(0);
    const keys = (o: object, p = ''): string[] =>
      Object.entries(o).flatMap(([k, v]) => (typeof v === 'object' ? keys(v as object, `${p}${k}.`) : [`${p}${k}`]));
    for (const feature of features) {
      const dir = path.join(SRC, 'pages', feature);
      expect(fs.existsSync(path.join(dir, 'routes.ts')), `${feature}/routes.ts`).toBe(true);
      const es = path.join(dir, 'i18n/es.json');
      const en = path.join(dir, 'i18n/en.json');
      expect(fs.existsSync(es), `${feature}/i18n/es.json`).toBe(true);
      expect(fs.existsSync(en), `${feature}/i18n/en.json`).toBe(true);
      expect(keys(JSON.parse(read(en))).sort(), `claves de ${feature}`).toEqual(keys(JSON.parse(read(es))).sort());
    }
  });
});
