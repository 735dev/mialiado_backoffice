# Arquitectura — `aliado_backoffice`

Panel web del equipo de Aliado: verificar comercios, moderar promociones, atender usuarios y soporte, finanzas, reportes y configuración. Sigue la estructura de `padelplay_backoffice`. Bitácora: [SESSIONS.md](SESSIONS.md).

## Qué es y qué no es

- Es un frontend independiente que consume `aliado_backend` en `/api/admin`.
- No comparte build con el backend ni con las apps móviles.
- Diseño de referencia: `aliado_prototipos/backoffice` (pantallas B01–B18).

## 1. Stack

| Paquete | Uso |
| --- | --- |
| React 19 + TypeScript (strict) | UI |
| Vite 5 | Dev server (5173) y build |
| react-router-dom 6 | Rutas |
| @tanstack/react-query 5 | Datos del servidor y caché |
| Tailwind 3 | Estilos, con colores mapeados a variables CSS |
| Vitest + Testing Library + jsdom | Pruebas |

HTTP con `fetch` nativo (`src/lib/api.ts`), sin axios.

## 2. Estructura

| Ruta | Contenido |
| --- | --- |
| `src/main.tsx` | QueryClient + BrowserRouter |
| `src/App.tsx` | Rutas: `/login` y una ruta por sección dentro de `AppShell` |
| `src/lib/api.ts` | Cliente HTTP, token Bearer en localStorage (`aliado_admin_token`) |
| `src/lib/secciones.ts` | Secciones del menú con su prototipo de referencia |
| `src/components/shell/` | Marco del panel (menú lateral) |
| `src/components/ui/` | Componentes base (Button, …) |
| `src/pages/` | Una página por sección |
| `src/styles/tokens.css` | Colores de Aliado, claro y oscuro (`.dark` en `<html>`) |
| `src/test/setup.ts` | Setup de Vitest |

Componentes y páginas en PascalCase `.tsx`; utilidades en camelCase `.ts`; pruebas junto al código (`*.test.tsx`).

## 3. Entorno

| Variable | Uso | Valor local |
| --- | --- | --- |
| `VITE_API_BASE` | Base de la API del panel | `/api/admin` |

En desarrollo, `vite.config.ts` envía `/api` a `http://localhost:5010` (aliado_backend). `.env.dev` y `.env.production` se versionan; `.env` y `.env.*.local` no.

## 4. Convenciones

- Textos de la interfaz en español, escritos desde el lado del usuario.
- Colores solo a través de tokens (`bg-primary`, `text-ink-muted`…), nunca hex sueltos.
- Cada sección nueva se agrega en `src/lib/secciones.ts` y obtiene su ruta automáticamente.

## 5. Notas para nuevos devs

```bash
npm install
npm run dev        # http://localhost:5173
npm test
npm run build      # tsc + vite build
```

Despliegue de ejemplo: `deploy/nginx.conf.example`.

## Deuda conocida

- El login aún no llama al backend ni pide el segundo factor (prototipo B01).
- Token en localStorage; evaluar cookie httpOnly cuando exista el login del panel.
