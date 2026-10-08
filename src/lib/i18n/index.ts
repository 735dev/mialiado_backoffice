import en from './locales/en.json';
import es from './locales/es.json';

export type Dictionary = { [key: string]: string | Dictionary };
export type Lang = 'es' | 'en';

/**
 * Cada feature aporta su propio `i18n/es.json` y `i18n/en.json` (src/pages/<feature>/i18n).
 * Se montan bajo `<feature>`: t('comercios.titulo'). Asi varias personas editan textos en paralelo
 * sin tocar los diccionarios comunes (src/lib/i18n/locales). Una feature no puede llamarse como una
 * clave comun (common, nav, errors...): lo vigila i18n.test.ts.
 */
const featureModules = import.meta.glob<Dictionary>('/src/pages/*/i18n/{es,en}.json', {
  eager: true,
  import: 'default',
});

const PATH_RE = /\/src\/pages\/([^/]+)\/i18n\/(es|en)\.json$/;

export function buildDictionaries(modules: Record<string, Dictionary>): Record<Lang, Dictionary> {
  const result: Record<Lang, Dictionary> = { es: { ...(es as Dictionary) }, en: { ...(en as Dictionary) } };
  for (const [path, dict] of Object.entries(modules)) {
    const match = PATH_RE.exec(path);
    if (!match) continue;
    const [, feature, lang] = match as unknown as [string, string, Lang];
    result[lang][feature] = dict;
  }
  return result;
}

export const dictionaries = buildDictionaries(featureModules);

export function getDeep(obj: Dictionary, path: string): string | undefined {
  let acc: string | Dictionary | undefined = obj;
  for (const key of path.split('.')) {
    if (acc === undefined || typeof acc === 'string') return undefined;
    acc = acc[key];
  }
  return typeof acc === 'string' ? acc : undefined;
}

/** Traduce una clave; admite "clave|3" (reemplaza {n}) y variables {nombre}. Si no es clave, devuelve el texto tal cual. */
export function translate(
  dict: Dictionary,
  keyOrText: string,
  vars?: Record<string, string | number>,
): string {
  if (keyOrText.includes('|')) {
    const [key = '', ...args] = keyOrText.split('|');
    const found = getDeep(dict, key) ?? key;
    return found.replace(/\{n\}/g, args[0] ?? '');
  }
  const value = getDeep(dict, keyOrText);
  if (value === undefined) return keyOrText;
  if (!vars) return value;
  return Object.entries(vars).reduce((text, [k, v]) => text.split(`{${k}}`).join(String(v)), value);
}
