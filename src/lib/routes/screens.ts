import type { ScreenRoute } from './types';

/**
 * Todas las pantallas del panel. Cada feature (src/pages/<feature>/routes.ts) exporta `routes`; se descubren
 * solas con import.meta.glob, asi que una feature nueva NO obliga a tocar este archivo ni ningun otro comun.
 */
const modules = import.meta.glob<{ routes: ScreenRoute[] }>('/src/pages/*/routes.ts', { eager: true });

export function collectScreens(mods: Record<string, { routes: ScreenRoute[] }>): ScreenRoute[] {
  return Object.keys(mods)
    .sort()
    .flatMap((path) => mods[path]?.routes ?? []);
}

export const screens: ScreenRoute[] = collectScreens(modules);
