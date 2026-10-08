// Unico lugar que lee import.meta.env (lo vigila architecture.test.ts).
export const env = {
  /** Base de la API del backoffice. En desarrollo Vite envia /api a aliado_backend (5010). */
  apiBase: (import.meta.env.VITE_API_BASE as string | undefined)?.trim() || '/api/admin',
  limit: Number(import.meta.env.VITE_PUBLIC_LIMIT ?? 10),
  defaultLang: (import.meta.env.VITE_PUBLIC_DEFAULT_LANG ?? 'es') as 'es' | 'en',
  defaultTheme: (import.meta.env.VITE_PUBLIC_DEFAULT_THEME ?? 'system') as 'light' | 'dark' | 'system',
  timeoutMs: Number(import.meta.env.VITE_PUBLIC_TIMEOUT_MS ?? 15000),
  isDev: import.meta.env.DEV,
} as const;
